const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/menuController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, itemValidation, itemUpdateValidation } = require('../middlewares/validation');

// Public routes - menu viewing
router.get('/', getItems);
router.get('/:id', getItem);

// Admin and Cashier routes - menu management
router.post('/', protect, authorize('admin', 'cashier'), validate(itemValidation), createItem);
router.put('/:id', protect, authorize('admin', 'cashier'), validate(itemUpdateValidation), updateItem);
router.delete('/:id', protect, authorize('admin', 'cashier'), deleteItem);

module.exports = router;
