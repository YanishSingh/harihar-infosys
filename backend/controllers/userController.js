// backend/controllers/userController.js

// @desc    Get logged-in user profile
// @route   GET /api/user/profile
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
