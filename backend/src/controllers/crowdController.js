const occupancyService = require('../services/occupancyService');
const predictionService = require('../services/prediction/PredictionService');
const recommendationService = require('../services/recommendationService');

class CrowdController {
  async getLive(req, res, next) {
    try {
      const data = occupancyService.getLiveCrowd();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getPredicted(req, res, next) {
    try {
      const { dayOfWeek, date } = req.query;
      let day = parseInt(dayOfWeek, 10);
      if (isNaN(day) && date) {
        const d = new Date(date + 'T00:00:00');
        day = d.getDay();
      }
      if (isNaN(day)) {
        day = new Date().getDay();
      }

      const data = predictionService.getForecastForDay(day);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getRecommendation(req, res, next) {
    try {
      const { date, start, end } = req.query;
      const data = recommendationService.getBestTimeRecommendation(date, start, end);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async getMetrics(req, res, next) {
    try {
      const data = predictionService.getEvaluationMetrics();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }

  async setStrategy(req, res, next) {
    try {
      const { strategy } = req.body;
      predictionService.setStrategy(strategy);
      res.status(200).json({
        success: true,
        message: `Prediction strategy updated to ${predictionService.getActiveStrategyName()}`,
        activeStrategy: predictionService.getActiveStrategyName()
      });
    } catch (err) {
      next(err);
    }
  }

  async checkIn(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const { checkInType } = req.body;
      const result = occupancyService.checkIn(userId, checkInType || 'MANUAL_APP');
      res.status(200).json({
        success: true,
        message: 'Check-in recorded successfully. Enjoy your workout!',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async checkOut(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const result = occupancyService.checkOut(userId);
      res.status(200).json({
        success: true,
        message: 'Check-out recorded. Great session!',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const status = occupancyService.getUserStatus(userId);
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const history = occupancyService.getUserHistory(userId);
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CrowdController();
