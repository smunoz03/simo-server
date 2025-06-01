// src/routes/authRoutes.js
const express = require('express');
const {
  register,
  login,
  confirmEmail,
  getMe
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation
} = require('../middleware/validators');

const requireAuth = require('../middleware/auth');
const router = express.Router();

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login',    loginValidation,    login);
router.get('/confirm/:token', confirmEmail);

// Protected Routes
router.get('/me', requireAuth, getMe);

module.exports = router;
