const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const Table = require('../models/Table');

// @desc    Get all orders for cashier
// @route   GET /api/cashier/orders
// @access  Private/Cashier/Admin
const getCashierOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    } else {
      // Default: show orders that need cashier attention
      query.status = { $in: ['accepted', 'ready'] };
    }
    
    const orders = await Order.find(query)
      .populate('table', 'tableNumber')
      .populate('acceptedBy', 'name')
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

// @desc    Get order details for cashier
// @route   GET /api/cashier/orders/:id
// @access  Private/Cashier/Admin
const getCashierOrderDetails = async (req, res, next) => {
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

    const payments = await Payment.find({ order: order._id })
      .populate('processedBy', 'name');

    res.json({
      success: true,
      data: {
        order,
        items,
        payments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment
// @route   POST /api/cashier/orders/:id/pay
// @access  Private/Cashier/Admin
const processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, amount, transactionId, notes } = req.body;
    
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
        message: 'Order is already completed'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      amount: amount || order.total,
      paymentMethod,
      transactionId,
      processedBy: req.user._id,
      notes,
      status: 'completed'
    });

    // Don't auto-complete order, cashier must explicitly close it
    await payment.populate('processedBy', 'name email');

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close order (mark as completed)
// @route   POST /api/cashier/orders/:id/close
// @access  Private/Cashier/Admin
const closeOrder = async (req, res, next) => {
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
        message: 'Order is already completed'
      });
    }

    // Check if payment exists
    const payment = await Payment.findOne({ 
      order: order._id, 
      status: 'completed' 
    });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'Cannot close order without payment'
      });
    }

    order.status = 'completed';
    order.completedAt = Date.now();
    await order.save();

    // Update table status if dine-in
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily sales summary
// @route   GET /api/cashier/summary
// @access  Private/Cashier/Admin
const getDailySummary = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const completedOrders = orders.filter(o => o.status === 'completed');
    
    const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const totalTax = completedOrders.reduce((sum, order) => sum + order.tax, 0);
    const totalDiscount = completedOrders.reduce((sum, order) => sum + order.discount, 0);

    const payments = await Payment.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'completed'
    });

    const paymentBreakdown = {
      cash: 0,
      card: 0,
      upi: 0,
      wallet: 0
    };

    payments.forEach(payment => {
      paymentBreakdown[payment.paymentMethod] += payment.amount;
    });

    res.json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        totalOrders: orders.length,
        completedOrders: completedOrders.length,
        pendingOrders: orders.filter(o => o.status !== 'completed').length,
        totalSales,
        totalTax,
        totalDiscount,
        paymentBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCashierOrders,
  getCashierOrderDetails,
  processPayment,
  closeOrder,
  getDailySummary
};
