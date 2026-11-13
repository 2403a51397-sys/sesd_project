const db = require('../models/db');

class AnalyticsRepository {
  /**
   * Aggregate average occupancy by hour of the day across all historical data
   */
  getHourlyDistribution() {
    return db.query(`
      SELECT 
        CAST(strftime('%H', check_in_time) AS INTEGER) AS hour,
        ROUND(COUNT(id) * 1.0 / MAX(1, COUNT(DISTINCT DATE(check_in_time))), 1) AS average_occupancy
      FROM visits
      WHERE check_in_time >= datetime('now', '-28 days')
      GROUP BY hour
      HAVING hour >= 6 AND hour <= 21
      ORDER BY hour ASC;
    `);
  }

  /**
   * Aggregate total visits by day of the week
   */
  getWeeklyTraffic() {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const rows = db.query(`
      SELECT 
        CAST(strftime('%w', check_in_time) AS INTEGER) AS day_of_week,
        ROUND(COUNT(id) * 1.0 / MAX(1, COUNT(DISTINCT DATE(check_in_time))), 0) AS average_daily_visits,
        COUNT(id) AS total_visits
      FROM visits
      WHERE check_in_time >= datetime('now', '-28 days')
      GROUP BY day_of_week
      ORDER BY day_of_week ASC;
    `);

    return rows.map((r) => ({
      dayOfWeek: r.day_of_week,
      dayName: dayNames[r.day_of_week],
      averageDailyVisits: r.average_daily_visits,
      totalVisits: r.total_visits
    }));
  }

  /**
   * Get high-level summary KPIs for Admin Dashboard
   */
  getSummaryKPIs() {
    const gym = db.get('SELECT max_capacity, current_occupancy FROM gym_config WHERE id = 1;');
    const totalUsers = db.get("SELECT COUNT(*) AS count FROM users WHERE role = 'member';");
    const totalVisits = db.get('SELECT COUNT(*) AS count FROM visits;');
    const todayVisits = db.get(`
      SELECT COUNT(*) AS count FROM visits 
      WHERE DATE(check_in_time) = DATE('now', 'localtime');
    `);
    const activeBookings = db.get("SELECT COUNT(*) AS count FROM bookings WHERE status = 'BOOKED';");

    const capacity = gym ? gym.max_capacity : 100;
    const current = gym ? gym.current_occupancy : 0;
    const utilizationRate = Math.round((current / capacity) * 100);

    return {
      currentOccupancy: current,
      maxCapacity: capacity,
      utilizationRate,
      totalRegisteredMembers: totalUsers ? totalUsers.count : 0,
      totalVisitsLogged: totalVisits ? totalVisits.count : 0,
      todayVisitsCount: todayVisits ? todayVisits.count : 0,
      activeSlotBookings: activeBookings ? activeBookings.count : 0
    };
  }

  /**
   * Create an announcement
   */
  createAnnouncement(authorId, title, content, priority = 'NORMAL') {
    const res = db.run(
      `INSERT INTO announcements (author_id, title, content, priority)
       VALUES (?, ?, ?, ?);`,
      [authorId, title, content, priority]
    );
    return db.get('SELECT * FROM announcements WHERE id = ?;', [res.lastInsertRowid]);
  }

  /**
   * Get latest announcements
   */
  getAnnouncements(limit = 5) {
    return db.query(
      `SELECT a.id, a.title, a.content, a.priority, a.created_at, u.full_name AS author_name
       FROM announcements a
       JOIN users u ON a.author_id = u.id
       ORDER BY a.created_at DESC
       LIMIT ?;`,
      [limit]
    );
  }
}

module.exports = new AnalyticsRepository();
