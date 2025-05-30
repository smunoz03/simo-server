// src/routes/authRoutes.js
const express = require('express');
const {
  register,
  login
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

module.exports = router;
