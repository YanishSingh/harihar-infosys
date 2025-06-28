// backend/controllers/adminController.js

const User = require('../models/User');

// @desc    List all pending companies
// @route   GET /api/admin/companies
// @access  Admin
exports.listPendingCompanies = async (req, res) => {
  const companies = await User.find({ role: 'Company', isApproved: false })
    .select('-password');
  res.json(companies);
};

// @desc    Approve a company
// @route   PUT /api/admin/companies/:companyId/approve
// @access  Admin
exports.approveCompany = async (req, res) => {
  const company = await User.findById(req.params.companyId);
  if (!company || company.role !== 'Company') {
    return res.status(404).json({ message: 'Company not found' });
  }
  company.isApproved = true;
  await company.save();
  res.json({ message: 'Company approved' })
  // ─── Send notification to Company ───────────────────────────────────────
  const { sendEmail } = require('../utils/notificationService');
  sendEmail({
    to: company.email,
    subject: 'Your Company Has Been Approved',
    text: `Congratulations! Your company "${company.companyName}" is now approved.`,
    html: `<p>Congratulations! Your company "<b>${company.companyName}</b>" is now approved.</p>`
 }).catch(console.error);
 // ───────────────────────────────────────────────────────────────────────

};

// @desc    Reject (delete) a pending company
// @route   DELETE /api/admin/companies/:companyId
// @access  Admin
exports.rejectCompany = async (req, res) => {
  const company = await User.findById(req.params.companyId);
  if (!company || company.role !== 'Company') {
    return res.status(404).json({ message: 'Company not found' });
  }
  await company.remove();
  res.json({ message: 'Company rejected and removed' });
};
