require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cloudinaryRoutes = require('./routes/cloudinary.routes');
const recoveryRoutes = require('./routes/recovery.routes');
const RecoveryService = require('./services/recovery.service');

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiter: 100 requests per 15 minutes max
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// App API routes
app.use('/cloudinary', cloudinaryRoutes);
app.use('/recovery', recoveryRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred.'
  });
});

// Start hourly background purge job for expired recovery files
setInterval(() => {
  try {
    RecoveryService.purgeExpired();
  } catch (err) {
    console.error('Error in background purge task:', err);
  }
}, 60 * 60 * 1000); // 1 hour

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CleanDrive Backend running on http://localhost:${PORT}`);
  console.log(`To connect from a physical Android device, use your host's local IP address instead of localhost.`);
});
