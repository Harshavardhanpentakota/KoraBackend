const { body, param, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

// Auth validations
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'cashier', 'kitchen']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Category validations
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Display order must be a positive number')
];

// Item validations
const itemValidation = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID format'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isVeg').optional().isBoolean().withMessage('isVeg must be a boolean'),
  body('preparationTime').optional().isInt({ min: 0 }).withMessage('Preparation time must be a positive number')
];

// Item update validations (all fields optional)
const itemUpdateValidation = [
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('category')
    .optional()
    .notEmpty().withMessage('Category cannot be empty')
    .isMongoId().withMessage('Invalid category ID format'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isVeg').optional().isBoolean().withMessage('isVeg must be a boolean'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean'),
  body('preparationTime').optional().isInt({ min: 0 }).withMessage('Preparation time must be a positive number')
];

// Table validations for creating new tables
const tableValidation = [
  body('tableNumber').trim().notEmpty().withMessage('Table number is required'),
  body('name').trim().notEmpty().withMessage('Table name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status').optional().isIn(['free', 'available', 'occupied', 'reserved', 'maintenance', 'waiting']).withMessage('Invalid status')
];

// Table validations for updating tables (all fields optional)
const tableUpdateValidation = [
  body('tableNumber').optional().trim().notEmpty().withMessage('Table number cannot be empty'),
  body('name').optional().trim().notEmpty().withMessage('Table name cannot be empty'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('status').optional().isIn(['free', 'available', 'occupied', 'reserved', 'maintenance', 'waiting']).withMessage('Invalid status'),
  body('currentOrder').optional({ nullable: true }).custom((value) => {
    if (value === null || value === '') return true;
    // Check if it's a valid MongoDB ObjectId
    return /^[0-9a-fA-F]{24}$/.test(value);
  }).withMessage('Invalid order ID'),
  body('location').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// Order validations
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.item').notEmpty().withMessage('Item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('table').optional(),
  body('customerName').optional().trim(),
  body('customerPhone').optional().trim(),
  body('orderType').optional().isIn(['dine-in', 'takeaway', 'delivery']).withMessage('Invalid order type')
];

// Payment validations
const paymentValidation = [
  body('paymentMethod').isIn(['cash', 'card', 'upi', 'wallet']).withMessage('Invalid payment method'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('transactionId').optional().trim()
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  categoryValidation,
  itemValidation,
  itemUpdateValidation,
  tableValidation,
  tableUpdateValidation,
  orderValidation,
  paymentValidation
};
