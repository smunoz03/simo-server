/**
 * CV service - handles CV upload, text extraction, and processing
 * @module services/cvService
 */

const fs = require('fs').promises;
const path = require('path');
const User = require('../models/userModel');
const { extractText } = require('../utils/pdfExtractor');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * Upload and process user's CV
 * @param {string} userId - User's ID
 * @param {Object} file - Uploaded file object from multer
 * @param {string} file.path - Absolute path to uploaded file
 * @param {string} file.mimetype - MIME type of uploaded file
 * @returns {Promise<Object>} Updated user with CV information
 */
exports.uploadUserCV = async (userId, file) => {
  if (!file) {
    throw new BadRequestError('Se requiere un archivo PDF.', 'FILE_REQUIRED');
  }

  // Validate file type
  if (file.mimetype !== 'application/pdf') {
    // Delete uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw new BadRequestError(
      'El archivo debe ser un PDF.',
      'INVALID_FILE_TYPE'
    );
  }

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    // Delete uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw new NotFoundError('Usuario no encontrado.', 'USER_NOT_FOUND');
  }

  // Delete previous CV file if exists
  if (user.cvFile) {
    const oldPath = path.join(__dirname, '../../', user.cvFile);
    await fs.unlink(oldPath).catch((err) => {
      // Ignore errors - file may have been manually removed
      console.warn('Could not delete old CV file:', err.message);
    });
  }

  // Extract text from uploaded CV
  let cvText;
  try {
    cvText = await extractText(file.path);
  } catch (error) {
    // Delete uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw new BadRequestError(
      'No se pudo extraer texto del PDF. Asegúrate de que sea un PDF válido.',
      'PDF_EXTRACTION_FAILED'
    );
  }

  // Validate extracted text
  if (!cvText || cvText.trim().length === 0) {
    // Delete uploaded file
    await fs.unlink(file.path).catch(() => {});
    throw new BadRequestError(
      'El PDF no contiene texto extraíble.',
      'EMPTY_PDF'
    );
  }

  // Save file path and extracted text to user
  const relativePath = path.relative(path.join(__dirname, '../..'), file.path);
  user.cvFile = relativePath;
  user.cvExtractedText = cvText;
  await user.save();

  return {
    id: user._id,
    cvFile: user.cvFile,
    cvExtractedTextLength: cvText.length,
    message: 'CV subido correctamente.',
  };
};

/**
 * Get user's CV text
 * @param {string} userId - User's ID
 * @returns {Promise<string>} Extracted CV text
 */
exports.getUserCVText = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado.', 'USER_NOT_FOUND');
  }

  if (!user.cvExtractedText) {
    throw new NotFoundError(
      'El usuario no tiene un CV cargado.',
      'CV_NOT_FOUND'
    );
  }

  return user.cvExtractedText;
};

/**
 * Delete user's CV
 * @param {string} userId - User's ID
 * @returns {Promise<void>}
 */
exports.deleteUserCV = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('Usuario no encontrado.', 'USER_NOT_FOUND');
  }

  if (!user.cvFile) {
    throw new NotFoundError(
      'El usuario no tiene un CV cargado.',
      'CV_NOT_FOUND'
    );
  }

  // Delete CV file
  const cvPath = path.join(__dirname, '../../', user.cvFile);
  await fs.unlink(cvPath).catch((err) => {
    console.warn('Could not delete CV file:', err.message);
  });

  // Delete associated JSON file if exists
  const jsonPath = cvPath.replace(/\.pdf$/i, '.json');
  await fs.unlink(jsonPath).catch(() => {});

  // Clear CV fields from user
  user.cvFile = undefined;
  user.cvExtractedText = undefined;
  await user.save();
};
