import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
export const userValidation = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain a number'),
    body('phone')
      .optional()
      .trim()
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    validate
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required'),
    validate
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .optional()
      .trim()
      .isMobilePhone().withMessage('Please provide a valid phone number'),
    validate
  ]
};

// Medicine validation rules
export const medicineValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Medicine name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('genericName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Generic name max 100 characters'),
    body('category')
      .notEmpty().withMessage('Category is required'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
      .notEmpty().withMessage('Stock is required')
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('expiryDate')
      .optional()
      .isISO8601().withMessage('Please provide a valid expiry date'),
    validate
  ],
  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    validate
  ]
};

// Order validation rules
export const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.medicine')
      .notEmpty().withMessage('Medicine ID is required'),
    body('items.*.quantity')
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress')
      .optional()
      .isObject().withMessage('Shipping address must be an object'),
    validate
  ]
};

// Sanitize input - remove any potentially dangerous characters
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove $ and . from keys (MongoDB injection prevention)
        obj[key] = obj[key].replace(/[$]/g, '').replace(/\.\./g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// Validate MongoDB ObjectId
export const validateObjectId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

export default { 
  validate, 
  userValidation, 
  medicineValidation, 
  orderValidation, 
  sanitizeInput, 
  validateObjectId 
};
