// controllers/technicianController.js

const User = require('../models/User');
const Ticket = require('../models/Ticket');

exports.getDashboard = async (req, res) => {
  try {
    console.log('Technician Dashboard Hit:', req.user);
    // Get technician info
    const technician = await User.findById(req.user._id).select('name email role');
    console.log('Fetched Technician:', technician);
    if (!technician || technician.role !== "Technician") {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Ticket counts for dashboard stats
    const assigned = await Ticket.countDocuments({ assignedTo: req.user._id, status: "Assigned" });
    const inProgress = await Ticket.countDocuments({ assignedTo: req.user._id, status: "In Progress" });
    // "Completed" replaces "Resolved"/"Closed" in your schema
    const completed = await Ticket.countDocuments({ assignedTo: req.user._id, status: "Completed" });

    // Most recent tickets assigned to this technician
    const recentTickets = await Ticket.find({ assignedTo: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id ticketId issueTitle company status createdAt') // Add 'priority' if you add that field!
      .populate('company', 'companyName name')
      .lean();

    res.json({
      technician: {
        name: technician.name,
        email: technician.email
      },
      stats: {
        assigned,
        inProgress,
        completed // use this for dashboard's "Completed" box
      },
      recentTickets: recentTickets.map(t => ({
        id: t._id,                         // Or t.ticketId if you prefer public-facing
        title: t.issueTitle,
        company: t.company?.companyName || t.company?.name || "",
        // priority: t.priority,           // If you add a priority field!
        status: t.status,
        createdAt: t.createdAt,
      }))
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to load dashboard.", error: e });
  }
};
