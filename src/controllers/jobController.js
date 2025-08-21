// src/controllers/jobController.js
const Job = require('../models/jobModel');
const User = require('../models/userModel');
const { getEmbedding, compareWithChat } = require('../utils/geminiHelper');
const path = require('path');
const fs = require('fs');

exports.validateCV = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId    = req.session.userId;

    // 1) Fetch job and ensure JD text is available
    const job = await Job.findById(jobId);
    if (!job || !job.jdExtractedText) {
      return res.status(404).json({ message: 'Job no encontrado o sin texto de JD.' });
    }

    // 2) Fetch user and ensure CV text is available
    const user = await User.findById(userId);
    if (!user || (!user.cvFile && !user.cvExtractedText)) {
      return res.status(404).json({ message: 'Usuario no encontrado o sin CV subido.' });
    }

    // 3) Determine CV text
    let cvText = user.cvExtractedText;
    if (!cvText) {
      const cvPath = path.join(__dirname, '../..', user.cvFile);
      if (!fs.existsSync(cvPath)) {
        return res.status(404).json({ message: 'Archivo CV no encontrado en el servidor.' });
      }
      cvText = await extractText(cvPath);
    }


    // 4) Ask Gemini (via GenAI SDK) to compare
    const result = await compareWithChat(job.jdExtractedText, cvText);
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
