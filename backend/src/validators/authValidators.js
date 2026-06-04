const { body } = require('express-validator');

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters.'),
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const shortenValidation = [
  body('originalUrl').notEmpty().withMessage('Original URL is required.'),
  body('alias')
    .optional()
    .matches(/^[a-zA-Z0-9_-]{3,30}$/)
    .withMessage('Alias must be 3-30 characters (letters, numbers, hyphens, underscores).'),
  body('expiresAt').optional().isISO8601().withMessage('Invalid expiry date format.'),
  body('password')
    .optional()
    .isLength({ min: 4 })
    .withMessage('URL password must be at least 4 characters.'),
];

module.exports = { registerValidation, loginValidation, shortenValidation };
