// backend/controllers/adminController.js

const User = require('../models/User');
const { sendEmail } = require('../utils/notificationService');

/**
 * @desc    List pending companies with pagination & optional search
 * @route   GET /api/admin/companies
 * @access  Admin
 */
exports.listPendingCompanies = async (req, res) => {
  let { page = 1, limit = 10, search = '' } = req.query;
  page  = parseInt(page,  10);
  limit = parseInt(limit, 10);

  // Base filter: only companies awaiting approval
  const filter = { role: 'Company', isApproved: false };
  if (search) {
    // case-insensitive search on companyName
    filter.companyName = { $regex: search, $options: 'i' };
  }

  const total = await User.countDocuments(filter);
  const companies = await User
    .find(filter)
    .select('-password')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    data: companies
  });
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

  // Send notification to Company
  if (process.env.ADMIN_EMAIL && company.email) {
    sendEmail({
      to: company.email,
      subject: `Your Company "${company.companyName}" Has Been Approved`,
      text: `Congratulations! Your company "${company.companyName}" is now approved.`,
      html: `<p>Congratulations! Your company "<strong>${company.companyName}</strong>" is now approved.</p>`
    }).catch(console.error);
  }

  res.json({ message: 'Company approved' });
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
