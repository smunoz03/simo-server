// src/routes/jobRoutes.js
const express = require('express');
const { getJobs, createJob } = require('../controllers/jobController');
const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(createJob);

module.exports = router;
