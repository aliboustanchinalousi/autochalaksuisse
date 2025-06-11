const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', authController.login);

// Example of a protected route (to be implemented/used later)
// const { protect } = require('../middleware/auth.middleware');
// router.get('/me', protect, (req, res) => {
//   res.status(200).json({ status: 'success', data: { currentUser: req.user }});
// });

module.exports = router;
