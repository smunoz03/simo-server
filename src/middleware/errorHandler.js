// src/middleware/errorHandler.js
exports.notFound = (req, res) =>
  res.status(404).json({ message: `Not Found: ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};
