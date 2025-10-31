/**
 * Authentication controller - handles HTTP requests for authentication
 * @module controllers/authController
 */

const authService = require('../services/authService');
const cvService = require('../services/cvService');
const { sendSuccess, sendCreated } = require('../utils/responseFormatter');

/**
 * @desc   Get current user's info (except password)
 * @route  GET /api/me
 * @access Private (requires session)
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.session.userId);
    sendSuccess(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Register new user & send confirmation email
 * @route  POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

    const user = await authService.registerUser(
      { name, email, password },
      baseUrl
    );

    // Set session
    req.session.userId = user.id;

    sendCreated(
      res,
      { user },
      'Registrado. Revisa tu correo para confirmar.'
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Confirm email via token
 * @route  GET /api/auth/confirm/:token
 * @access Public
 */
exports.confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    await authService.confirmEmail(token);

    sendSuccess(res, 200, null, 'Email confirmado con éxito');
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Login user (only if email confirmed)
 * @route  POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginUser(email, password);

    // Set session
    req.session.userId = user.id;

    sendSuccess(res, 200, { user });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Upload CV for current user
 * @route  POST /api/auth/upload_cv
 * @access Private (requires session)
 */
exports.uploadCv = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const result = await cvService.uploadUserCV(userId, req.file);

    sendSuccess(res, 200, { cvFile: result.cvFile }, result.message);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Logout user
 * @route  POST /api/auth/logout
 * @access Private (requires session)
 */
exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie(process.env.SESSION_COOKIE_NAME || 'faciliSIMO.sid');
    sendSuccess(res, 200, null, 'Sesión cerrada correctamente');
  });
};
