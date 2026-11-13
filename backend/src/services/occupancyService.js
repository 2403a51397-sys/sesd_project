const occupancyRepository = require('../repositories/occupancyRepository');
const config = require('../config');

class OccupancyService {
  /**
   * Determine crowd categorization based on occupancy ratio
   * @param {number} occupancy
   * @param {number} capacity
   */
  calculateCrowdLevel(occupancy, capacity) {
    if (capacity <= 0) return { level: 'LOW', color: 'green', percentage: 0 };
    const percentage = Math.min(100, Math.round((occupancy / capacity) * 100));

    if (percentage < config.gym.crowdLowThreshold) {
      return { level: 'LOW', color: 'green', percentage };
    } else if (percentage <= config.gym.crowdHighThreshold) {
      return { level: 'MEDIUM', color: 'amber', percentage };
    } else {
      return { level: 'HIGH', color: 'red', percentage };
    }
  }

  /**
   * Get current live crowd status
   */
  getLiveCrowd() {
    const gym = occupancyRepository.getGymConfig();
    const crowdInfo = this.calculateCrowdLevel(gym.currentOccupancy, gym.maxCapacity);

    return {
      gymName: gym.gymName,
      currentOccupancy: gym.currentOccupancy,
      maxCapacity: gym.maxCapacity,
      occupancyPercentage: crowdInfo.percentage,
      crowdLevel: crowdInfo.level,
      statusColor: crowdInfo.color,
      operatingHours: `${gym.openHour}:00 - ${gym.closeHour}:00`,
      updatedAt: gym.updatedAt
    };
  }

  /**
   * Process a member check-in
   */
  checkIn(userId, checkInType = 'MANUAL_APP') {
    const isAlreadyIn = userId ? occupancyRepository.isUserCurrentlyCheckedIn(userId) : false;
    if (isAlreadyIn) {
      const error = new Error('You are already checked in. Please check out before checking in again.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const visit = occupancyRepository.recordCheckIn(userId, checkInType);
    const gym = occupancyRepository.getGymConfig();
    const crowd = this.calculateCrowdLevel(gym.currentOccupancy, gym.maxCapacity);

    return {
      ...visit,
      occupancyPercentage: crowd.percentage,
      crowdLevel: crowd.level,
      statusColor: crowd.color
    };
  }

  /**
   * Process a member check-out
   */
  checkOut(userId) {
    const visit = occupancyRepository.recordCheckOut(userId);
    const gym = occupancyRepository.getGymConfig();
    const crowd = this.calculateCrowdLevel(gym.currentOccupancy, gym.maxCapacity);

    return {
      ...visit,
      occupancyPercentage: crowd.percentage,
      crowdLevel: crowd.level,
      statusColor: crowd.color
    };
  }

  /**
   * Get visit history for authenticated member
   */
  getUserHistory(userId) {
    return occupancyRepository.getUserVisits(userId);
  }

  /**
   * Check if user is currently checked in
   */
  getUserStatus(userId) {
    return {
      isCheckedIn: occupancyRepository.isUserCurrentlyCheckedIn(userId)
    };
  }
}

module.exports = new OccupancyService();
