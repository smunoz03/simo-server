// server.js
require('dotenv').config();
const http      = require('http');
const app       = require('./src/app');
const connectDB = require('./src/config/db');
const { scheduleWeeklyCvJobCompare } = require('./src/jobs/weeklyCvJobCompare');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    // Start weekly comparison job if enabled via env
    scheduleWeeklyCvJobCompare();
    http.createServer(app).listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();
