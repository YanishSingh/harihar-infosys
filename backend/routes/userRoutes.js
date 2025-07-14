const express = require('express');
const router  = express.Router();
const { getUserProfile, changePassword, getAllCompanies } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware'); // <-- FIXED HERE
const { getCompanyById } = require('../controllers/userController');
const { approveCompany } = require('../controllers/userController');
const { disableCompany } = require('../controllers/userController');




// Models
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// GET /api/users/profile
router.get('/profile', protect, getUserProfile);

// POST /api/users/change-password
router.post('/change-password', protect, changePassword);

// GET /api/users/companies
router.get('/companies', protect, authorize('Admin'), getAllCompanies);

// GET /api/users/companies/:id
router.get('/companies/:id', protect, authorize('Admin'), getCompanyById);

router.patch('/companies/:id/approve', protect, authorize('Admin'), approveCompany);

router.patch('/companies/:id/disable', protect, authorize('Admin'), disableCompany);

// GET /api/users/technicians/:id
router.get('/technicians/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const tech = await User.findById(req.params.id).select('_id name email phone role');
    if (!tech || tech.role !== "Technician") {
      return res.status(404).json({ message: "Technician not found" });
    }
    res.json(tech);
  } catch (e) {
    res.status(500).json({ message: "Error fetching technician", error: e });
  }
});

// GET /api/users/technicians - List technicians with pending ticket count
router.get('/technicians', protect, async (req, res) => {
  try {
    // Find all users with role "Technician"
    const technicians = await User.find({ role: "Technician" }).select("_id name email");
    // For each, count their assigned/in-progress tickets
    const withCounts = await Promise.all(
      technicians.map(async (tech) => {
        const pendingCount = await Ticket.countDocuments({
          assignedTo: tech._id,
          status: { $in: ["Assigned", "In Progress"] },
        });
        return {
          _id: tech._id,
          name: tech.name,
          email: tech.email,
          pendingCount,
        };
      })
    );
    // Sort by least busy
    withCounts.sort((a, b) => a.pendingCount - b.pendingCount);
    res.json(withCounts);
  } catch (e) {
    res.status(500).json({ message: "Error fetching technicians", error: e });
  }
});

// Change phone (PUT is more RESTful, but you can use POST)
router.post('/change-phone', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }
    const user = await User.findByIdAndUpdate(userId, { phone }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "Phone number updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update phone.", error: err.message });
  }
});

module.exports = router;
