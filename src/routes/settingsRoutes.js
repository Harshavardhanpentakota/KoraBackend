const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/settingsController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');

// Settings routes (Admin and Cashier)
router.get('/settings', protect, authorize('admin', 'cashier'), getSettings);
router.put('/settings', protect, authorize('admin', 'cashier'), updateSettings);

// Profile routes (All authenticated users)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
