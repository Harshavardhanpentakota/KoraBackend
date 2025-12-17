const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, orderValidation } = require('../middlewares/validation');

// Public routes
router.post('/', validate(orderValidation), createOrder);
router.put('/:id', updateOrder);
router.get('/', getOrders);
router.get('/status/:id', getOrderStatus);
router.post('/:id/payment/create', createPayment);
router.put('/:id/pay', processOrderPayment);
router.delete('/:id', cancelOrder);

// Protected routes
router.get('/table/:tableId', protect, authorize('admin', 'cashier', 'waiter'), getOrderByTable);
router.get('/:id', protect, authorize('admin', 'cashier', 'kitchen'), getOrder);
router.put('/:id/status', protect, authorize('admin', 'cashier'), updateOrderStatus);

module.exports = router;
