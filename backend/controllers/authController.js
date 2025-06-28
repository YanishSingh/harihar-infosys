// backend/controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
const User          = require('../models/User');
const bcrypt        = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/notificationService');

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

    // ─── BASIC VALIDATION ──────────────────────────────────────────────────
    if (!role || !name || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // ─── COMPANY-SPECIFIC VALIDATION ───────────────────────────────────────
    if (role === 'Company') {
      if (!companyName || !vatOrPan || !email || !Array.isArray(branches)) {
        return res.status(400).json({
          message: 'Company must provide companyName, vatOrPan, email, and a branches array.'
        });
      }
      // Validate each branch
      for (const b of branches) {
        if (
          !b.province ||
          !b.city ||
          !b.municipality ||
          !b.place ||
          !b.phone ||
          typeof b.isHeadOffice !== 'boolean'
        ) {
          return res.status(400).json({
            message:
              'Each branch needs province, city, municipality, place, phone and isHeadOffice flag.'
          });
        }
      }
      // Exactly one head office
      const headCount = branches.filter(b => b.isHeadOffice).length;
      if (headCount !== 1) {
        return res.status(400).json({
          message: 'You must mark exactly one branch as the head office.'
        });
      }
    } else {
      // Admin or Technician
      if (!email) {
        return res.status(400).json({ message: 'Please provide an email.' });
      }
    }

    // ─── CHECK DUPLICATE EMAIL ─────────────────────────────────────────────
    if (email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already in use.' });
      }
    }

    // ─── HASH PASSWORD ─────────────────────────────────────────────────────
    const salt    = await bcrypt.genSalt(10);
    const hashed  = await bcrypt.hash(password, salt);

    // ─── BUILD PAYLOAD ─────────────────────────────────────────────────────
    const data = { role, name, phone, password: hashed, email };
    if (role === 'Company') {
      Object.assign(data, { companyName, vatOrPan, branches, isApproved: false });
    }

    // ─── CREATE USER ───────────────────────────────────────────────────────
    const user = await User.create(data);

    // ── Notify admin (only for new companies) ──────────────────────────────
    if (role === 'Company' && process.env.ADMIN_EMAIL) {
      console.log(`📧 Sending registration email to ${process.env.ADMIN_EMAIL} for ${companyName}`);
      sendEmail({
        to:      process.env.ADMIN_EMAIL,
        subject: `${companyName} Registration Pending Approval`,
        text:    `A new company "${companyName}" has registered and awaits your approval.`,
        html:    `<p>A new company <strong>${companyName}</strong> has registered and awaits your approval.</p>`
      }).catch(console.error);
    }

    // ─── RESPOND ───────────────────────────────────────────────────────────
    return res.status(201).json({
      _id:         user._id,
      role:        user.role,
      name:        user.name,
      email:       user.email,
      phone:       user.phone,
      companyName: user.companyName,
      vatOrPan:    user.vatOrPan,
      branches:    user.branches,
      token:       generateToken(user._id, user.role)
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

    // Find user
    const user = await User.findOne({ email }).lean();

    if (user && (await bcrypt.compare(password, user.password))) {
      // Block login if company not yet approved
      if (user.role === 'Company' && user.isApproved === false) {
        return res.status(403).json({ message: 'Company registration pending approval.' });
      }

      // Build response
      const resp = {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        phone: user.phone,
        token: generateToken(user._id, user.role)
      };

      if (user.role === 'Company') {
        Object.assign(resp, {
          companyName: user.companyName,
          vatOrPan:    user.vatOrPan,
          branches:    user.branches
        });
      }

      return res.json(resp);
    }

    // Wrong credentials
    return res.status(401).json({ message: 'Invalid email or password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while logging in.' });
  }
};
