const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/demo-login', (req, res, next) => authController.loginDemoRole(req, res, next));
router.post('/social-login', (req, res, next) => authController.socialLogin(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

module.exports = router;
