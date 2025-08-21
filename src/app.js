// src/app.js
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/authRoutes');
const { getMe } = require('./controllers/authController');
const requireAuth = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ───SESSION SETUP──────────────────────────────────────────────────────────────
app.use(session({
    name: 'faciliSIMO.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
  }
}));
// ────────────────────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.get('/api/me', requireAuth, getMe);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
