const crypto = require('crypto');
const moment = require('moment');

// Generate random string
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Calculate reading time
const calculateReadingTime = (content, wordsPerMinute = 200) => {
  const wordCount = content.replace(/<[^>]*>/g, '').split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Format date for display
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Get time ago string
const timeAgo = (date) => {
  return moment(date).fromNow();
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize HTML content
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Paginate results
const paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Build pagination response
const buildPaginationResponse = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

// Generate API response
const apiResponse = (status, message, data = null, extra = {}) => {
  const response = {
    status,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return { ...response, ...extra };
};

// Success response
const successResponse = (message, data = null, extra = {}) => {
  return apiResponse(true, message, data, extra);
};

// Error response
const errorResponse = (message, data = null, extra = {}) => {
  return apiResponse(false, message, data, extra);
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Clean object (remove undefined/null values)
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// Capitalize first letter
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate random color
const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Build search query
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const escapedTerm = escapeRegex(searchTerm);
  return {
    $or: fields.map(field => ({
      [field]: { $regex: escapedTerm, $options: 'i' }
    }))
  };
};

module.exports = {
  generateRandomString,
  generateSlug,
  calculateReadingTime,
  formatDate,
  timeAgo,
  isValidEmail,
  sanitizeHtml,
  paginate,
  buildPaginationResponse,
  apiResponse,
  successResponse,
  errorResponse,
  isValidObjectId,
  cleanObject,
  capitalize,
  generateRandomColor,
  escapeRegex,
  buildSearchQuery
};