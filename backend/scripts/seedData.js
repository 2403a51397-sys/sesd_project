const db = require('../src/models/db');
const config = require('../src/config');

function formatLocalSqlDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

/**
 * Realistic 4-Week Synthetic Gym Visit Generator
 * Simulates real human behavior with dual-peak workday curves and weekend distributions.
 */
function generateSyntheticVisits() {
  console.log('--- Generating 4 Weeks of Synthetic Gym Visit History ---');

  const maxCapacity = config.gym.defaultCapacity; // 100
  const now = new Date();
  const totalDays = 28; // 4 weeks of history

  // Delete prior simulated visit data (keeping users and config intact)
  db.run("DELETE FROM visits WHERE check_in_type = 'SIMULATION';");

  let totalVisitsInserted = 0;

  db.transaction(() => {
    for (let dayOffset = totalDays; dayOffset >= 1; dayOffset--) {
      const currentDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Operating hours: 06:00 to 22:00
      for (let hour = 6; hour < 22; hour++) {
        // Base occupancy curve calculation
        let baseRatio = 0.18; // baseline minimum

        if (!isWeekend) {
          // Weekday traffic pattern
          if (hour >= 6 && hour <= 8) {
            // Morning peak (06:00 - 09:00): 60% - 75%
            baseRatio = 0.68;
          } else if (hour >= 9 && hour <= 11) {
            baseRatio = 0.40;
          } else if (hour >= 12 && hour <= 14) {
            // Lunchtime bump: 35% - 42%
            baseRatio = 0.38;
          } else if (hour >= 15 && hour <= 16) {
            // Mid-afternoon dip: 22% - 28%
            baseRatio = 0.25;
          } else if (hour >= 17 && hour <= 20) {
            // Evening peak (17:00 - 21:00): 78% - 92%
            baseRatio = 0.85;
          } else if (hour === 21) {
            baseRatio = 0.30;
          }
        } else {
          // Weekend traffic pattern (smoother morning/afternoon curve, lower evening)
          if (hour >= 8 && hour <= 12) {
            baseRatio = 0.72; // Weekend morning rush
          } else if (hour >= 13 && hour <= 16) {
            baseRatio = 0.45;
          } else if (hour >= 17 && hour <= 19) {
            baseRatio = 0.35;
          } else {
            baseRatio = 0.18;
          }
        }

        // Add Gaussian pseudo-noise (±8%)
        const noise = (Math.random() - 0.5) * 0.08;
        const targetRatio = Math.max(0.08, Math.min(0.95, baseRatio + noise));
        const estimatedVisits = Math.round(targetRatio * maxCapacity * 0.85);

        // Insert individual synthetic visit records across the hour
        for (let v = 0; v < estimatedVisits; v++) {
          const minuteOffset = Math.floor(Math.random() * 60);
          const duration = Math.floor(45 + Math.random() * 45); // 45 to 90 minutes

          const checkIn = new Date(currentDate);
          checkIn.setHours(hour, minuteOffset, 0, 0);

          const checkOut = new Date(checkIn.getTime() + duration * 60 * 1000);

          const checkInSql = formatLocalSqlDate(checkIn);
          const checkOutSql = formatLocalSqlDate(checkOut);

          db.run(
            `INSERT INTO visits (user_id, check_in_time, check_out_time, duration_minutes, check_in_type)
             VALUES (NULL, ?, ?, ?, 'SIMULATION');`,
            [checkInSql, checkOutSql, duration]
          );

          totalVisitsInserted++;
        }
      }
    }
  });

  console.log(` Successfully generated and inserted ${totalVisitsInserted} synthetic visit records across 28 days.`);
}

if (require.main === module) {
  generateSyntheticVisits();
}

module.exports = generateSyntheticVisits;
