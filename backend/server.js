require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const i18n = require("./config/i18n.js");
const i18nMiddleware = require("./middleware/i18nMiddleware.js");
const app = express();

// Connect to MongoDB
connectDB();

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
// app.use('/api/teams', require('./routes/teams'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
