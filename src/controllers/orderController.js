const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Item = require('../models/Item');
const Table = require('../models/Table');
const Transaction = require('../models/Transaction');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res, next) => {
  try {
    const { items, table, customerName, customerPhone, orderType, notes } = req.body;

    // Validate items and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const orderItem of items) {
      const item = await Item.findById(orderItem.item);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item with id ${orderItem.item} not found`
        });
      }

      if (!item.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Item ${item.name} is not available`
        });
      }

      const itemTotal = item.price * orderItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        item: item._id,
        quantity: orderItem.quantity,
        price: item.price,
        notes: orderItem.notes || ''
      });
    }

    // Calculate tax and total (assuming 5% tax)
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Validate table for dine-in orders
    if (table && (orderType === 'dine-in' || !orderType)) {
      const tableDoc = await Table.findById(table);
      
      if (!tableDoc) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      if (!tableDoc.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Table is not active'
        });
      }

      if (tableDoc.currentOrder) {
        return res.status(400).json({
          success: false,
          message: 'Table already has an active order',
          currentOrder: tableDoc.currentOrder
        });
      }
    }

    // Create order
    const order = await Order.create({
      customerName,
      customerPhone,
      table,
      orderType: orderType || 'dine-in',
      subtotal,
      tax,
      total,
      notes
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order: order._id,
        ...item
      });
    }

    // Update table status and link order for dine-in
    if (table && (orderType === 'dine-in' || !orderType)) {
      await Table.findByIdAndUpdate(table, { 
        status: 'occupied',
        currentOrder: order._id
      });
    }

    // Fetch complete order with items
    const completeOrder = await Order.findById(order._id)
      .populate('table', 'tableNumber')
      .populate({
        path: 'acceptedBy',
        select: 'name email'
      });

    const items_data = await OrderItem.find({ order: order._id })
      .populate('item', 'name price');

    res.status(201).json({
      success: true,
      data: {
        order: completeOrder,
        items: items_data
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const { status, orderType, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (orderType) {
      query.orderType = orderType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    const orders = await Order.find(query)
      .populate('table', 'tableNumber')
      .populate('acceptedBy', 'name email')
      .sort('-createdAt');
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('table', 'tableNumber')
      .populate('acceptedBy', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const items = await OrderItem.find({ order: order._id })
      .populate('item', 'name price image');

    res.json({
      success: true,
      data: {
        order,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Cashier
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'accepted') {
      order.acceptedBy = req.user._id;
      order.acceptedAt = Date.now();
    }

    if (status === 'completed') {
      order.completedAt = Date.now();
      
      // Update table status and clear order reference if dine-in
      if (order.table && order.orderType === 'dine-in') {
        await Table.findByIdAndUpdate(order.table, { 
          status: 'free',
          currentOrder: null
        });
      }
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed order'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Update table status and clear order reference if dine-in
    if (order.table && order.orderType === 'dine-in') {
      await Table.findByIdAndUpdate(order.table, { 
        status: 'free',
        currentOrder: null
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by table
// @route   GET /api/orders/table/:tableId
// @access  Private
const getOrderByTable = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      table: req.params.tableId,
      status: { $nin: ['completed', 'cancelled', 'paid'] }
    })
      .populate('table', 'tableNumber name seats')
      .populate('acceptedBy', 'name email')
      .sort('-createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'No active order found for this table'
      });
    }

    const items = await OrderItem.find({ order: order._id })
      .populate('item', 'name price image category');

    res.json({
      success: true,
      data: {
        order,
        items
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment for order
// @route   PUT /api/orders/:id/pay
// @access  Private/Cashier
const processOrderPayment = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order already paid'
      });
    }

    // Update order
    order.paymentMethod = paymentMethod;
    order.paymentStatus = 'paid';
    order.status = 'paid';
    order.paidAt = Date.now();
    await order.save();

    // Create transaction record
    const transaction = await Transaction.create({
      order: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentMethod,
      type: 'sale',
      status: 'completed',
      transactionId: transactionId || `TXN-${Date.now()}`,
      processedBy: req.user._id,
      notes: notes || ''
    });

    // Update table status and clear order reference for dine-in
    if (order.table && order.orderType === 'dine-in') {
      await Table.findByIdAndUpdate(order.table, { 
        status: 'free',
        currentOrder: null 
      });
    }

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('processedBy', 'name email');

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order,
        transaction: populatedTransaction
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderByTable,
  processOrderPayment
};
