const User          = require('../models/User');
const bcrypt        = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/notificationService');

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// @desc    Register a new user / company
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      password,
      confirmPassword,
      companyName,
      businessType,
      vatOrPan,
      address,
      branches
    } = req.body;

    // Basic validation
    if (!role || !name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Company-specific
    if (role === 'Company') {
      if (!companyName || !businessType || !vatOrPan || !Array.isArray(branches)) {
        return res.status(400).json({
          message: 'Company must provide companyName, businessType, vatOrPan, and branches array.'
        });
      }
      // Validate branches in controller too (enforced again at schema level)
      const headCount = branches.filter(b => b.isHeadOffice).length;
      if (headCount !== 1) {
        return res.status(400).json({ message: 'Must mark exactly one branch as head office.' });
      }
    }

    // Duplicate email
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Hash & create
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const data = { role, name, email, phone, password: hashed };

    if (role === 'Company') {
      Object.assign(data, {
        companyName,
        businessType,
        vatOrPan,
        address,
        branches,
        isApproved: false
      });
    }

    const user = await User.create(data);

    // Notify admin
    if (role === 'Company' && process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Registration Request: ${companyName}`,
        text: `Company "${companyName}" has registered and awaits approval.`,
        html: `<p>Company "<strong>${companyName}</strong>" has registered and awaits approval.</p>`
      }).catch(console.error);
    }

    // Auto‐login
    const token = generateToken(user._id, user.role);
    res.cookie('token', token, cookieOptions);

    // Respond
    return res.status(201).json({
      user: {
        _id:          user._id,
        role:         user.role,
        name:         user.name,
        email:        user.email,
        phone:        user.phone,
        companyName:  user.companyName,
        businessType: user.businessType,
        vatOrPan:     user.vatOrPan,
        address:      user.address,
        branches:     user.branches,
        isApproved:   user.isApproved,
        token
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while registering user.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (user && await bcrypt.compare(password, user.password)) {
      if (user.role === 'Company' && !user.isApproved) {
        return res.status(403).json({ message: 'Company registration pending approval.' });
      }

      // Build payload
      const payload = {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone
      };
      if (user.role === 'Company') {
        Object.assign(payload, {
          companyName:  user.companyName,
          businessType: user.businessType,
          vatOrPan:     user.vatOrPan,
          address:      user.address,
          branches:     user.branches,
          isApproved:   user.isApproved
        });
      }

      // Cookie + response
      const token = generateToken(user._id, user.role);
      res.cookie('token', token, cookieOptions);
      return res.json({ user: { ...payload, token } });
    }
    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error while logging in.' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  res.status(200).json({ user: req.user });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully.' });
};
