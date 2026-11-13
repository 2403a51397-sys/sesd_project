const predictionService = require('./prediction/PredictionService');
const bookingRepository = require('../repositories/bookingRepository');

class RecommendationService {
  /**
   * Recommend the optimal workout hour within a user-specified window
   * @param {string} dateString YYYY-MM-DD
   * @param {number} startHour e.g. 17
   * @param {number} endHour e.g. 20
   */
  getBestTimeRecommendation(dateString, startHour = 17, endHour = 20) {
    const targetDate = dateString || new Date().toISOString().split('T')[0];
    const dateObj = new Date(targetDate + 'T00:00:00');
    const dayOfWeek = isNaN(dateObj.getDay()) ? new Date().getDay() : dateObj.getDay();

    const start = Math.max(6, Math.min(21, parseInt(startHour, 10)));
    const end = Math.max(start + 1, Math.min(22, parseInt(endHour, 10)));

    // 1. Get 24-hr predicted curve for target day of week
    const forecast = predictionService.getForecastForDay(dayOfWeek);

    // 2. Filter predictions strictly within user's preferred window [start, end)
    const windowSlots = forecast.predictions.filter((p) => p.hour >= start && p.hour < end);

    if (windowSlots.length === 0) {
      const err = new Error('No operating hours found within the requested time window.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    // 3. Sort window slots ascending by predicted occupancy to find lowest crowd
    const sortedWindow = [...windowSlots].sort((a, b) => a.predictedOccupancy - b.predictedOccupancy);
    const bestHourPrediction = sortedWindow[0];

    // 4. Retrieve live slot availability for that target date to give direct booking option
    const dailySlots = bookingRepository.findOrCreateSlotsByDate(targetDate);
    const matchingLiveSlot = dailySlots.find((s) => s.start_hour === bestHourPrediction.hour);

    return {
      targetDate,
      dayName: forecast.dayName,
      preferredWindow: `${start}:00 - ${end}:00`,
      strategyUsed: forecast.strategyUsed,
      recommendedSlot: {
        hour: bestHourPrediction.hour,
        timeLabel: bestHourPrediction.timeLabel,
        predictedOccupancy: bestHourPrediction.predictedOccupancy,
        occupancyPercentage: bestHourPrediction.occupancyPercentage,
        crowdLevel: bestHourPrediction.crowdLevel,
        statusColor: bestHourPrediction.statusColor,
        slotId: matchingLiveSlot ? matchingLiveSlot.id : null,
        availableSeats: matchingLiveSlot ? Math.max(0, matchingLiveSlot.available_seats) : null,
        isFull: matchingLiveSlot ? matchingLiveSlot.current_bookings >= matchingLiveSlot.max_capacity : false
      },
      rankedAlternatives: sortedWindow.slice(1).map((item) => ({
        hour: item.hour,
        timeLabel: item.timeLabel,
        predictedOccupancy: item.predictedOccupancy,
        occupancyPercentage: item.occupancyPercentage,
        crowdLevel: item.crowdLevel,
        statusColor: item.statusColor
      }))
    };
  }
}

module.exports = new RecommendationService();
