const db = require('../models/db');

/**
 * UserRepository: Handles all direct database queries for Users.
 * Implements Repository Pattern to decouple persistence logic.
 */
class UserRepository {
  /**
   * Find a user by email or username
   * @param {string} identifier
   * @returns {Object|null}
   */
  findByEmail(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    
    // Exact email match
    let user = db.get('SELECT * FROM users WHERE LOWER(email) = ?;', [clean]);
    if (user) return user;

    // If identifier doesn't contain @, match username prefix (e.g. "admin", "trainer", "client")
    if (!clean.includes('@')) {
      user = db.get('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(email) LIKE ?;', [
        `${clean}@fitsphere.com`,
        `${clean}@%`
      ]);
    }
    return user || null;
  }

  /**
   * Find a user by their primary key id
   * @param {number} id
   * @returns {Object|null}
   */
  findById(id) {
    return db.get(
      'SELECT id, email, full_name, phone, role, is_active, avatar, address, gender, created_at FROM users WHERE id = ?;',
      [id]
    );
  }

  /**
   * Create a new user record
   * @param {Object} userData
   * @returns {Object}
   */
  create({ email, passwordHash, fullName, phone, role = 'client', isActive = 1, avatar = null, address = null, gender = null }) {
    const normalizedRole = role === 'member' ? 'client' : role;
    const info = db.run(
      `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, avatar, address, gender)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [email.toLowerCase().trim(), passwordHash, fullName.trim(), phone || null, normalizedRole, isActive ? 1 : 0, avatar, address, gender]
    );

    return this.findById(info.lastInsertRowid);
  }

  /**
   * List all users (admin scope)
   * @returns {Array<Object>}
   */
  findAll() {
    return db.query(
      'SELECT id, email, full_name, phone, role, is_active, avatar, address, gender, created_at FROM users ORDER BY created_at DESC;'
    );
  }

  /**
   * Update active approval status
   * @param {number} id 
   * @param {number|boolean} isActive 
   * @returns {Object|null}
   */
  updateStatus(id, isActive) {
    db.run('UPDATE users SET is_active = ? WHERE id = ?;', [isActive ? 1 : 0, id]);
    return this.findById(id);
  }

  /**
   * Delete a user by ID
   * @param {number} id 
   * @returns {boolean}
   */
  delete(id) {
    db.run('DELETE FROM users WHERE id = ?;', [id]);
    return true;
  }
}

module.exports = new UserRepository();
