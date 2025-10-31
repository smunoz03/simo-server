/**
 * Authentication routes
 * @module routes/authRoutes
 */

const express = require('express');
const {
  register,
  login,
  confirmEmail,
  getMe,
  uploadCv,
  logout,
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
} = require('../middleware/validators');
const { handleValidationErrors } = require('../middleware/errorHandler');
const upload = require('../middleware/upload');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Public Routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/confirm/:token', confirmEmail);

// Protected Routes
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.post(
  '/upload_cv',
  requireAuth,
  upload.single('cv'),
  uploadCv
);

module.exports = router;
