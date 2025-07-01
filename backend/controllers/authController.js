// backend/controllers/authController.js

const User          = require('../models/User');
const bcrypt        = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/notificationService');

// Determine if we’re in production
const isProd = process.env.NODE_ENV === 'production';

// Shared cookie options for setting & clearing the JWT cookie
const cookieOptions = {
  httpOnly: true,
  secure: isProd,                          // only send over HTTPS in prod
  sameSite: isProd ? 'none' : 'lax',       // None+Secure in prod; Lax in dev
  maxAge: 7 * 24 * 60 * 60 * 1000          // 1 week
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
      vatOrPan,
      branches
    } = req.body;

    // … your existing validation logic …

    // Create the user
    const salt   = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const data   = { role, name, phone, email, password: hashed };
    if (role === 'Company') {
      Object.assign(data, { companyName, vatOrPan, branches, isApproved: false });
    }
    const user = await User.create(data);

    // Optionally notify admin…
    if (role === 'Company' && process.env.ADMIN_EMAIL) {
      sendEmail({ /* … */ }).catch(console.error);
    }

    // Auto‐login: generate token & set cookie
    const token = generateToken(user._id, user.role);
    res.cookie('token', token, cookieOptions);

    // Return the user payload
    return res.status(201).json({
      user: {
        _id:         user._id,
        role:        user.role,
        name:        user.name,
        email:       user.email,
        phone:       user.phone,
        companyName: user.companyName,
        vatOrPan:    user.vatOrPan,
        branches:    user.branches,
        token
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering user.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();

    if (
      user &&
      (await bcrypt.compare(password, user.password))
    ) {
      if (user.role === 'Company' && user.isApproved === false) {
        return res.status(403).json({ message: 'Company registration pending approval.' });
      }

      // Build user payload
      const payload = {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone
      };
      if (user.role === 'Company') {
        Object.assign(payload, {
          companyName: user.companyName,
          vatOrPan:    user.vatOrPan,
          branches:    user.branches
        });
      }

      // Generate token & set cookie
      const token = generateToken(user._id, user.role);
      res.cookie('token', token, cookieOptions);

      return res.json({ user: { ...payload, token } });
    }

    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }
  res.status(200).json({ user: req.user });
};

// @desc    Logout user (clear auth cookie)
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Logged out successfully.' });
};
