const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['user', 'lawyer']).withMessage('Invalid role')
];

// Login validation
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Case creation validation
exports.caseValidation = [
  body('caseTitle')
    .trim()
    .notEmpty().withMessage('Case title is required'),
  body('firNumber')
    .trim()
    .notEmpty().withMessage('FIR number is required'),
  body('policeStation')
    .trim()
    .notEmpty().withMessage('Police station is required'),
  body('court')
    .notEmpty().withMessage('Court is required')
    .isIn(['District Court', 'High Court', 'Supreme Court', 'Other']).withMessage('Invalid court type'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required'),
  body('caseType')
    .notEmpty().withMessage('Case type is required')
    .isIn(['Criminal', 'Civil', 'Constitutional', 'Other']).withMessage('Invalid case type')
];

// MongoDB ObjectId validation
exports.mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

// MongoDB ObjectId validation for caseId param
exports.mongoCaseIdValidation = [
  param('caseId')
    .isMongoId().withMessage('Invalid case ID format')
];

// Pagination validation
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];
