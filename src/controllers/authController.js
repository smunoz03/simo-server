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
