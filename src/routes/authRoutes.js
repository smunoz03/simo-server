// src/routes/authRoutes.js
const express = require('express');
const {
  register,
  login,
  confirmEmail
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation
} = require('../middleware/validators');

const router = express.Router();

// Registration
router.post('/register', registerValidation, register);

// Login
router.post('/login',    loginValidation,    login);

// Confirm token
router.get('/confirm/:token', confirmEmail);

module.exports = router;
