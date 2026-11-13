const express = require('express');
const crowdController = require('../controllers/crowdController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes for live & predicted crowd data
router.get('/live', (req, res, next) => crowdController.getLive(req, res, next));
router.get('/predicted', (req, res, next) => crowdController.getPredicted(req, res, next));
router.get('/recommend', (req, res, next) => crowdController.getRecommendation(req, res, next));
router.get('/metrics', (req, res, next) => crowdController.getMetrics(req, res, next));
router.post('/strategy', (req, res, next) => crowdController.setStrategy(req, res, next));

// Authenticated routes
router.post('/check-in', authMiddleware, (req, res, next) => crowdController.checkIn(req, res, next));
router.post('/check-out', authMiddleware, (req, res, next) => crowdController.checkOut(req, res, next));
router.get('/my-status', authMiddleware, (req, res, next) => crowdController.getMyStatus(req, res, next));
router.get('/my-history', authMiddleware, (req, res, next) => crowdController.getMyHistory(req, res, next));

module.exports = router;
