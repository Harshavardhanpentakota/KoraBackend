const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getDailySales,
  getTopItemsByQuantity,
  getTopItemsByRevenue,
  getOrderTypesDistribution,
  getCompleteAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// All analytics routes require admin or cashier access
router.use(protect, authorize('admin', 'cashier'));

// Individual analytics endpoints
router.get('/dashboard', getDashboardAnalytics);
router.get('/daily-sales', getDailySales);
router.get('/top-items-quantity', getTopItemsByQuantity);
router.get('/top-items-revenue', getTopItemsByRevenue);
router.get('/order-types', getOrderTypesDistribution);

// Complete analytics (all in one call)
router.get('/complete', getCompleteAnalytics);

module.exports = router;
