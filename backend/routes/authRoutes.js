// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { registerUser, authUser } = require('../controllers/authController');

// (Optional) smoke-test:
// router.get('/', (req, res) => res.send('Auth routes live'));

// Registration endpoint
router.post('/register', registerUser);

// Login endpoint
router.post('/login', authUser);

module.exports = router;
