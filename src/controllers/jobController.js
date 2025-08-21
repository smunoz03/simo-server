// src/controllers/jobController.js
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const { compareWithChat } = require('../utils/geminiHelper');

exports.validateCV = async (req, res, next) => {
  try {
    const userId = req.session.userId;

    // 1) Fetch user and ensure CV text is available
    const user = await User.findById(userId);
    if (!user || !user.cvExtractedText) {
      return res.status(404).json({ message: 'Usuario no encontrado o sin CV procesado.' });
    }
    const cvText = user.cvExtractedText;

    // 2) Evaluate against all jobs with JD JSON
    const jobs = await Job.find({ jdExtractedJson: { $exists: true } });

    const matches = [];
    for (const job of jobs) {
      const jdJson = JSON.stringify(job.jdExtractedJson);
      const result = await compareWithChat(jdJson, cvText);
      if (result && typeof result.score === 'number' && result.score >= 70 && result.score <= 100) {
        matches.push({ jobId: job._id.toString(), ...result });
      }
    }

    return res.json(matches);
  } catch (err) {
    next(err);
  }
};
