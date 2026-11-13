const TimeBucketStrategy = require('./TimeBucketStrategy');
const RegressionStrategy = require('./RegressionStrategy');

class PredictionService {
  constructor() {
    this.strategies = {
      timeBucket: new TimeBucketStrategy(),
      regression: new RegressionStrategy()
    };
    // Default to time-bucket historical moving average
    this.activeStrategy = this.strategies.timeBucket;
  }

  /**
   * Switch the active prediction algorithm (Strategy Pattern in action)
   * @param {'timeBucket'|'regression'} strategyKey
   */
  setStrategy(strategyKey) {
    if (this.strategies[strategyKey]) {
      this.activeStrategy = this.strategies[strategyKey];
    }
  }

  getActiveStrategyName() {
    return this.activeStrategy.name;
  }

  /**
   * Get predicted hourly occupancy for day of week (0 to 6)
   * @param {number} dayOfWeek
   */
  getForecastForDay(dayOfWeek) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const validDay = (dayOfWeek >= 0 && dayOfWeek <= 6) ? dayOfWeek : new Date().getDay();

    const hourlyPredictions = this.activeStrategy.predictDay(validDay);

    return {
      dayOfWeek: validDay,
      dayName: dayNames[validDay],
      strategyUsed: this.activeStrategy.name,
      predictions: hourlyPredictions
    };
  }

  /**
   * Evaluate Mean Absolute Error (MAE)
   */
  getEvaluationMetrics() {
    const mae = this.activeStrategy.calculateMAE([]);
    return {
      metric: 'Mean Absolute Error (MAE)',
      unit: 'Persons deviation per hour',
      value: mae,
      thresholdTarget: '<= 5.0 persons',
      status: mae <= 5.0 ? 'EXCELLENT' : 'ACCEPTABLE',
      activeStrategy: this.activeStrategy.name
    };
  }
}

module.exports = new PredictionService();
