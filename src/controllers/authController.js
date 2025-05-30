// src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User   = require('../models/userModel');

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

// @desc   Login an existing user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  // 1) Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2) Destructure & cast to strings
  const email    = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);

  try {
    // 3) Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 4) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 5) Set session cookie
    req.session.userId = user._id;

    // 6) Success response
    return res.json({
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
};
