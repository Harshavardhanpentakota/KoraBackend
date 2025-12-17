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
    const { items, table, customerName, customerPhone, orderType, notes, orderSource } = req.body;

    // Determine order source (customer = self-service, cashier = POS)
    const source = orderSource || 'customer';

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

    // Only validate and lock table for CASHIER orders
    if (source === 'cashier' && table && (orderType === 'dine-in' || !orderType)) {
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
      orderSource: source,
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

    // Only lock table for CASHIER orders
    if (source === 'cashier' && table && (orderType === 'dine-in' || !orderType)) {
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
    const { status, orderType, isTakeaway, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) {
      // Support multiple status values (comma-separated)
      const statusArray = status.split(',').map(s => s.trim());
      query.status = { $in: statusArray };
    }
    
    if (orderType) {
      query.orderType = orderType;
    }
    
    if (isTakeaway !== undefined) {
      // Convert string to boolean
      query.isTakeaway = isTakeaway === 'true' || isTakeaway === true;
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

// @desc    Get order status by ID or order number (for customer tracking)
// @route   GET /api/orders/status/:id
// @access  Public
const getOrderStatus = async (req, res, next) => {
  try {
    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id })
        .select('orderNumber status paymentStatus paymentMethod total subtotal tax discount tableNumber orderType createdAt updatedAt paidAt acceptedAt completedAt orderSource')
        .populate('table', 'tableNumber name location');
    } else {
      order = await Order.findById(req.params.id)
        .select('orderNumber status paymentStatus paymentMethod total subtotal tax discount tableNumber orderType createdAt updatedAt paidAt acceptedAt completedAt orderSource')
        .populate('table', 'tableNumber name location');
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items with basic details
    const items = await OrderItem.find({ order: order._id })
      .populate('item', 'name price category image')
      .select('quantity price notes status');

    res.json({
      success: true,
      data: {
        order,
        items,
        itemCount: items.length,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0)
      }
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
    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id })
        .populate('table', 'tableNumber')
        .populate('acceptedBy', 'name email');
    } else {
      order = await Order.findById(req.params.id)
        .populate('table', 'tableNumber')
        .populate('acceptedBy', 'name email');
    }
    
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

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Public (for pending orders)
const updateOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, notes, discount, items } = req.body;
    
    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Prevent updating completed or paid orders
    if (order.status === 'paid' || order.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed or paid orders'
      });
    }

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing order items
      await OrderItem.deleteMany({ order: order._id });

      // Validate items and calculate new totals
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

      // Create new order items
      for (const item of orderItems) {
        await OrderItem.create({
          order: order._id,
          ...item
        });
      }

      // Recalculate totals
      const tax = subtotal * 0.05;
      const discountAmount = discount !== undefined ? discount : order.discount;
      const total = subtotal + tax - discountAmount;

      order.subtotal = subtotal;
      order.tax = tax;
      order.discount = discountAmount;
      order.total = total;
    }

    // Update other allowed fields
    if (customerName !== undefined) order.customerName = customerName;
    if (customerPhone !== undefined) order.customerPhone = customerPhone;
    if (notes !== undefined) order.notes = notes;
    if (discount !== undefined && !items) {
      order.discount = discount;
      // Recalculate total with discount
      order.total = order.subtotal + order.tax - order.discount;
    }

    await order.save();

    // Fetch updated order with items
    const updatedItems = await OrderItem.find({ order: order._id })
      .populate('item', 'name price');

    res.json({
      success: true,
      data: {
        order,
        items: updatedItems
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
    
    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }
    
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
      
      // Only update table status for CASHIER orders
      if (order.orderSource === 'cashier' && order.table && order.orderType === 'dine-in') {
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
    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'completed' || order.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed or paid order'
      });
    }

    order.status = 'cancelled';
    await order.save();

    // Only update table status for CASHIER orders
    if (order.orderSource === 'cashier' && order.table && order.orderType === 'dine-in') {
      await Table.findByIdAndUpdate(order.table, { 
        status: 'free',
        currentOrder: null
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
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

// @desc    Create payment record for order (doesn't complete order)
// @route   POST /api/orders/:id/payment/create
// @access  Public (for customer payments)
const createPayment = async (req, res, next) => {
  try {
    const { paymentMethod, method, amount, transactionId, notes } = req.body;

    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Support both 'method' and 'paymentMethod' parameter names
    const payMethod = paymentMethod || method;

    if (!payMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }

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

    // Log warning if amount provided doesn't match (but don't fail)
    if (amount && amount !== order.total) {
      console.warn(`Payment amount mismatch: Provided ${amount}, Order total ${order.total}. Using order total.`);
    }

    // Update payment info but DON'T change order status
    order.paymentMethod = payMethod;
    order.paymentStatus = 'paid';
    order.paidAt = Date.now();
    await order.save();

    // Create transaction record
    const transactionData = {
      order: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentMethod: payMethod,
      type: 'sale',
      status: 'completed',
      transactionId: transactionId || `TXN-${Date.now()}`,
      notes: notes || ''
    };

    // Add processedBy if user is authenticated
    if (req.user) {
      transactionData.processedBy = req.user._id;
    }

    const transaction = await Transaction.create(transactionData);

    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('processedBy', 'name email');

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        order,
        transaction: populatedTransaction
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process payment and complete order
// @route   PUT /api/orders/:id/pay
// @access  Public (for customer payments) / Private (for cashier)
const processOrderPayment = async (req, res, next) => {
  try {
    const { paymentMethod, method, amount, transactionId, notes } = req.body;

    // Validate order ID is provided
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Support both 'method' and 'paymentMethod' parameter names
    const payMethod = paymentMethod || method;

    if (!payMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Find order by ID or order number
    let order;
    if (req.params.id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: req.params.id });
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid' && order.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order already completed'
      });
    }

    // Log warning if amount provided doesn't match (but don't fail)
    if (amount && amount !== order.total) {
      console.warn(`Payment amount mismatch: Provided ${amount}, Order total ${order.total}. Using order total.`);
    }

    // Update order - mark as PAID and COMPLETED
    order.paymentMethod = payMethod;
    order.paymentStatus = 'paid';
    order.status = 'paid';
    order.paidAt = Date.now();
    await order.save();

    // Create transaction record
    const transactionData = {
      order: order._id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentMethod: payMethod,
      type: 'sale',
      status: 'completed',
      transactionId: transactionId || `TXN-${Date.now()}`,
      notes: notes || ''
    };

    // Add processedBy if user is authenticated
    if (req.user) {
      transactionData.processedBy = req.user._id;
    }

    const transaction = await Transaction.create(transactionData);

    // Only update table status for CASHIER orders (customer orders don't lock tables)
    if (order.orderSource === 'cashier' && order.table && order.orderType === 'dine-in') {
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
  getOrderStatus,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderByTable,
  createPayment,
  processOrderPayment
};
