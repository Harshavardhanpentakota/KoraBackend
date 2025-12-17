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
router.get('/:id', getOrder); // Made public for customer order access
router.post('/:id/payment/create', createPayment);
router.put('/:id/pay', processOrderPayment);
router.delete('/:id', cancelOrder);

// Protected routes
router.get('/table/:tableId', protect, authorize('admin', 'cashier', 'waiter'), getOrderByTable);
router.put('/:id/status', protect, authorize('admin', 'cashier'), updateOrderStatus);

module.exports = router;
