const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../src/models/db');
const config = require('../src/config');

async function initDatabase() {
  console.log('--- Initializing FitCrowd Database ---');
  
  // Read and execute schema.sql
  const schemaPath = path.resolve(__dirname, '../src/models/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  console.log(' Schema tables and indexes applied successfully.');

  // Initialize gym_config singleton if not present
  const existingConfig = db.get('SELECT * FROM gym_config WHERE id = 1;');
  if (!existingConfig) {
    db.run(
      `INSERT INTO gym_config (id, gym_name, max_capacity, current_occupancy, open_hour, close_hour) 
       VALUES (1, ?, ?, 0, 6, 22);`,
      ['FitCrowd Downtown Center', config.gym.defaultCapacity]
    );
    console.log(' Default gym configuration seeded (Capacity: 100).');
  }

  // Create default Admin account if not present
  const existingAdmin = db.get('SELECT * FROM users WHERE email = ?;', ['admin@fitcrowd.com']);
  if (!existingAdmin) {
    const adminPassHash = await bcrypt.hash('AdminPass123!', 10);
    db.run(
      `INSERT INTO users (email, password_hash, full_name, phone, role) 
       VALUES (?, ?, ?, ?, 'admin');`,
      ['admin@fitcrowd.com', adminPassHash, 'Head Gym Administrator', '555-0100']
    );
    console.log(' Admin user seeded: admin@fitcrowd.com / AdminPass123!');
  }

  // Create default Member account if not present
  const existingMember = db.get('SELECT * FROM users WHERE email = ?;', ['alex@fitcrowd.com']);
  if (!existingMember) {
    const memberPassHash = await bcrypt.hash('MemberPass123!', 10);
    db.run(
      `INSERT INTO users (email, password_hash, full_name, phone, role) 
       VALUES (?, ?, ?, ?, 'member');`,
      ['alex@fitcrowd.com', memberPassHash, 'Alex Chen', '555-0199']
    );
    console.log(' Member user seeded: alex@fitcrowd.com / MemberPass123!');
  }

  console.log(' Database initialization completed successfully.');
}

if (require.main === module) {
  initDatabase().catch(err => {
    console.error(' Database initialization failed:', err);
    process.exit(1);
  });
}

module.exports = initDatabase;
