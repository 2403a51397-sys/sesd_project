require('dotenv').config();
const path = require('path');

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_fitcrowd_dev_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  db: {
    path: path.resolve(__dirname, '../../', process.env.DB_PATH || './data/fitcrowd.db')
  },
  gym: {
    defaultCapacity: parseInt(process.env.DEFAULT_GYM_CAPACITY, 10) || 100,
    defaultSlotCapacity: parseInt(process.env.DEFAULT_SLOT_CAPACITY, 10) || 25,
    crowdLowThreshold: parseInt(process.env.CROWD_LOW_THRESHOLD, 10) || 50,
    crowdHighThreshold: parseInt(process.env.CROWD_HIGH_THRESHOLD, 10) || 80
  }
};
