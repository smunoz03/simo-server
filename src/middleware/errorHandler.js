// src/middleware/errorHandler.js
const { AppError, ValidationError } = require('../utils/errors');
const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors from express-validator
 */
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    throw new ValidationError('Error de validación', formattedErrors);
  }
  next();
};

/**
 * 404 Not Found handler
 */
exports.notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.originalUrl}`,
    },
  });
};

/**
 * Global error handler
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  // Handle operational errors (expected errors)
  if (err.isOperational) {
    const response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Include validation errors if present
    if (err.errors && err.errors.length > 0) {
      response.error.details = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Error de validación de datos',
        details: errors,
      },
    });
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: `El valor del campo '${field}' ya existe`,
        field,
      },
    });
  }

  // Handle mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'ID inválido',
      },
    });
  }

  // Handle unexpected errors (programming errors)
  console.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};
