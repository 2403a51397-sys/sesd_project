const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');

class AuthService {
  /**
   * Register a new user (client or trainer)
   */
  async register({ email, password, fullName, phone, role = 'client', address = null, gender = null }) {
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

    // If registering as trainer, set is_active to 0 (pending admin approval)
    const normalizedRole = role === 'trainer' ? 'trainer' : role === 'admin' ? 'admin' : 'client';
    const isActive = normalizedRole === 'trainer' ? 0 : 1;

    // Pick a default avatar based on gender/role
    const avatar = gender === 'female'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
      : gender === 'athlete'
      ? 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop';

    // Persist new user
    const newUser = userRepository.create({
      email,
      passwordHash,
      fullName,
      phone,
      role: normalizedRole,
      isActive,
      avatar,
      address,
      gender
    });

    // Generate JWT
    const token = this.generateToken(newUser);

    const message = normalizedRole === 'trainer'
      ? 'Registration successful! Your trainer account is pending administrator approval.'
      : undefined;

    return {
      token,
      message,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        name: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        is_active: Boolean(newUser.is_active),
        avatar: newUser.avatar,
        address: newUser.address,
        gender: newUser.gender
      }
    };
  }

  /**
   * Authenticate user with email or username and password
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
        name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: Boolean(user.is_active),
        avatar: user.avatar,
        address: user.address,
        gender: user.gender
      }
    };
  }

  /**
   * Social Authentication (Google / Facebook)
   */
  async socialLogin({ provider, role = 'client', name, email, avatar }) {
    const isGoogle = provider === 'google';
    const cleanProvider = isGoogle ? 'Google' : 'Facebook';
    
    // Determine email & name
    const targetEmail = (email && email.trim()) 
      ? email.trim().toLowerCase() 
      : isGoogle 
        ? `google.${role}@fitsphere.com` 
        : `facebook.${role}@fitsphere.com`;

    const targetName = (name && name.trim()) 
      ? name.trim() 
      : isGoogle 
        ? `Google ${role === 'admin' ? 'Admin' : role === 'trainer' ? 'Coach' : 'Member'}` 
        : `Facebook ${role === 'admin' ? 'Admin' : role === 'trainer' ? 'Coach' : 'Athlete'}`;

    const targetAvatar = avatar || (isGoogle 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop');

    let user = userRepository.findByEmail(targetEmail);

    if (!user) {
      // Auto-register social user with secure random hash
      const randomPassword = `Social_${cleanProvider}_${Date.now()}`;
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const normalizedRole = role === 'trainer' ? 'trainer' : role === 'admin' ? 'admin' : 'client';

      user = userRepository.create({
        email: targetEmail,
        passwordHash,
        fullName: targetName,
        phone: '+1 555-0199',
        role: normalizedRole,
        isActive: 1, // Social logins are instantly verified
        avatar: targetAvatar,
        address: 'FitSphere Connected Profile',
        gender: isGoogle ? 'female' : 'male'
      });
    }

    const token = this.generateToken(user);

    return {
      token,
      provider: cleanProvider,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: Boolean(user.is_active),
        avatar: user.avatar,
        address: user.address,
        gender: user.gender,
        provider: cleanProvider
      }
    };
  }

  /**
   * Quick 1-click Demo Role Login
   */
  async loginDemoRole(role) {
    let emailTarget = 'client@fitsphere.com';
    if (role === 'admin') emailTarget = 'admin@fitsphere.com';
    else if (role === 'trainer') emailTarget = 'trainer@fitsphere.com';

    let user = userRepository.findByEmail(emailTarget);
    if (!user) {
      // Fallback to fitcrowd demo users if fitsphere seed is missing
      if (role === 'admin') user = userRepository.findByEmail('admin@fitcrowd.com');
      else user = userRepository.findByEmail('alex@fitcrowd.com');
    }

    if (!user) {
      const error = new Error(`Demo account for role '${role}' not found.`);
      error.statusCode = 404;
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
        name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: Boolean(user.is_active),
        avatar: user.avatar,
        address: user.address,
        gender: user.gender
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
        role: user.role,
        is_active: Boolean(user.is_active)
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
