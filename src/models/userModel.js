// src/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isEmailConfirmed:      { type: Boolean, default: false },
  confirmationToken:     { type: String },
  confirmationTokenExpires: { type: Date },
  cvFile:                  { type: String },
  cvExtractedText:         { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
