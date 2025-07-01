// routes/authRoutes.js

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
const { protect } = require('../middleware/authMiddleware');

// ─── Registration endpoint ────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('role')
      .isIn(['Admin', 'Technician', 'Company'])
      .withMessage('role must be one of Admin, Technician, or Company'),
    body('name').notEmpty().withMessage('name is required'),
    body('phone').notEmpty().withMessage('phone is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('password must be at least 6 characters'),
    body('confirmPassword')
      .custom((val, { req }) => val === req.body.password)
      .withMessage('passwords must match'),
    body('email').isEmail().withMessage('valid email is required'),
    body('companyName')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('companyName is required for Company'),
    body('vatOrPan')
      .if(body('role').equals('Company'))
      .notEmpty()
      .withMessage('vatOrPan is required for Company'),
    body('branches')
      .if(body('role').equals('Company'))
      .isArray({ min: 1 })
      .withMessage('branches must be an array with at least one entry'),
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
      .withMessage('isHeadOffice flag is required for each branch'),
  ],
  validate,
  registerUser
);

// ─── Login endpoint ────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('valid email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  validate,
  authUser
);

// ─── Get current user ──────────────────────────────────────────────────────
router.get('/me', protect, getMe);

// ─── Logout endpoint ───────────────────────────────────────────────────────
router.post('/logout', protect, logoutUser);

module.exports = router;
