// backend/routes/ticketRoutes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const {
  createTicket,
  getCompanyTickets,
  getAllTickets,
  assignTicket,
  updateTicketStatus
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

// Company creates a ticket
router.post(
  '/',
  [
    body('issueTitle')
      .notEmpty()
      .withMessage('issueTitle is required'),
    body('issueDescription')
      .notEmpty()
      .withMessage('issueDescription is required'),
    body('issueType')
      .isIn(['Remote', 'Physical'])
      .withMessage('issueType must be either "Remote" or "Physical"'),
    body('branchId')
      .if(body('issueType').equals('Physical'))
      .notEmpty()
      .withMessage('branchId is required for Physical tickets'),
    body('anyDeskId')
      .if(body('issueType').equals('Remote'))
      .notEmpty()
      .withMessage('anyDeskId is required for Remote tickets')
  ],
  validate,
  protect,
  authorize('Company'),
  createTicket
);

// Company views their tickets (with pagination & optional status filter)
router.get(
  '/company',
  [
    query('page')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('limit must be a positive integer'),
    query('status')
      .optional()
      .isIn(['Pending', 'Assigned', 'In Progress', 'Completed'])
      .withMessage('status filter must be one of Pending, Assigned, In Progress, or Completed')
  ],
  validate,
  protect,
  authorize('Company'),
  getCompanyTickets
);

// Admin views all tickets (with pagination & optional filters)
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ gt: 0 })
      .withMessage('limit must be a positive integer'),
    query('status')
      .optional()
      .isIn(['Pending', 'Assigned', 'In Progress', 'Completed'])
      .withMessage('status filter must be one of Pending, Assigned, In Progress, or Completed'),
    query('technicianId')
      .optional()
      .isMongoId()
      .withMessage('technicianId must be a valid Mongo ID')
  ],
  validate,
  protect,
  authorize('Admin'),
  getAllTickets
);

// Admin assigns a technician
router.put(
  '/:id/assign',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid ticket ID'),
    body('technicianId')
      .notEmpty()
      .withMessage('technicianId is required')
      .bail()
      .isMongoId()
      .withMessage('technicianId must be a valid Mongo ID')
  ],
  validate,
  protect,
  authorize('Admin'),
  assignTicket
);

// Technician updates status/log
router.put(
  '/:id/status',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid ticket ID'),
    body('status')
      .isIn(['Pending', 'Assigned', 'In Progress', 'Completed'])
      .withMessage('status must be one of Pending, Assigned, In Progress, or Completed'),
    body('updateNote')
      .optional()
      .isString()
      .withMessage('updateNote must be a string')
  ],
  validate,
  protect,
  authorize('Technician'),
  updateTicketStatus
);

module.exports = router;
