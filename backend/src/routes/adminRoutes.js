const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Public route to view announcements
router.get('/announcements', (req, res, next) => adminController.getAnnouncements(req, res, next));

// Protected Admin-only routes
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));
router.patch('/capacity', (req, res, next) => adminController.updateCapacity(req, res, next));
router.get('/members', (req, res, next) => adminController.listMembers(req, res, next));
router.get('/users', (req, res, next) => adminController.listMembers(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.updateMemberStatus(req, res, next));
router.patch('/members/:id/status', (req, res, next) => adminController.updateMemberStatus(req, res, next));
router.delete('/users/:id', (req, res, next) => adminController.deleteMember(req, res, next));
router.post('/announcements', (req, res, next) => adminController.createAnnouncement(req, res, next));
router.post('/simulator/surge', (req, res, next) => adminController.simulateSurge(req, res, next));
router.post('/simulator/reset', (req, res, next) => adminController.simulateReset(req, res, next));

module.exports = router;
