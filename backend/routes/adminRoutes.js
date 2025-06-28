// backend/routes/adminRoutes.js

const express = require('express');
const { query, param } = require('express-validator');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
  listPendingCompanies,
  approveCompany,
  rejectCompany
} = require('../controllers/adminController');

// All routes are Admin-only
router.use(protect, authorize('Admin'));

// List pending companies (with pagination & optional search)
router.get(
  '/companies',
  [
    query('page')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('limit must be a positive integer'),
    query('search')
      .optional()
      .isString()
      .withMessage('search must be a string')
  ],
  validate,
  listPendingCompanies
);

// Approve a company
router.put(
  '/companies/:companyId/approve',
  [
    param('companyId')
      .isMongoId()
      .withMessage('Invalid companyId')
  ],
  validate,
  approveCompany
);

// Reject & delete a company
router.delete(
  '/companies/:companyId',
  [
    param('companyId')
      .isMongoId()
      .withMessage('Invalid companyId')
  ],
  validate,
  rejectCompany
);

module.exports = router;
