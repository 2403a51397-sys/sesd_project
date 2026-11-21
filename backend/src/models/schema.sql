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
    role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('client', 'trainer', 'admin', 'member')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    avatar TEXT,
    address TEXT,
    gender TEXT,
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

-- 7. Fitness Shop Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    rating REAL DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 50,
    badge TEXT,
    image TEXT NOT NULL,
    description TEXT,
    specs TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Customer Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT,
    postal_code TEXT,
    delivery_type TEXT DEFAULT 'DELIVERY',
    payment_method TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    shipping_fee REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Order Line Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL
);

-- Indexes for Fast Query Retrieval
CREATE INDEX IF NOT EXISTS idx_slots_date_hour ON slots(slot_date, start_hour);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_visits_checkin ON visits(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visits_checkout ON visits(check_out_time);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
