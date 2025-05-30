// src/routes/jobRoutes.js
const express = require('express');
const { getJobs, createJob } = require('../controllers/jobController');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(requireAuth, getJobs)
  .post(requireAuth, createJob);

module.exports = router;
