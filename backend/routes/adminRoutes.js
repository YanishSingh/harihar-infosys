// backend/routes/adminRoutes.js

const express = require('express');
const { param } = require('express-validator');
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

// List pending companies
// GET /api/admin/companies
router.get('/companies', listPendingCompanies);

// Approve a company
// PUT /api/admin/companies/:companyId/approve
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
// DELETE /api/admin/companies/:companyId
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
