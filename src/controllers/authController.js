// src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const User   = require('../models/userModel');
const { sendEmail } = require('../utils/email');

/**
 * @desc   Get current user’s info (except password)
 * @route  GET /api/me
 * @access Private (requires session)
 */
exports.getMe = async (req, res, next) => {
  try {
    // req.session.userId was set at login/registration
    const user = await User.findById(req.session.userId)
      .select('-password'); // exclude password field

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user });
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

  const { name, password } = req.body;
  const email = String(req.body.email).trim().toLowerCase();
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

exports.uploadCv = async (req, res, next) => {
  try {
    // 1) Ensure multer accepted a file
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere un archivo PDF.' });
    }

    // 2) Find the logged-in user
    const userId = req.session.userId;
    const user = await User.findById(userId);
    if (!user) {
      // In case somehow session.userId is invalid
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // 3) Delete previous CV file if exists
    if (user.cvFile) {
      const oldPath = path.join(__dirname, '../../', user.cvFile);
      fs.unlink(oldPath, (err) => {
        // ignore errors: maybe file was manually removed
      });
    }

    // 4) Save new file’s relative path in DB
    //    req.file.path is absolute or relative depending on multer; we store a relative path
    const relativePath = path.relative(path.join(__dirname, '../..'), req.file.path);
    user.cvFile = relativePath;
    await user.save();

    // 5) Respond with success
    return res.json({
      message: 'CV subido correctamente.',
      cvFile: user.cvFile
    });
  } catch (err) {
    next(err);
  }
};