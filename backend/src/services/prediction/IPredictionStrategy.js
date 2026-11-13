/**
 * Strategy Pattern Interface for FitCrowd Prediction Engine
 * Every concrete strategy must implement predictDay(dayOfWeek) and calculateMAE(actualData).
 */
class IPredictionStrategy {
  constructor(name) {
    this.name = name;
  }

  /**
   * Predict hourly occupancy for a specific day of the week (0 = Sunday, 1 = Monday, ... 6 = Saturday)
   * @param {number} dayOfWeek
   * @returns {Array<{ hour: number, predictedOccupancy: number, occupancyPercentage: number, crowdLevel: string }>}
   */
  predictDay(dayOfWeek) {
    throw new Error('Method predictDay() must be implemented by concrete strategy');
  }

  /**
   * Compute Mean Absolute Error (MAE) against test records
   * @param {Array<Object>} actuals
   * @returns {number}
   */
  calculateMAE(actuals) {
    throw new Error('Method calculateMAE() must be implemented by concrete strategy');
  }
}

module.exports = IPredictionStrategy;
