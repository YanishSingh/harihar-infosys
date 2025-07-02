const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  registerUser,
  authUser,
  getMe,
  logoutUser
} = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');
const { protect }  = require('../middleware/authMiddleware');

// Registration
router.post(
  '/register',
  [
    body('role')
      .isIn(['Admin','Technician','Company'])
      .withMessage('role must be Admin, Technician or Company'),
    body('name')
      .notEmpty()
      .withMessage('Full Name is required'),
    body('phone')
      .notEmpty()
      .withMessage('Phone Number is required'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('confirmPassword')
      .custom((val, { req }) => val === req.body.password)
      .withMessage('Passwords must match'),

    // Company fields
    body('companyName')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('Company Name is required'),
    body('businessType')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('Business Type is required'),
    body('vatOrPan')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('PAN/VAT Number is required'),
    body('branches')
      .if(body('role').equals('Company'))
      .isArray({ min: 1 })
      .withMessage('Branches array is required'),
    body('branches.*.province')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('province is required for each branch'),
    body('branches.*.city')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('city is required for each branch'),
    body('branches.*.municipality')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('municipality is required for each branch'),
    body('branches.*.place')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('place is required for each branch'),
    body('branches.*.phone')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('phone is required for each branch'),
    body('branches.*.isHeadOffice')
      .if(body('role').equals('Company'))
      .isBoolean()
      .withMessage('isHeadOffice flag is required for each branch')
  ],
  validate,
  registerUser
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authUser
);

// Current user
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logoutUser);

module.exports = router;
