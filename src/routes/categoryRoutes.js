const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, categoryValidation } = require('../middlewares/validation');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Admin and Cashier routes
router.post('/', protect, authorize('admin', 'cashier'), validate(categoryValidation), createCategory);
router.put('/:id', protect, authorize('admin', 'cashier'), validate(categoryValidation), updateCategory);
router.delete('/:id', protect, authorize('admin', 'cashier'), deleteCategory);

module.exports = router;
