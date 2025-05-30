// src/middleware/validators.js
const { check } = require('express-validator');

// up to 4-char TLDs
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

exports.registerValidation = [
  check('name',     'El nombre es obligatorio').notEmpty(),
  check('email',    'Correo electrónico inválido').matches(emailRegex),
  check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
];

// ─── Login validation ───────────────────────────────────────────────────────────
exports.loginValidation = [
  check('email',    'Correo electrónico inválido').matches(emailRegex),
  check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
];