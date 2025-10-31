/**
 * Authentication middleware - verifies user session
 * @module middleware/auth
 */

const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware to require authentication via session
 * @throws {UnauthorizedError} If user is not authenticated
 */
module.exports = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔒 Auth check, session:', req.session);
  }

  if (req.session && req.session.userId) {
    return next();
  }

  throw new UnauthorizedError(
    'No estás autenticado. Por favor inicia sesión.',
    'NOT_AUTHENTICATED'
  );
};
