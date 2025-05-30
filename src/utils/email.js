// src/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: +process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

/**
 * Send an email.
 * @param {string} to 
 * @param {string} subject 
 * @param {string} html 
 */
async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"FaciliSIMO" <no-reply@facilisimo.com>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
