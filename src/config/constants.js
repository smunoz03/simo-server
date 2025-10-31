/**
 * Application-wide constants
 * @module config/constants
 */

module.exports = {
  // Password hashing
  BCRYPT_SALT_ROUNDS: 12,

  // Token expiration times
  EMAIL_CONFIRMATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in ms

  // Session
  SESSION_COOKIE_NAME: 'faciliSIMO.sid',
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours in ms

  // File upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf'],
  CV_UPLOAD_PATH: 'uploads/cvs',

  // Job matching
  JOB_MATCH_SCORE_THRESHOLD: 70,
  WEEKLY_JOB_DEFAULT_DAY: 1, // Monday (0=Sunday, 1=Monday, etc.)
  WEEKLY_JOB_DEFAULT_HOUR: 3,
  WEEKLY_JOB_DEFAULT_MINUTE: 0,

  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,

  // HTTP Status Codes (for reference)
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  },
};
