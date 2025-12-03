const express = require('express');
const router = express.Router();
const {
  getKitchenOrders,
  getKitchenOrderItems,
  updateOrderItemStatus,
  getKitchenStats
} = require('../controllers/kitchenController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// All routes require authentication and kitchen/admin role
router.use(protect);
router.use(authorize('kitchen', 'admin'));

router.get('/orders', getKitchenOrders);
router.get('/order-items', getKitchenOrderItems);
router.put('/order-items/:id/status', updateOrderItemStatus);
router.get('/stats', getKitchenStats);

module.exports = router;
