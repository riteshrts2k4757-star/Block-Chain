require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased limit for local dev and polling
});
app.use('/api', limiter);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Import Routes (To be created)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/containers', require('./routes/containers'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/logbook', require('./routes/logbook'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/commands', require('./routes/commands'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/load-profiles', require('./routes/loadProfiles'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: err.message || 'Server Error'
    }
  });
});

module.exports = app;
