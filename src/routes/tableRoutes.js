const express = require('express');
const router = express.Router();
const {
  getTables,
  getTable,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  generateTableQR
} = require('../controllers/tableController');
const { protect } = require('../middlewares/auth');
const { authorize } = require('../middlewares/roleCheck');
const { validate, tableValidation } = require('../middlewares/validation');

// Public route - get table by ID (for customers scanning QR)
router.get('/public/:id', getTableById);

// All other routes require authentication and admin/cashier role
router.use(protect);
router.use(authorize('admin', 'cashier'));

router.route('/')
  .get(getTables)
  .post(validate(tableValidation), createTable);

router.route('/:id')
  .get(getTable)
  .put(validate(tableValidation), updateTable)
  .delete(deleteTable);

router.get('/:id/qr', generateTableQR);

module.exports = router;
