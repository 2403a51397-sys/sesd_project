const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = userRepository.findById(decoded.id);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
        name: user.full_name,
        is_active: Boolean(user.is_active),
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        gender: user.gender
      };
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}

module.exports = optionalAuthMiddleware;
