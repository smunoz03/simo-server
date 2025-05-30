// src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User   = require('../models/userModel');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res, next) => {
  // 1) Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  try {
    // 2) Check duplicate
    const email = String(req.body.email).toLowerCase();
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    // 3) Hash
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    // 4) Save
    const user = await User.create({ name, email, password: hash });

    // 5) Set session
    req.session.userId = user._id;

    // 6) Respond
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Register new user & send confirmation email
 */
exports.register = async (req, res, next) => {
  // validate…
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'El correo ya está en uso' });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);

    // generate confirmation token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 24*60*60*1000; // 24h

    const user = await User.create({
      name, email, password: hash,
      confirmationToken: token,
      confirmationTokenExpires: expires
    });

    // send email
    const confirmUrl = `${process.env.BASE_URL}/api/auth/confirm/${token}`;
    const html = `<p>Hola ${name},</p>
      <p>Haz clic <a href="${confirmUrl}">aquí</a> para confirmar tu correo.</p>`;
    await sendEmail(email, 'Confirma tu correo en FaciliSIMO', html);

    console.log('✉️ Confirmation URL:', confirmUrl);
    // set session if desired
    req.session.userId = user._id;

    return res.status(201).json({
      message: 'Registrado. Revisa tu correo para confirmar.',
      user: { id: user._id, name, email }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Confirm email via token
 */
exports.confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      confirmationToken: token,
      confirmationTokenExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    user.isEmailConfirmed = true;
    user.confirmationToken = undefined;
    user.confirmationTokenExpires = undefined;
    await user.save();
    return res.json({ message: 'Email confirmado con éxito' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Login user (only if email confirmed)
 */
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const email    = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    if (!user.isEmailConfirmed) {
      return res.status(403).json({ message: 'Por favor confirma tu correo antes de entrar.' });
    }
    req.session.userId = user._id;
    return res.json({
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};