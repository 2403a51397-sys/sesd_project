const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const crowdRoutes = require('./routes/crowdRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger for debugging & development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/crowd', crowdRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shop', shopRoutes);

// Centralized error handling
app.use(errorMiddleware);

// Start server when run directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(` FitCrowd API Server running on port ${config.port} (${config.nodeEnv})`);
  });
}

module.exports = app;
