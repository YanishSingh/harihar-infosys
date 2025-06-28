// backend/routes/ticketRoutes.js

const express = require('express');
const router  = express.Router();
const {
  createTicket,
  getCompanyTickets,
  getAllTickets,
  assignTicket,
  updateTicketStatus
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Company creates a ticket
router.post(
  '/',
  protect,
  authorize('Company'),
  createTicket
);

// Company views their tickets
router.get(
  '/company',
  protect,
  authorize('Company'),
  getCompanyTickets
);

// Admin views all tickets
router.get(
  '/',
  protect,
  authorize('Admin'),
  getAllTickets
);

// Admin assigns a technician
router.put(
  '/:id/assign',
  protect,
  authorize('Admin'),
  assignTicket
);

// Technician updates status/log
router.put(
  '/:id/status',
  protect,
  authorize('Technician'),
  updateTicketStatus
);

module.exports = router;