const db = require('../models/db');

class ShopRepository {
  constructor() {
    this.ensureTablesAndSeed();
  }

  ensureTablesAndSeed() {
    try {
      db.exec(`
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

        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      `);

      // Seed catalog items if empty
      const countRow = db.get('SELECT COUNT(*) as count FROM products');
      if (!countRow || countRow.count === 0) {
        this.seedProducts();
      }
    } catch (err) {
      console.error('Error ensuring shop tables & seed:', err.message);
    }
  }

  seedProducts() {
    const defaultProducts = [
      {
        id: 'prod-whey-01',
        name: 'FitSphere Gold 100% Whey Isolate (2kg)',
        category: 'supplements',
        price: 64.99,
        original_price: 79.99,
        rating: 4.9,
        reviews_count: 248,
        stock: 45,
        badge: 'Bestseller',
        image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?q=80&w=800&auto=format&fit=crop',
        description: 'Ultra-pure cold-filtered whey protein isolate delivering 27g bio-available protein per scoop, 0g sugar, and 6.2g BCAAs for lightning-fast muscular recovery.',
        specs: JSON.stringify([
          '27g Pure Whey Isolate per serving',
          'Zero added sugar, gluten-free',
          '6.2g Branched-Chain Amino Acids',
          'Cross-Flow Microfiltered for instant solubility'
        ])
      },
      {
        id: 'prod-pre-02',
        name: 'Nitric Surge High-Intensity Pre-Workout (300g)',
        category: 'supplements',
        price: 38.50,
        original_price: 49.99,
        rating: 4.85,
        reviews_count: 172,
        stock: 32,
        badge: 'Top Rated',
        image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=800&auto=format&fit=crop',
        description: 'Explosive energy and laser tunnel-vision focus formulated with 350mg anhydrous caffeine, 3.2g beta-alanine, and 6g pure L-citrulline malate.',
        specs: JSON.stringify([
          '350mg Caffeine Anhydrous for peak energy',
          '6g L-Citrulline Malate for skin-splitting pumps',
          '3.2g Beta-Alanine for muscular endurance',
          'Advanced electrolyte hydration matrix'
        ])
      },
      {
        id: 'prod-creatine-03',
        name: 'Micronized Pure Creatine Monohydrate (500g)',
        category: 'supplements',
        price: 26.99,
        original_price: 34.00,
        rating: 4.95,
        reviews_count: 310,
        stock: 65,
        badge: 'Strength Essential',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
        description: 'Pharmaceutical-grade 100% pure micronized creatine for rapid ATP resynthesis, explosive power output, and cell volumization.',
        specs: JSON.stringify([
          '100% Ultra-Fine Micronized Powder',
          '100 servings (5g per scoop)',
          'Zero fillers, unflavored',
          'Third-party lab tested for banned substances'
        ])
      },
      {
        id: 'prod-bcaa-04',
        name: 'HydroRecovery BCAA 2:1:1 + Coconut Electrolytes',
        category: 'supplements',
        price: 29.99,
        original_price: 38.00,
        rating: 4.75,
        reviews_count: 114,
        stock: 40,
        badge: 'Hydration',
        image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?q=80&w=800&auto=format&fit=crop',
        description: 'Fermented plant BCAAs in proven 2:1:1 ratio infused with natural coconut water powder for intra-workout hydration and cramp prevention.',
        specs: JSON.stringify([
          '7g Instantized BCAAs per scoop',
          'Natural Coconut Water Electrolytes',
          'Zero artificial dyes or sugar',
          'Refreshing Island Mango flavor'
        ])
      },
      {
        id: 'prod-bars-05',
        name: 'FitSphere Salted Caramel Protein Crisp Bars (Box of 12)',
        category: 'nutrition',
        price: 27.99,
        original_price: 35.00,
        rating: 4.88,
        reviews_count: 156,
        stock: 50,
        badge: 'Member Favorite',
        image: 'https://images.unsplash.com/photo-1622484216850-d7a8d5c41496?q=80&w=800&auto=format&fit=crop',
        description: 'Triple-layer gourmet protein snack with soft caramel, crispy protein nuggets, and a decadent dark chocolate drizzle. 21g protein, only 1.5g sugar.',
        specs: JSON.stringify([
          '21g Protein per bar',
          'Only 1.5g sugar & 190 calories',
          'High dietary prebiotic fiber',
          'Naturally gluten-free'
        ])
      },
      {
        id: 'prod-belt-06',
        name: 'Pro Steel-Lever Weightlifting Belt (10mm, Matte Black)',
        category: 'gear',
        price: 69.99,
        original_price: 89.99,
        rating: 4.92,
        reviews_count: 184,
        stock: 22,
        badge: 'Heavy Duty',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        description: 'Competition-grade genuine cowhide suede leather with an unbreakable matte zinc alloy lever buckle for supreme lumbar stability.',
        specs: JSON.stringify([
          '10mm thickness, 4-inch uniform width',
          'Heavy-duty alloy quick-release lever',
          'Reinforced 4-line industrial nylon stitching',
          'IPF powerlifting specification compliant'
        ])
      },
      {
        id: 'prod-bands-07',
        name: 'Multi-Resistance Heavy Duty Loop Bands (5-Pack)',
        category: 'gear',
        price: 19.99,
        original_price: 29.99,
        rating: 4.78,
        reviews_count: 228,
        stock: 80,
        badge: 'Value Pack',
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop',
        description: '100% natural Malaysian snap-proof latex resistance bands spanning 5 lbs to 40 lbs of dynamic resistance. Includes breathable travel pouch.',
        specs: JSON.stringify([
          '5 color-coded levels (X-Light to X-Heavy)',
          '100% eco-friendly natural latex',
          'Non-rolling skin-friendly grip',
          'Includes compact mesh carrying pouch'
        ])
      },
      {
        id: 'prod-shaker-08',
        name: 'FitSphere ThermoPro Stainless Steel Shaker (750ml)',
        category: 'gear',
        price: 21.50,
        original_price: 28.00,
        rating: 4.9,
        reviews_count: 320,
        stock: 75,
        badge: 'Must Have',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
        description: 'Double-wall vacuum insulated kitchen-grade steel shaker keeping protein shakes ice cold for 24 hours. Leak-proof lock lid with silent blending grate.',
        specs: JSON.stringify([
          'Double-wall vacuum insulation',
          'Laser-etched internal volume markers',
          'Odor and stain resistant stainless steel',
          '100% leak-proof flip cap'
        ])
      },
      {
        id: 'prod-roller-09',
        name: 'High-Density Deep Tissue Grid Foam Roller (18-Inch)',
        category: 'gear',
        price: 24.99,
        original_price: 32.00,
        rating: 4.82,
        reviews_count: 104,
        stock: 30,
        badge: 'Mobility',
        image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=800&auto=format&fit=crop',
        description: 'Bio-mechanical grid pattern mimics sports massage therapist palm, finger, and thumb pressure for rapid myofascial knot relief.',
        specs: JSON.stringify([
          '18-inch length x 5.5-inch diameter',
          'Solid hollow-core EVA foam build',
          'Supports up to 500 lbs load capacity',
          'Sweat-proof and easy to wipe clean'
        ])
      },
      {
        id: 'prod-straps-10',
        name: 'Silicone-Grip Padded Weightlifting Straps & Wraps Combo',
        category: 'gear',
        price: 17.50,
        original_price: 24.00,
        rating: 4.86,
        reviews_count: 142,
        stock: 55,
        badge: 'Grip Power',
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
        description: 'Heavy duty dense cotton webbing with traction-ribbed silicone surface and 5mm thick neoprene wrist pad for heavy deadlifts and barbell rows.',
        specs: JSON.stringify([
          'Dual honeycomb silicone grip ribs',
          'Thick 5mm neoprene cushion padding',
          '24-inch length for secure bar wraps',
          'Box-X reinforced stress-point stitching'
        ])
      },
      {
        id: 'prod-tee-11',
        name: 'FitSphere AeroVent Seamless Athletic Performance Tee',
        category: 'apparel',
        price: 34.00,
        original_price: 45.00,
        rating: 4.89,
        reviews_count: 168,
        stock: 45,
        badge: 'Premium Wear',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
        description: 'Engineered 4-way stretch fabric with targeted chest and back heat-dumping micro-mesh. Infused with silver ions to eliminate workout odor.',
        specs: JSON.stringify([
          'Seamless friction-free construction',
          'HydroWick rapid moisture transport',
          'Silver Ion anti-microbial treatment',
          'Tailored athletic athletic fit'
        ])
      },
      {
        id: 'prod-shorts-12',
        name: '2-in-1 Compression Training Shorts with Phone Holster',
        category: 'apparel',
        price: 36.00,
        original_price: 48.00,
        rating: 4.87,
        reviews_count: 195,
        stock: 42,
        badge: 'Top Pick',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=800&auto=format&fit=crop',
        description: 'Featherlight stretch shell with built-in compression inner shorts. Features a bounce-proof phone pocket, towel loop, and concealed zipper stash.',
        specs: JSON.stringify([
          'Built-in 4-way compression liner',
          'Bounce-free thigh phone holster',
          'Back towel strap & zipper stash',
          'Split side hem for unrestricted squats'
        ])
      },
      {
        id: 'prod-bag-13',
        name: 'FitSphere Tactical Gym Duffle Bag (45L)',
        category: 'gear',
        price: 49.99,
        original_price: 65.00,
        rating: 4.94,
        reviews_count: 218,
        stock: 28,
        badge: 'All-In-One',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
        description: 'Waterproof 900D ballistic nylon gym bag featuring dedicated ventilated shoe tunnel, separate waterproof wet laundry pocket, and shaker bottle holsters.',
        specs: JSON.stringify([
          'Ventilated shoe compartment fits up to size 14',
          'Waterproof wet gear & towel pocket',
          'Heavy-duty tactical 900D nylon',
          'Padded ergonomic shoulder strap'
        ])
      },
      {
        id: 'prod-tracker-14',
        name: 'FitSphere Pulse AI Smart Band 3.0',
        category: 'apparel',
        price: 79.99,
        original_price: 109.99,
        rating: 4.91,
        reviews_count: 92,
        stock: 18,
        badge: 'AI Synced',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=800&auto=format&fit=crop',
        description: 'Precision continuous heart rate, HRV recovery tracker, and workout intensity sensor that syncs automatically with FitSphere AI gym dashboards.',
        specs: JSON.stringify([
          'Continuous Optical PPG & SpO2 Monitoring',
          '14-Day ultra-long battery life',
          '50M waterproof swim certified',
          'Direct live telemetry sync with FitSphere'
        ])
      }
    ];

    const insertStmt = db.raw.prepare(`
      INSERT OR REPLACE INTO products (id, name, category, price, original_price, rating, reviews_count, stock, badge, image, description, specs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (const p of defaultProducts) {
        insertStmt.run(
          p.id,
          p.name,
          p.category,
          p.price,
          p.original_price,
          p.rating,
          p.reviews_count,
          p.stock,
          p.badge,
          p.image,
          p.description,
          p.specs
        );
      }
    });

    console.log(`✔ Successfully seeded ${defaultProducts.length} FitSphere shop products.`);
  }

  getAllProducts({ category, search, sort } = {}) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR description LIKE ? OR badge LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (sort === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      sql += ' ORDER BY rating DESC, reviews_count DESC';
    } else {
      sql += ' ORDER BY reviews_count DESC, rating DESC';
    }

    const rows = db.query(sql, params);
    return rows.map((r) => ({
      ...r,
      specs: r.specs ? JSON.parse(r.specs) : []
    }));
  }

  getProductById(id) {
    const row = db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!row) return null;
    return {
      ...row,
      specs: row.specs ? JSON.parse(row.specs) : []
    };
  }

  createOrder({ orderData, items }) {
    return db.transaction(() => {
      // 1. Verify stock for each item
      for (const item of items) {
        const prod = db.get('SELECT stock, name FROM products WHERE id = ?', [item.productId]);
        if (!prod) {
          throw new Error(`Product "${item.productName || item.productId}" is no longer available.`);
        }
        if (prod.stock < item.quantity) {
          throw new Error(`Insufficient stock for "${prod.name}". Only ${prod.stock} left in stock.`);
        }
      }

      // 2. Decrement stock
      const updateStockStmt = db.raw.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      for (const item of items) {
        updateStockStmt.run(item.quantity, item.productId);
      }

      // 3. Insert order
      const insertOrderStmt = db.raw.prepare(`
        INSERT INTO orders (
          id, user_id, customer_name, customer_email, customer_phone,
          shipping_address, city, postal_code, delivery_type, payment_method,
          subtotal, discount, tax, shipping_fee, total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertOrderStmt.run(
        orderData.id,
        orderData.userId || null,
        orderData.customerName,
        orderData.customerEmail,
        orderData.customerPhone || '',
        orderData.shippingAddress,
        orderData.city || '',
        orderData.postalCode || '',
        orderData.deliveryType || 'DELIVERY',
        orderData.paymentMethod || 'CARD',
        orderData.subtotal,
        orderData.discount || 0,
        orderData.tax || 0,
        orderData.shippingFee || 0,
        orderData.totalAmount,
        orderData.status || 'CONFIRMED'
      );

      // 4. Insert order items
      const insertItemStmt = db.raw.prepare(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_image, unit_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        insertItemStmt.run(
          orderData.id,
          item.productId,
          item.productName,
          item.productImage || '',
          item.unitPrice,
          item.quantity,
          item.totalPrice
        );
      }

      return this.getOrderById(orderData.id);
    });
  }

  getOrderById(orderId) {
    const order = db.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return null;

    const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return {
      ...order,
      items
    };
  }

  getOrdersByUserId(userId) {
    const orders = db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return orders.map((order) => {
      const items = db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return {
        ...order,
        items
      };
    });
  }
}

module.exports = new ShopRepository();
