const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, fullName, phone, role } = req.body;
      const result = await authService.register({ email, password, fullName, phone, role });
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      // req.user is set by authMiddleware
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
