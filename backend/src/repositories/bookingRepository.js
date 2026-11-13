const db = require('../models/db');
const config = require('../config');

class BookingRepository {
  /**
   * Find or dynamically generate hourly slots for a specific date
   * @param {string} slotDate YYYY-MM-DD
   * @returns {Array<Object>}
   */
  findOrCreateSlotsByDate(slotDate) {
    const defaultCapacity = config.gym.defaultSlotCapacity;

    // Check if slots already exist for this date
    let slots = db.query(
      `SELECT id, slot_date, start_hour, end_hour, max_capacity, current_bookings,
              (max_capacity - current_bookings) AS available_seats
       FROM slots 
       WHERE slot_date = ? 
       ORDER BY start_hour ASC;`,
      [slotDate]
    );

    // If no slots exist, seed default hourly slots from 06:00 to 22:00
    if (slots.length === 0) {
      db.transaction(() => {
        for (let hour = 6; hour < 22; hour++) {
          db.run(
            `INSERT OR IGNORE INTO slots (slot_date, start_hour, end_hour, max_capacity, current_bookings)
             VALUES (?, ?, ?, ?, 0);`,
            [slotDate, hour, hour + 1, defaultCapacity]
          );
        }
      });

      slots = db.query(
        `SELECT id, slot_date, start_hour, end_hour, max_capacity, current_bookings,
                (max_capacity - current_bookings) AS available_seats
         FROM slots 
         WHERE slot_date = ? 
         ORDER BY start_hour ASC;`,
        [slotDate]
      );
    }

    return slots;
  }

  /**
   * Find single slot by primary key id
   * @param {number} slotId
   * @returns {Object|null}
   */
  findSlotById(slotId) {
    return db.get(
      `SELECT id, slot_date, start_hour, end_hour, max_capacity, current_bookings,
              (max_capacity - current_bookings) AS available_seats
       FROM slots WHERE id = ?;`,
      [slotId]
    );
  }

  /**
   * Concurrency-Safe Atomic Slot Reservation
   * Employs SQLite IMMEDIATE transactions and conditional updates to eliminate race conditions.
   * @param {number} userId
   * @param {number} slotId
   * @returns {Object} created booking
   */
  createBookingAtomic(userId, slotId) {
    return db.transaction(() => {
      // 1. Verify slot existence
      const slot = db.get('SELECT * FROM slots WHERE id = ?;', [slotId]);
      if (!slot) {
        const err = new Error('Requested time slot does not exist.');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }

      // 2. Prevent duplicate booking for the same slot
      const existingSlotBooking = db.get(
        `SELECT id FROM bookings 
         WHERE user_id = ? AND slot_id = ? AND status = 'BOOKED';`,
        [userId, slotId]
      );
      if (existingSlotBooking) {
        const err = new Error('You already have an active reservation for this time slot.');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      // 3. Prevent overlapping booking on the same date and hour
      const overlappingBooking = db.get(
        `SELECT b.id FROM bookings b
         JOIN slots s ON b.slot_id = s.id
         WHERE b.user_id = ? AND b.status = 'BOOKED' 
           AND s.slot_date = ? AND s.start_hour = ?;`,
        [userId, slot.slot_date, slot.start_hour]
      );
      if (overlappingBooking) {
        const err = new Error('You already hold a confirmed reservation during this hour.');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      // 4. Atomic conditional update to decrement slot capacity
      // If current_bookings >= max_capacity, changes will be 0
      const updateResult = db.run(
        `UPDATE slots 
         SET current_bookings = current_bookings + 1 
         WHERE id = ? AND current_bookings < max_capacity;`,
        [slotId]
      );

      if (updateResult.changes === 0) {
        const err = new Error('This time slot has reached maximum capacity. Please choose another window.');
        err.statusCode = 409;
        err.isOperational = true;
        throw err;
      }

      // 5. Insert confirmed booking record
      const insertResult = db.run(
        `INSERT INTO bookings (user_id, slot_id, status)
         VALUES (?, ?, 'BOOKED');`,
        [userId, slotId]
      );

      return {
        bookingId: insertResult.lastInsertRowid,
        userId,
        slotId,
        slotDate: slot.slot_date,
        startHour: slot.start_hour,
        endHour: slot.end_hour,
        status: 'BOOKED',
        bookedAt: new Date().toISOString()
      };
    });
  }

  /**
   * Cancel an active booking and restore slot capacity atomically
   * @param {number} bookingId
   * @param {number} userId
   * @param {boolean} isAdmin
   * @returns {Object}
   */
  cancelBookingAtomic(bookingId, userId, isAdmin = false) {
    return db.transaction(() => {
      const booking = db.get('SELECT * FROM bookings WHERE id = ?;', [bookingId]);
      if (!booking) {
        const err = new Error('Booking not found.');
        err.statusCode = 404;
        err.isOperational = true;
        throw err;
      }

      if (!isAdmin && booking.user_id !== userId) {
        const err = new Error('Forbidden. You can only cancel your own bookings.');
        err.statusCode = 403;
        err.isOperational = true;
        throw err;
      }

      if (booking.status === 'CANCELLED') {
        const err = new Error('This booking is already cancelled.');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }

      // Update booking status
      db.run(
        `UPDATE bookings 
         SET status = 'CANCELLED', cancelled_at = CURRENT_TIMESTAMP 
         WHERE id = ?;`,
        [bookingId]
      );

      // Restore slot capacity
      db.run(
        `UPDATE slots 
         SET current_bookings = MAX(0, current_bookings - 1) 
         WHERE id = ?;`,
        [booking.slot_id]
      );

      return {
        bookingId,
        status: 'CANCELLED',
        cancelledAt: new Date().toISOString()
      };
    });
  }

  /**
   * Fetch all bookings for a user
   * @param {number} userId
   * @returns {Array<Object>}
   */
  findUserBookings(userId) {
    return db.query(
      `SELECT b.id AS booking_id, b.status, b.booked_at, b.cancelled_at,
              s.id AS slot_id, s.slot_date, s.start_hour, s.end_hour, s.max_capacity, s.current_bookings
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       WHERE b.user_id = ?
       ORDER BY s.slot_date DESC, s.start_hour ASC;`,
      [userId]
    );
  }
}

module.exports = new BookingRepository();
