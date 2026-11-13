const bookingService = require('../services/bookingService');

class BookingController {
  async getSlots(req, res, next) {
    try {
      const { date } = req.query;
      const slots = bookingService.getSlotsForDate(date);
      res.status(200).json({
        success: true,
        data: slots
      });
    } catch (err) {
      next(err);
    }
  }

  async bookSlot(req, res, next) {
    try {
      const { slotId } = req.body;
      const userId = req.user.id;
      const result = bookingService.bookSlot(userId, slotId);
      res.status(201).json({
        success: true,
        message: 'Workout slot successfully booked.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      const result = bookingService.cancelBooking(id, userId, isAdmin);
      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const userId = req.user.id;
      const bookings = bookingService.getUserBookings(userId);
      res.status(200).json({
        success: true,
        data: bookings
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BookingController();
