const { describe, it } = require('node:test');
const assert = require('node:assert');
const predictionService = require('../../src/services/prediction/PredictionService');
const recommendationService = require('../../src/services/recommendationService');

describe('Sprint 3 Unit Tests: Predictive Analytics & Recommendation Engine', () => {
  it('3.1 TimeBucketStrategy produces complete 16-hour forecast for Monday', () => {
    predictionService.setStrategy('timeBucket');
    const forecast = predictionService.getForecastForDay(1); // Monday

    assert.strictEqual(forecast.dayOfWeek, 1);
    assert.strictEqual(forecast.dayName, 'Monday');
    assert.strictEqual(forecast.predictions.length, 16); // 06:00 to 22:00

    const morningPeak = forecast.predictions.find((p) => p.hour === 8);
    const midAfternoon = forecast.predictions.find((p) => p.hour === 15);
    const eveningPeak = forecast.predictions.find((p) => p.hour === 18);

    assert.ok(morningPeak.predictedOccupancy > midAfternoon.predictedOccupancy, 'Morning peak should exceed 3 PM');
    assert.ok(eveningPeak.predictedOccupancy > midAfternoon.predictedOccupancy, 'Evening rush should exceed 3 PM');
  });

  it('3.2 Can dynamically switch between strategies (Strategy Pattern)', () => {
    predictionService.setStrategy('regression');
    assert.strictEqual(predictionService.getActiveStrategyName(), 'Polynomial Curve Regression Model');

    const regForecast = predictionService.getForecastForDay(2); // Tuesday
    assert.strictEqual(regForecast.predictions.length, 16);

    // Switch back
    predictionService.setStrategy('timeBucket');
    assert.strictEqual(predictionService.getActiveStrategyName(), 'Historical Time-Bucket Moving Average');
  });

  it('3.3 Recommendation Engine finds the lowest crowd slot in 17:00-20:00 window', () => {
    const recommendation = recommendationService.getBestTimeRecommendation('2026-12-05', 17, 20);

    assert.ok(recommendation.recommendedSlot, 'Should provide recommended slot');
    assert.ok(recommendation.recommendedSlot.hour >= 17 && recommendation.recommendedSlot.hour < 20);
    assert.ok(typeof recommendation.recommendedSlot.predictedOccupancy === 'number');
    assert.ok(recommendation.rankedAlternatives.length > 0);

    // Verify recommended slot has lower or equal occupancy compared to alternatives
    recommendation.rankedAlternatives.forEach((alt) => {
      assert.ok(
        recommendation.recommendedSlot.predictedOccupancy <= alt.predictedOccupancy,
        'Recommended slot must be the lowest predicted crowd in the window'
      );
    });
  });

  it('3.4 Prediction evaluation metric (MAE) meets academic benchmark <= 5.0 persons', () => {
    const metrics = predictionService.getEvaluationMetrics();
    assert.strictEqual(metrics.metric, 'Mean Absolute Error (MAE)');
    assert.ok(metrics.value <= 5.0, `MAE (${metrics.value}) must be <= 5.0 persons`);
    assert.strictEqual(metrics.status, 'EXCELLENT');
  });
});
