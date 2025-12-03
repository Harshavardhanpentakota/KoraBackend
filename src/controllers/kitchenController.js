const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

// @desc    Get all orders for kitchen
// @route   GET /api/kitchen/orders
// @access  Private/Kitchen/Admin
const getKitchenOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = {
      status: { $in: ['pending', 'accepted', 'preparing'] }
    };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('table', 'tableNumber')
      .sort('createdAt');
    
    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order: order._id })
          .populate('item', 'name preparationTime');
        
        return {
          ...order.toObject(),
          items
        };
      })
    );
    
    res.json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order items for kitchen
// @route   GET /api/kitchen/order-items
// @access  Private/Kitchen/Admin
const getKitchenOrderItems = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    // Get orders that are pending, accepted or preparing
    const orders = await Order.find({
      status: { $in: ['pending', 'accepted', 'preparing'] }
    }).select('_id orderNumber table');
    
    const orderIds = orders.map(o => o._id);
    
    let query = {
      order: { $in: orderIds }
    };
    
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['pending', 'preparing'] };
    }
    
    const orderItems = await OrderItem.find(query)
      .populate('item', 'name preparationTime')
      .populate({
        path: 'order',
        select: 'orderNumber table orderType',
        populate: {
          path: 'table',
          select: 'tableNumber'
        }
      })
      .sort('createdAt');
    
    res.json({
      success: true,
      count: orderItems.length,
      data: orderItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order item status
// @route   PUT /api/kitchen/order-items/:id/status
// @access  Private/Kitchen/Admin
const updateOrderItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'preparing', 'ready', 'served'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const orderItem = await OrderItem.findById(req.params.id);
    
    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: 'Order item not found'
      });
    }

    orderItem.status = status;
    await orderItem.save();

    // Check if all items are ready, then update order status
    const allItems = await OrderItem.find({ order: orderItem.order });
    const allReady = allItems.every(item => item.status === 'ready' || item.status === 'served');
    
    if (allReady) {
      await Order.findByIdAndUpdate(orderItem.order, { status: 'ready' });
    } else if (status === 'preparing') {
      await Order.findByIdAndUpdate(orderItem.order, { status: 'preparing' });
    }

    await orderItem.populate('item', 'name');
    await orderItem.populate('order', 'orderNumber');

    res.json({
      success: true,
      data: orderItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get kitchen statistics
// @route   GET /api/kitchen/stats
// @access  Private/Kitchen/Admin
const getKitchenStats = async (req, res, next) => {
  try {
    const activeOrders = await Order.countDocuments({
      status: { $in: ['pending', 'accepted', 'preparing'] }
    });

    const pendingItems = await OrderItem.countDocuments({
      status: 'pending'
    });

    const preparingItems = await OrderItem.countDocuments({
      status: 'preparing'
    });

    const readyItems = await OrderItem.countDocuments({
      status: 'ready'
    });

    // Get average preparation time for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const completedItems = await OrderItem.find({
      status: 'served',
      updatedAt: { $gte: startOfDay }
    });

    res.json({
      success: true,
      data: {
        activeOrders,
        pendingItems,
        preparingItems,
        readyItems,
        completedToday: completedItems.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKitchenOrders,
  getKitchenOrderItems,
  updateOrderItemStatus,
  getKitchenStats
};
