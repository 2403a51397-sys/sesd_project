-- FitCrowd SQLite Database Schema
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('member', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gym Configuration (Single Row Singleton Pattern)
CREATE TABLE IF NOT EXISTS gym_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    gym_name TEXT NOT NULL DEFAULT 'FitCrowd Fitness Center',
    max_capacity INTEGER NOT NULL DEFAULT 100 CHECK(max_capacity > 0),
    current_occupancy INTEGER NOT NULL DEFAULT 0 CHECK(current_occupancy >= 0),
    open_hour INTEGER NOT NULL DEFAULT 6,
    close_hour INTEGER NOT NULL DEFAULT 22,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Daily Workout Slots Table
CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_date TEXT NOT NULL,
    start_hour INTEGER NOT NULL CHECK(start_hour >= 0 AND start_hour <= 23),
    end_hour INTEGER NOT NULL CHECK(end_hour >= 1 AND end_hour <= 24),
    max_capacity INTEGER NOT NULL DEFAULT 25 CHECK(max_capacity > 0),
    current_bookings INTEGER NOT NULL DEFAULT 0 CHECK(current_bookings >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_slot UNIQUE (slot_date, start_hour)
);

-- 4. Member Slot Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'BOOKED' CHECK(status IN ('BOOKED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW')),
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    CONSTRAINT uq_user_slot UNIQUE (user_id, slot_id)
);

-- 5. Physical Visit Logs Table
CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    check_in_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME,
    duration_minutes INTEGER,
    check_in_type TEXT DEFAULT 'MANUAL_APP' CHECK(check_in_type IN ('MANUAL_APP', 'QR_SCAN', 'SIMULATION', 'ADMIN_COUNTER'))
);

-- 6. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL' CHECK(priority IN ('LOW', 'NORMAL', 'URGENT')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Fast Query Retrieval
CREATE INDEX IF NOT EXISTS idx_slots_date_hour ON slots(slot_date, start_hour);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_visits_checkin ON visits(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visits_checkout ON visits(check_out_time);
