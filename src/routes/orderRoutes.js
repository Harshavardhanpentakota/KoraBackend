const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, orderValidation } = require('../middlewares/validation');

// Public route - create order
router.post('/', validate(orderValidation), createOrder);

// Protected routes
router.get('/', protect, authorize('admin', 'cashier'), getOrders);
router.get('/:id', protect, authorize('admin', 'cashier', 'kitchen'), getOrder);
router.put('/:id/status', protect, authorize('admin', 'cashier'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin', 'cashier'), cancelOrder);

module.exports = router;
