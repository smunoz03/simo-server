// src/routes/authRoutes.js
const express = require('express');
const {
  register,
  login,
  confirmEmail,
  getMe,
  uploadCv
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation
} = require('../middleware/validators');

const upload = require('../middleware/upload');

const requireAuth = require('../middleware/auth');
const router = express.Router();

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login',    loginValidation,    login);
router.get('/confirm/:token', confirmEmail);

// Protected Routes
router.get('/me', requireAuth, getMe);
router.post(
  '/upload_cv',
  requireAuth,
  upload.single('cv'),    // ← “cv” is the field name in the multipart/form-data
  uploadCv
);

module.exports = router;
