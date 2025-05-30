// src/config/db.js
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

module.exports = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI not set');
  }
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB connected');
};
