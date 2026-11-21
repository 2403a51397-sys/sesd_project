const analyticsRepository = require('../repositories/analyticsRepository');
const occupancyRepository = require('../repositories/occupancyRepository');
const userRepository = require('../repositories/userRepository');

class AdminController {
  async getAnalytics(req, res, next) {
    try {
      const kpis = analyticsRepository.getSummaryKPIs();
      const weekly = analyticsRepository.getWeeklyTraffic();
      const hourly = analyticsRepository.getHourlyDistribution();

      // Identify peak hour
      let peakHour = null;
      let maxOcc = -1;
      hourly.forEach((h) => {
        if (h.average_occupancy > maxOcc) {
          maxOcc = h.average_occupancy;
          peakHour = h.hour;
        }
      });

      const period = peakHour >= 12 ? 'PM' : 'AM';
      const displayPeak = peakHour % 12 === 0 ? 12 : peakHour % 12;

      res.status(200).json({
        success: true,
        data: {
          kpis,
          weeklyTraffic: weekly,
          hourlyDistribution: hourly,
          peakHourLabel: `${displayPeak}:00 ${period} (Avg: ${maxOcc} persons)`
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateCapacity(req, res, next) {
    try {
      const { maxCapacity } = req.body;
      const capacityNum = parseInt(maxCapacity, 10);
      if (isNaN(capacityNum) || capacityNum <= 0) {
        const err = new Error('Capacity must be a positive integer.');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      const updated = occupancyRepository.updateCapacity(capacityNum);
      res.status(200).json({
        success: true,
        message: `Gym maximum capacity successfully updated to ${capacityNum}`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async listMembers(req, res, next) {
    try {
      const members = userRepository.findAll();
      res.status(200).json({
        success: true,
        data: members
      });
    } catch (err) {
      next(err);
    }
  }

  async updateMemberStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = userRepository.updateStatus(Number(id), isActive);
      if (!updated) {
        const err = new Error('User not found.');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }
      res.status(200).json({
        success: true,
        message: `User status updated to ${isActive ? 'Active' : 'Pending/Inactive'}`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteMember(req, res, next) {
    try {
      const { id } = req.params;
      userRepository.delete(Number(id));
      res.status(200).json({
        success: true,
        message: 'User removed successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  async createAnnouncement(req, res, next) {
    try {
      const { title, content, priority } = req.body;
      if (!title || !content) {
        const err = new Error('Title and content are required for announcements.');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      const announcement = analyticsRepository.createAnnouncement(
        req.user.id,
        title,
        content,
        priority || 'NORMAL'
      );

      res.status(201).json({
        success: true,
        message: 'Announcement posted successfully.',
        data: announcement
      });
    } catch (err) {
      next(err);
    }
  }

  async getAnnouncements(req, res, next) {
    try {
      const list = analyticsRepository.getAnnouncements();
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (err) {
      next(err);
    }
  }

  // Simulation Controls for Evaluation Demonstrations
  async simulateSurge(req, res, next) {
    try {
      const gym = occupancyRepository.getGymConfig();
      // Set to 88% rush
      const surgeCount = Math.round(gym.maxCapacity * 0.88);
      occupancyRepository.setOccupancy(surgeCount);

      res.status(200).json({
        success: true,
        message: `Simulated peak evening surge activated: ${surgeCount}/${gym.maxCapacity} (${88}%)`,
        currentOccupancy: surgeCount,
        crowdLevel: 'HIGH'
      });
    } catch (err) {
      next(err);
    }
  }

  async simulateReset(req, res, next) {
    try {
      const gym = occupancyRepository.getGymConfig();
      const baselineCount = Math.round(gym.maxCapacity * 0.28);
      occupancyRepository.setOccupancy(baselineCount);

      res.status(200).json({
        success: true,
        message: `Occupancy reset to baseline off-peak level: ${baselineCount}/${gym.maxCapacity} (${28}%)`,
        currentOccupancy: baselineCount,
        crowdLevel: 'LOW'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
