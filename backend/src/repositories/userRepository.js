const db = require('../models/db');

/**
 * UserRepository: Handles all direct database queries for Users.
 * Implements Repository Pattern to decouple persistence logic.
 */
class UserRepository {
  /**
   * Find a user by their unique email
   * @param {string} email
   * @returns {Object|null}
   */
  findByEmail(email) {
    return db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?);', [email]);
  }

  /**
   * Find a user by their primary key id
   * @param {number} id
   * @returns {Object|null}
   */
  findById(id) {
    return db.get('SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?;', [id]);
  }

  /**
   * Create a new user record
   * @param {Object} userData
   * @returns {Object}
   */
  create({ email, passwordHash, fullName, phone, role = 'member' }) {
    const info = db.run(
      `INSERT INTO users (email, password_hash, full_name, phone, role)
       VALUES (?, ?, ?, ?, ?);`,
      [email.toLowerCase(), passwordHash, fullName, phone || null, role]
    );

    return this.findById(info.lastInsertRowid);
  }

  /**
   * List all users (admin scope)
   * @returns {Array<Object>}
   */
  findAll() {
    return db.query('SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY created_at DESC;');
  }
}

module.exports = new UserRepository();
