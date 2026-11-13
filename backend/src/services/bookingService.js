const bookingRepository = require('../repositories/bookingRepository');

/**
 * Helper to convert 24-hr integer to readable AM/PM string
 * e.g., 6 -> "6:00 AM", 18 -> "6:00 PM"
 */
function formatHour(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

class BookingService {
  /**
   * List slots for a given date with availability and occupancy percentage
   * @param {string} dateString YYYY-MM-DD (defaults to today)
   */
  getSlotsForDate(dateString) {
    const targetDate = dateString || new Date().toISOString().split('T')[0];
    const rawSlots = bookingRepository.findOrCreateSlotsByDate(targetDate);

    return rawSlots.map((slot) => {
      const percentage = Math.round((slot.current_bookings / slot.max_capacity) * 100);
      return {
        id: slot.id,
        date: slot.slot_date,
        startHour: slot.start_hour,
        endHour: slot.end_hour,
        timeLabel: `${formatHour(slot.start_hour)} - ${formatHour(slot.end_hour)}`,
        maxCapacity: slot.max_capacity,
        currentBookings: slot.current_bookings,
        availableSeats: Math.max(0, slot.available_seats),
        isFull: slot.current_bookings >= slot.max_capacity,
        occupancyPercentage: percentage
      };
    });
  }

  /**
   * Reserve an hourly slot atomically
   */
  bookSlot(userId, slotId) {
    if (!slotId) {
      const err = new Error('Slot ID is required.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const booking = bookingRepository.createBookingAtomic(userId, parseInt(slotId, 10));
    return {
      ...booking,
      timeLabel: `${formatHour(booking.startHour)} - ${formatHour(booking.endHour)}`
    };
  }

  /**
   * Cancel an existing booking
   */
  cancelBooking(bookingId, userId, isAdmin = false) {
    if (!bookingId) {
      const err = new Error('Booking ID is required.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    return bookingRepository.cancelBookingAtomic(parseInt(bookingId, 10), userId, isAdmin);
  }

  /**
   * Get all bookings for authenticated member
   */
  getUserBookings(userId) {
    const rawBookings = bookingRepository.findUserBookings(userId);
    return rawBookings.map((b) => ({
      bookingId: b.booking_id,
      slotId: b.slot_id,
      date: b.slot_date,
      startHour: b.start_hour,
      endHour: b.end_hour,
      timeLabel: `${formatHour(b.start_hour)} - ${formatHour(b.end_hour)}`,
      status: b.status,
      bookedAt: b.booked_at,
      cancelledAt: b.cancelled_at
    }));
  }
}

module.exports = new BookingService();
