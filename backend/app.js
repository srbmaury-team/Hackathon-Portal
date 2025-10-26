const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const i18n = require("./config/i18n.js");
const i18nMiddleware = require("./middleware/i18nMiddleware.js");
const app = express();
const dotenv = require('dotenv')
dotenv.config();

// Connect to MongoDB only if not testing
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Initialize i18n
app.use(i18n.init);
app.use(i18nMiddleware);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

module.exports = app;
