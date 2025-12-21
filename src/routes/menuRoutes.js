const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems
} = require('../controllers/menuController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, itemValidation, itemUpdateValidation } = require('../middlewares/validation');
const upload = require('../middlewares/upload');

// Public routes - menu viewing
router.get('/', getItems);

// Low stock route - must come before /:id to avoid conflict
router.get('/low-stock', protect, authorize('admin', 'cashier'), getLowStockItems);

router.get('/:id', getItem);

// Admin and Cashier routes - menu management
router.post('/', protect, authorize('admin', 'cashier'), upload.single('image'), validate(itemValidation), createItem);
router.put('/:id', protect, authorize('admin', 'cashier'), upload.single('image'), validate(itemUpdateValidation), updateItem);
router.delete('/:id', protect, authorize('admin', 'cashier'), deleteItem);

module.exports = router;
