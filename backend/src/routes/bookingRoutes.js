const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// All booking routes require authenticated session
router.use(authMiddleware);

router.get('/slots', (req, res, next) => bookingController.getSlots(req, res, next));
router.post('/book', (req, res, next) => bookingController.bookSlot(req, res, next));
router.get('/my-bookings', (req, res, next) => bookingController.getMyBookings(req, res, next));
router.patch('/:id/cancel', (req, res, next) => bookingController.cancelBooking(req, res, next));

module.exports = router;
