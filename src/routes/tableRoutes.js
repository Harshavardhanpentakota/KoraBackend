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
const { validate, tableValidation, tableUpdateValidation } = require('../middlewares/validation');

// Public route - get table by ID (for customers scanning QR)
router.get('/public/:id', getTableById);

// All routes are now public (no authentication required)
router.route('/')
  .get(getTables)
  .post(validate(tableValidation), createTable);

router.route('/:id')
  .get(getTable)
  .put(validate(tableUpdateValidation), updateTable)
  .delete(deleteTable);

router.get('/:id/qr', generateTableQR);

module.exports = router;
