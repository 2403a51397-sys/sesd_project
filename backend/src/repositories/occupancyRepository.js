const db = require('../models/db');
const config = require('../config');

/**
 * OccupancyRepository: Manages real-time gym floor counters, check-in/out logs, and visit history.
 */
class OccupancyRepository {
  /**
   * Get current gym floor occupancy and maximum capacity
   * @returns {{ currentOccupancy: number, maxCapacity: number, openHour: number, closeHour: number, gymName: string }}
   */
  getGymConfig() {
    let row = db.get('SELECT * FROM gym_config WHERE id = 1;');
    if (!row) {
      db.run(
        `INSERT INTO gym_config (id, gym_name, max_capacity, current_occupancy, open_hour, close_hour) 
         VALUES (1, ?, ?, 0, 6, 22);`,
        ['FitCrowd Center', config.gym.defaultCapacity]
      );
      row = db.get('SELECT * FROM gym_config WHERE id = 1;');
    }
    return {
      gymName: row.gym_name,
      maxCapacity: row.max_capacity,
      currentOccupancy: row.current_occupancy,
      openHour: row.open_hour,
      closeHour: row.close_hour,
      updatedAt: row.updated_at
    };
  }

  /**
   * Update gym floor capacity (Admin action)
   * @param {number} newCapacity
   */
  updateCapacity(newCapacity) {
    db.run(
      'UPDATE gym_config SET max_capacity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;',
      [newCapacity]
    );
    return this.getGymConfig();
  }

  /**
   * Atomically adjust current occupancy with non-negative bounds
   * @param {number} delta (+1 for check-in, -1 for check-out)
   * @returns {number} new occupancy count
   */
  adjustOccupancy(delta) {
    return db.transaction(() => {
      const current = db.get('SELECT current_occupancy, max_capacity FROM gym_config WHERE id = 1;');
      let nextCount = (current ? current.current_occupancy : 0) + delta;
      if (nextCount < 0) nextCount = 0;

      db.run(
        'UPDATE gym_config SET current_occupancy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;',
        [nextCount]
      );
      return nextCount;
    });
  }

  /**
   * Directly set occupancy (for simulation surges and testing)
   * @param {number} count
   */
  setOccupancy(count) {
    const validCount = Math.max(0, count);
    db.run(
      'UPDATE gym_config SET current_occupancy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;',
      [validCount]
    );
    return validCount;
  }

  /**
   * Record a member check-in event
   * @param {number|null} userId
   * @param {string} checkInType
   * @returns {Object} visit record
   */
  recordCheckIn(userId = null, checkInType = 'MANUAL_APP') {
    return db.transaction(() => {
      const visitInfo = db.run(
        `INSERT INTO visits (user_id, check_in_time, check_in_type)
         VALUES (?, CURRENT_TIMESTAMP, ?);`,
        [userId, checkInType]
      );

      // Increment live occupancy counter
      const current = db.get('SELECT current_occupancy, max_capacity FROM gym_config WHERE id = 1;');
      const nextCount = (current.current_occupancy || 0) + 1;
      db.run('UPDATE gym_config SET current_occupancy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;', [nextCount]);

      return {
        visitId: visitInfo.lastInsertRowid,
        userId,
        checkInTime: new Date().toISOString(),
        currentOccupancy: nextCount
      };
    });
  }

  /**
   * Record a member check-out event
   * @param {number|null} userId
   * @returns {Object}
   */
  recordCheckOut(userId = null) {
    return db.transaction(() => {
      let visit = null;
      if (userId) {
        // Find latest active visit for this user without a checkout time
        visit = db.get(
          `SELECT id, check_in_time FROM visits 
           WHERE user_id = ? AND check_out_time IS NULL 
           ORDER BY check_in_time DESC LIMIT 1;`,
          [userId]
        );
      }

      if (visit) {
        db.run(
          `UPDATE visits 
           SET check_out_time = CURRENT_TIMESTAMP,
               duration_minutes = ROUND((JULIANDAY(CURRENT_TIMESTAMP) - JULIANDAY(check_in_time)) * 1440)
           WHERE id = ?;`,
          [visit.id]
        );
      }

      // Decrement live occupancy counter (minimum 0)
      const current = db.get('SELECT current_occupancy FROM gym_config WHERE id = 1;');
      const nextCount = Math.max(0, (current.current_occupancy || 0) - 1);
      db.run('UPDATE gym_config SET current_occupancy = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1;', [nextCount]);

      return {
        visitId: visit ? visit.id : null,
        userId,
        checkOutTime: new Date().toISOString(),
        currentOccupancy: nextCount
      };
    });
  }

  /**
   * Get user visit history
   * @param {number} userId
   * @param {number} limit
   * @returns {Array<Object>}
   */
  getUserVisits(userId, limit = 20) {
    return db.query(
      `SELECT id, check_in_time, check_out_time, duration_minutes, check_in_type
       FROM visits
       WHERE user_id = ?
       ORDER BY check_in_time DESC
       LIMIT ?;`,
      [userId, limit]
    );
  }

  /**
   * Check if a specific user currently has an open (checked-in) visit
   * @param {number} userId
   * @returns {boolean}
   */
  isUserCurrentlyCheckedIn(userId) {
    const active = db.get(
      'SELECT id FROM visits WHERE user_id = ? AND check_out_time IS NULL LIMIT 1;',
      [userId]
    );
    return !!active;
  }
}

module.exports = new OccupancyRepository();
