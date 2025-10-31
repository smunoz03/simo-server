/**
 * Validation middleware using express-validator
 * @module middleware/validators
 */

const { body } = require('express-validator');
const {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
} = require('../config/constants');

// Email regex that supports up to 4-char TLDs
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * Validation rules for user registration
 */
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: MAX_NAME_LENGTH })
    .withMessage(`El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`)
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio')
    .isLength({ max: MAX_EMAIL_LENGTH })
    .withMessage(`El correo electrónico no puede exceder ${MAX_EMAIL_LENGTH} caracteres`)
    .matches(emailRegex)
    .withMessage('Correo electrónico inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
    .isLength({ max: MAX_PASSWORD_LENGTH })
    .withMessage(`La contraseña no puede exceder ${MAX_PASSWORD_LENGTH} caracteres`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
];

/**
 * Validation rules for user login
 */
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio')
    .matches(emailRegex)
    .withMessage('Correo electrónico inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage('Contraseña inválida'),
];