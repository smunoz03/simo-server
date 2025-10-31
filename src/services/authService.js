/**
 * Authentication service - handles user registration, login, and email confirmation
 * @module services/authService
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/email');
const {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} = require('../utils/errors');
const {
  BCRYPT_SALT_ROUNDS,
  EMAIL_CONFIRMATION_TOKEN_EXPIRY,
} = require('../config/constants');

/**
 * Register a new user with email confirmation
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} baseUrl - Base URL for confirmation link
 * @returns {Promise<Object>} Created user object (without password)
 */
exports.registerUser = async ({ name, email, password }, baseUrl) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError('El correo ya está en uso', 'EMAIL_IN_USE');
  }

  // Hash password
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate confirmation token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = Date.now() + EMAIL_CONFIRMATION_TOKEN_EXPIRY;

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    confirmationToken: token,
    confirmationTokenExpires: tokenExpiry,
  });

  // Send confirmation email
  const confirmUrl = `${baseUrl}/api/auth/confirm/${token}`;
  const html = `
    <p>Hola ${name},</p>
    <p>Haz clic <a href="${confirmUrl}">aquí</a> para confirmar tu correo.</p>
    <p>Este enlace expira en 24 horas.</p>
  `;

  try {
    await sendEmail(normalizedEmail, 'Confirma tu correo en FaciliSIMO', html);
    console.log('✉️ Confirmation email sent:', confirmUrl);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    // Don't fail registration if email fails - user can request resend
  }

  // Return user without password
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailConfirmed: user.isEmailConfirmed,
  };
};

/**
 * Confirm user's email with token
 * @param {string} token - Confirmation token
 * @returns {Promise<Object>} Confirmed user object
 */
exports.confirmEmail = async (token) => {
  const user = await User.findOne({
    confirmationToken: token,
    confirmationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError('Token inválido o expirado', 'INVALID_TOKEN');
  }

  // Mark email as confirmed and clear token
  user.isEmailConfirmed = true;
  user.confirmationToken = undefined;
  user.confirmationTokenExpires = undefined;
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isEmailConfirmed: user.isEmailConfirmed,
  };
};

/**
 * Authenticate user and validate credentials
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authenticated user object
 */
exports.loginUser = async (email, password) => {
  const normalizedEmail = String(email).trim().toLowerCase();

  // Find user
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  // Check if email is confirmed
  if (!user.isEmailConfirmed) {
    throw new ForbiddenError(
      'Por favor confirma tu correo antes de entrar.',
      'EMAIL_NOT_CONFIRMED'
    );
  }

  // Return user without password
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
};

/**
 * Get user by ID
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} User object without password
 */
exports.getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    throw new NotFoundError('Usuario no encontrado', 'USER_NOT_FOUND');
  }

  return user;
};
