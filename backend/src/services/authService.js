const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

class AuthService {
  /**
   * Register a new member
   */
  async register({ email, password, fullName, phone, role = 'member' }) {
    if (!email || !password || !fullName) {
      const error = new Error('Email, password, and full name are required.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (password.length < 8) {
      const error = new Error('Password must be at least 8 characters long.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    // Check if email already exists
    const existing = userRepository.findByEmail(email);
    if (existing) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      error.isOperational = true;
      throw error;
    }

    // Hash password with bcrypt cost factor 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Persist new user
    const newUser = userRepository.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: role === 'admin' ? 'admin' : 'member'
    });

    // Generate JWT
    const token = this.generateToken(newUser);

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role
      }
    };
  }

  /**
   * Authenticate user with email and password
   */
  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Please provide both email and password.');
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const user = userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role
      }
    };
  }

  /**
   * Generate signed JWT
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
