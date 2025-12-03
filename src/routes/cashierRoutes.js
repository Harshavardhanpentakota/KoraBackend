const express = require('express');
const router = express.Router();
const {
  getCashierOrders,
  getCashierOrderDetails,
  processPayment,
  closeOrder,
  getDailySummary
} = require('../controllers/cashierController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, paymentValidation } = require('../middlewares/validation');

// All routes require authentication and cashier/admin role
router.use(protect);
router.use(authorize('cashier', 'admin'));

router.get('/orders', getCashierOrders);
router.get('/orders/:id', getCashierOrderDetails);
router.post('/orders/:id/pay', validate(paymentValidation), processPayment);
router.post('/orders/:id/close', closeOrder);
router.get('/summary', getDailySummary);

module.exports = router;
