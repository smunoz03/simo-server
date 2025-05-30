// src/controllers/jobController.js
const Job = require('../models/jobModel');

exports.getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (err) { next(err); }
};

exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) { next(err); }
};
