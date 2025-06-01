// src/middleware/upload.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/cvs');
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use userId as filename (to ensure one-per-user)
    const userId = req.session.userId;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}${ext}`);
  }
});

// File filter: allow only .pdf and correct MIME
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' && file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF con Content-Type application/pdf'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // optional: max 5 MB
});

module.exports = upload;
