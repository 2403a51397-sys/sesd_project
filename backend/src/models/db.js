const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure database directory exists
const dbDir = path.dirname(config.db.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database instance (Singleton)
const rawDb = new DatabaseSync(config.db.path);

// Enable WAL mode and foreign key enforcement
rawDb.exec('PRAGMA journal_mode = WAL;');
rawDb.exec('PRAGMA foreign_keys = ON;');
rawDb.exec('PRAGMA busy_timeout = 5000;');

/**
 * FitCrowd Database Access Wrapper
 * Provides safe parameterized queries, transactions, and error handling.
 */
const db = {
  raw: rawDb,

  /**
   * Execute a query returning all matching rows
   * @param {string} sql
   * @param {Array} params
   * @returns {Array<Object>}
   */
  query(sql, params = []) {
    const stmt = rawDb.prepare(sql);
    return stmt.all(...params);
  },

  /**
   * Execute a query returning the first matching row
   * @param {string} sql
   * @param {Array} params
   * @returns {Object|null}
   */
  get(sql, params = []) {
    const stmt = rawDb.prepare(sql);
    const result = stmt.get(...params);
    return result || null;
  },

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   * @param {string} sql
   * @param {Array} params
   * @returns {{ changes: number, lastInsertRowid: number }}
   */
  run(sql, params = []) {
    const stmt = rawDb.prepare(sql);
    return stmt.run(...params);
  },

  /**
   * Execute arbitrary DDL or multi-statement scripts
   * @param {string} sql
   */
  exec(sql) {
    return rawDb.exec(sql);
  },

  /**
   * Execute an atomic transaction with immediate locking
   * Guarantees ACID isolation to prevent concurrency race conditions.
   * @param {Function} callback
   * @returns {*} result of callback
   */
  transaction(callback) {
    rawDb.exec('BEGIN IMMEDIATE;');
    try {
      const result = callback(db);
      rawDb.exec('COMMIT;');
      return result;
    } catch (err) {
      try {
        rawDb.exec('ROLLBACK;');
      } catch (rollbackErr) {
        console.error('Failed to rollback transaction:', rollbackErr.message);
      }
      throw err;
    }
  }
};

module.exports = db;
