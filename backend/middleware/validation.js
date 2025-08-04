const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User validation rules
const validateUserSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be a boolean'),
  
  body('preferences.prayerUpdates')
    .optional()
    .isBoolean()
    .withMessage('Prayer updates preference must be a boolean'),
  
  body('preferences.eventReminders')
    .optional()
    .isBoolean()
    .withMessage('Event reminders preference must be a boolean'),
  
  body('preferences.newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be a boolean'),
  
  handleValidationErrors
];

// Prayer validation rules
const validatePrayerRequest = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('isUrgent')
    .optional()
    .isBoolean()
    .withMessage('isUrgent must be a boolean'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  
  body('category')
    .optional()
    .isIn([
      'Health & Healing',
      'Family & Relationships',
      'Work & Career',
      'Spiritual Growth',
      'Financial Provision',
      'Guidance & Direction',
      'Protection & Safety',
      'Salvation',
      'Church & Ministry',
      'Community & World',
      'Other'
    ])
    .withMessage('Invalid category'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'members', 'private'])
    .withMessage('Visibility must be public, members, or private'),
  
  handleValidationErrors
];

// Article validation rules
const validateArticle = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  
  body('excerpt')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Excerpt must be between 10 and 500 characters'),
  
  body('category')
    .isIn([
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
      'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
      '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
      'General', 'Devotional', 'Theology', 'Christian Living'
    ])
    .withMessage('Invalid category'),
  
  body('contentType')
    .optional()
    .isIn(['text', 'pdf'])
    .withMessage('Content type must be text or pdf'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  handleValidationErrors
];

// Comment validation rules
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Comment must be between 5 and 1000 characters'),
  
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'title', '-title'])
    .withMessage('Invalid sort parameter'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserSignup,
  validatePrayerRequest,
  validateArticle,
  validateComment,
  validateObjectId,
  validatePagination
};