/**
 * Standardized response formatting utilities
 * @module utils/responseFormatter
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response data
 * @param {string} [message] - Optional success message
 */
exports.sendSuccess = (res, statusCode, data, message = null) => {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  };
  res.status(statusCode).json(response);
};

/**
 * Send a successful response with data
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 */
exports.sendOk = (res, data) => {
  exports.sendSuccess(res, 200, data);
};

/**
 * Send a successful creation response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} [message] - Optional success message
 */
exports.sendCreated = (res, data, message = null) => {
  exports.sendSuccess(res, 201, data, message);
};

/**
 * Send a no content response (204)
 * @param {Object} res - Express response object
 */
exports.sendNoContent = (res) => {
  res.status(204).send();
};
