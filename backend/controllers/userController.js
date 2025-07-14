// backend/controllers/userController.js
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const bcrypt = require('bcryptjs');

// @desc    Get logged-in user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  const user = req.user; // set by authMiddleware
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Base profile
  const profile = {
    _id:       user._id,
    role:      user.role,
    name:      user.name,
    email:     user.email,
    phone:     user.phone,
    createdAt: user.createdAt
  };

  // Company-specific fields
  if (user.role === 'Company') {
    profile.companyName = user.companyName;
    profile.vatOrPan    = user.vatOrPan;
    profile.branches    = user.branches;
    profile.isApproved  = user.isApproved;
  }

  res.json(profile);
};

// @desc    Change user password
// @route   POST /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const userId = req.user._id;
  const { email, currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!email || !currentPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  // Get user from DB
  const user = await require('../models/User').findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  if (user.email !== email) {
    return res.status(400).json({ message: 'Email does not match your profile.' });
  }

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }

  // Change password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password changed successfully.' });
};

// GET /api/companies?includeTicketCount=true
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: 'Company' }).sort({ createdAt: -1 }).lean();

    let companiesWithTicketCount = companies;
    if (req.query.includeTicketCount === "true") {
      const ticketCounts = await Ticket.aggregate([
        { $group: { _id: "$company", count: { $sum: 1 } } }
      ]);
      const countMap = {};
      ticketCounts.forEach(tc => { countMap[tc._id.toString()] = tc.count; });
      companiesWithTicketCount = companies.map(c => ({
        ...c,
        ticketsCount: countMap[c._id.toString()] || 0
      }));
    }
    res.json({ data: companiesWithTicketCount });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: "Company" })
      .select("_id companyName vatOrPan phone email createdAt isApproved")
      .lean();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    // Optionally: count their tickets
    const ticketsCount = await require("../models/Ticket").countDocuments({ company: company._id });
    company.ticketsCount = ticketsCount;
    res.json(company);
  } catch (e) {
    res.status(500).json({ message: "Error fetching company", error: e });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: "Company" });
    if (!company) return res.status(404).json({ message: "Company not found" });
    company.isApproved = true;
    await company.save();
    res.json({ message: "Company approved", company });
  } catch (e) {
    res.status(500).json({ message: "Failed to approve company", error: e });
  }
};

exports.disableCompany = async (req, res) => {
  try {
    const company = await User.findOne({ _id: req.params.id, role: "Company" });
    if (!company) return res.status(404).json({ message: "Company not found" });
    company.isApproved = false;
    await company.save();
    res.json({ message: "Company disabled", company });
  } catch (e) {
    res.status(500).json({ message: "Failed to disable company", error: e });
  }
};
