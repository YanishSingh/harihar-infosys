// backend/routes/userRoutes.js

const express = require('express');
const router  = express.Router();
const { getUserProfile } = require('../controllers/userController');
const { protect }        = require('../middleware/authMiddleware');

// GET /api/user/profile
router.get('/profile', protect, getUserProfile);

module.exports = router;
