// src/middleware/auth.js
module.exports = (req, res, next) => {
  console.log('🔒 auth check, session:', req.session); // for debugging
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'No estás autenticado' });
};
