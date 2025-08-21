// src/controllers/jobController.js
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const { compareWithChat } = require('../utils/geminiHelper');

exports.validateCV = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId    = req.session.userId;

    // 1) Fetch job and ensure JD JSON is available
    const job = await Job.findById(jobId);
    if (!job || !job.jdExtractedJson) {
      return res.status(404).json({ message: 'Job no encontrado o sin JSON de JD.' });
    }

    // 2) Fetch user and ensure CV text is available
    const user = await User.findById(userId);
    if (!user || !user.cvExtractedText) {
      return res.status(404).json({ message: 'Usuario no encontrado o sin CV procesado.' });
    }

    // 3) Grab CV text directly for comparison
    const cvText = user.cvExtractedText;
    const jdJson = JSON.stringify(job.jdExtractedJson);

    // 4) Ask Gemini (via GenAI SDK) to compare
    const result = await compareWithChat(jdJson, cvText);
    // result should be { canApply, score, reasons }

    return res.json({
      jobId,
      userId,
      ...result
    });
  } catch (err) {
    next(err);
  }
};
