import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  handleValidationErrors,
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const forgotPasswordValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors,
];

export const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  handleValidationErrors,
];

// Report validators
export const uploadReportValidator = [
  body('report_name').trim().notEmpty().withMessage('Report name is required'),
  body('report_type')
    .isIn(['blood_test', 'xray', 'scan', 'prescription', 'other'])
    .withMessage('Invalid report type'),
  handleValidationErrors,
];

export const reportIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID')
    .custom((value) => {
      // Custom validation for CUID format if needed
      return true;
    }),
  handleValidationErrors,
];

// Pagination validators
export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

// Profile update validators
export const updateProfileValidator = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('profileImage').optional().isString(),
  handleValidationErrors,
];

// Health score validators
export const createHealthScoreValidator = [
  body('bmi').optional().isFloat({ min: 0 }).withMessage('BMI must be a positive number'),
  body('blood_pressure').optional().trim().notEmpty().withMessage('Blood pressure is required'),
  body('sugar_level').optional().isFloat({ min: 0 }).withMessage('Sugar level must be positive'),
  body('cholesterol_level').optional().isFloat({ min: 0 }).withMessage('Cholesterol must be positive'),
  handleValidationErrors,
];

export default {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  uploadReportValidator,
  reportIdValidator,
  paginationValidator,
  updateProfileValidator,
  createHealthScoreValidator,
};