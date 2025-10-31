/**
 * File upload middleware using multer
 * @module middleware/upload
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, CV_UPLOAD_PATH } = require('../config/constants');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../', CV_UPLOAD_PATH);
fs.mkdirSync(uploadDir, { recursive: true });

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.session.userId;
    const userHash = crypto.createHash('sha256').update(userId).digest('hex');
    const timestamp = Date.now().toString();
    const ext = path.extname(file.originalname).toLowerCase();

    // Ensure only one CV exists per user by removing old files
    const existing = fs.readdirSync(uploadDir).find(f => f.startsWith(userHash));
    if (existing) {
      fs.unlinkSync(path.join(uploadDir, existing));
    }

    // Hash userId + timestamp for the stored filename
    const uniqueHash = crypto
      .createHash('sha256')
      .update(userId + timestamp)
      .digest('hex');
    cb(null, `${userHash}-${uniqueHash}${ext}`);
  }
});

/**
 * File filter to allow only PDFs
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' && ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

/**
 * Configured multer instance
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

module.exports = upload;
