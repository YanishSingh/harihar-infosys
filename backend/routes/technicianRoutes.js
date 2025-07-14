// technicianRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket'); // Add this line if it's not imported yet
const technicianController = require('../controllers/technicianController');

// Dashboard route
router.get('/dashboard', protect, authorize('Technician'), technicianController.getDashboard);

// Get all tickets assigned to the logged-in technician
router.get('/tickets', protect, authorize('Technician'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const technicianId = req.user._id;

    // Fetch tickets assigned to the logged-in technician
    const tickets = await Ticket.find({ assignedTo: technicianId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'company',
        select: 'companyName name',
        options: { strictPopulate: false } // Mongoose 7+ will skip bad refs
      })
      .lean();

    // Filter out tickets with missing or invalid company info
    const filteredTickets = tickets.filter(t =>
      t.company && (t.company.companyName || t.company.name)
    );

    res.json({
      data: filteredTickets,
      page,
      limit,
      total: await Ticket.countDocuments({ assignedTo: technicianId }),
    });
  } catch (err) {
    console.error('Technician tickets route error:', err, JSON.stringify(err));
    res.status(500).json({ message: "Error fetching tickets for technician.", error: err.toString() });
  }
});

module.exports = router;
