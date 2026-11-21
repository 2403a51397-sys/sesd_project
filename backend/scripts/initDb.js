const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/models/db');
const config = require('../src/config');

async function initDatabase() {
  console.log('--- Initializing FitSphere / FitCrowd Database ---');
  
  // Read and execute schema.sql
  const schemaPath = path.resolve(__dirname, '../src/models/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  console.log('✔ Schema tables and indexes applied successfully.');

  // Check if users table needs column updates or check-constraint migration
  try {
    const columns = db.query("PRAGMA table_info(users);");
    const colNames = columns.map(c => c.name);

    if (!colNames.includes('is_active')) {
      db.run("ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1));");
    }
    if (!colNames.includes('avatar')) {
      db.run("ALTER TABLE users ADD COLUMN avatar TEXT;");
    }
    if (!colNames.includes('address')) {
      db.run("ALTER TABLE users ADD COLUMN address TEXT;");
    }
    if (!colNames.includes('gender')) {
      db.run("ALTER TABLE users ADD COLUMN gender TEXT;");
    }

    // Test inserting a trainer role to verify check constraint
    let canInsertTrainer = true;
    try {
      db.run("INSERT INTO users (email, password_hash, full_name, role) VALUES ('__test__@test.com', 'test', 'Test', 'trainer');");
      db.run("DELETE FROM users WHERE email = '__test__@test.com';");
    } catch {
      canInsertTrainer = false;
    }

    if (!canInsertTrainer) {
      console.log(' Migrating users table to support FitSphere multi-role check constraint (client, trainer, admin)...');
      db.run("PRAGMA foreign_keys = OFF;");
      db.run(`
        CREATE TABLE users_migrated (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'trainer', 'admin', 'member')),
            is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
            avatar TEXT,
            address TEXT,
            gender TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      db.run(`
        INSERT INTO users_migrated (id, email, password_hash, full_name, phone, role, is_active, avatar, address, gender, created_at)
        SELECT id, email, password_hash, full_name, phone, 
               CASE WHEN role = 'member' THEN 'client' ELSE role END,
               COALESCE(is_active, 1), avatar, address, gender, created_at 
        FROM users;
      `);
      db.run("DROP TABLE users;");
      db.run("ALTER TABLE users_migrated RENAME TO users;");
      db.run("PRAGMA foreign_keys = ON;");
      console.log('✔ Users table migration complete.');
    }
  } catch (err) {
    console.warn('Column check warning:', err.message);
  }

  // Initialize gym_config singleton if not present
  const existingConfig = db.get('SELECT * FROM gym_config WHERE id = 1;');
  if (!existingConfig) {
    db.run(
      `INSERT INTO gym_config (id, gym_name, max_capacity, current_occupancy, open_hour, close_hour) 
       VALUES (1, ?, ?, 0, 6, 22);`,
      ['FitSphere Downtown Performance Center', config.gym.defaultCapacity]
    );
    console.log('✔ Default gym configuration seeded (Capacity: 100).');
  }

  // Helper to upsert or seed user
  async function seedUser({ email, password, fullName, phone, role, isActive = 1, avatar, address, gender }) {
    const existing = db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?);', [email]);
    const hash = await bcrypt.hash(password, 10);
    if (!existing) {
      db.run(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, avatar, address, gender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [email.toLowerCase(), hash, fullName, phone || null, role, isActive, avatar || null, address || null, gender || null]
      );
      console.log(`✔ User seeded: ${email} (${role})`);
    } else {
      db.run(
        `UPDATE users SET password_hash = ?, full_name = ?, role = ?, is_active = ?, avatar = ?, address = ?, gender = ?
         WHERE id = ?;`,
        [hash, fullName, role, isActive, avatar || existing.avatar, address || existing.address, gender || existing.gender, existing.id]
      );
    }
  }

  // 1. FitSphere Admin: admin@fitsphere.com / admin123
  await seedUser({
    email: 'admin@fitsphere.com',
    password: 'admin123',
    fullName: 'Elena Rostova',
    phone: '+1 (555) 019-2834',
    role: 'admin',
    isActive: 1,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    address: 'HQ Operations Tower, San Francisco, CA'
  });

  // 2. FitSphere Trainer: trainer@fitsphere.com / trainer123
  await seedUser({
    email: 'trainer@fitsphere.com',
    password: 'trainer123',
    fullName: 'Coach Marcus Vance',
    phone: '+1 (555) 234-5678',
    role: 'trainer',
    isActive: 1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    address: 'Los Angeles, CA'
  });

  // 3. FitSphere Customer: client@fitsphere.com / client123
  await seedUser({
    email: 'client@fitsphere.com',
    password: 'client123',
    fullName: 'Kundan Saduyashwanth',
    phone: '+1 (555) 987-6543',
    role: 'client',
    isActive: 1,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    address: 'San Francisco, CA',
    gender: 'male'
  });

  // 4. FitSphere Pending Trainer (for approval demo): pending.trainer@fitsphere.com / trainer123
  await seedUser({
    email: 'pending.trainer@fitsphere.com',
    password: 'trainer123',
    fullName: 'Coach David Miller',
    phone: '+1 (555) 345-6789',
    role: 'trainer',
    isActive: 0,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    address: 'Chicago, IL'
  });

  // 5. Backwards Compatibility users: admin@fitcrowd.com & alex@fitcrowd.com
  await seedUser({
    email: 'admin@fitcrowd.com',
    password: 'AdminPass123!',
    fullName: 'Head Gym Administrator',
    phone: '555-0100',
    role: 'admin',
    isActive: 1
  });

  await seedUser({
    email: 'alex@fitcrowd.com',
    password: 'MemberPass123!',
    fullName: 'Alex Chen',
    phone: '555-0199',
    role: 'client',
    isActive: 1
  });

  console.log(' Database initialization completed successfully.');
}

if (require.main === module) {
  initDatabase().catch(err => {
    console.error(' Database initialization failed:', err);
    process.exit(1);
  });
}

module.exports = initDatabase;
