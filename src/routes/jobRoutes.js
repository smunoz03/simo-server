// src/routes/jobRoutes.js
const express = require('express');
const { validateCV } = require('../controllers/jobController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/:jobId/validate_cv', requireAuth, validateCV);

module.exports = router;
