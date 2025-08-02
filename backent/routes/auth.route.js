const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Google Auth
router.post('/google', authController.googleAuth);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router; 