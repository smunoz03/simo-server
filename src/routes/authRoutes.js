// src/routes/authRoutes.js
const express = require('express');
const { register } = require('../controllers/authController');
const { registerValidation } = require('../middleware/validators');

const router = express.Router();
router.post('/register', registerValidation, register);
module.exports = router;
