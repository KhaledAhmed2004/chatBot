const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "..", "data", "bot.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT,
    items TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    store_id INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    store_id INTEGER DEFAULT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    phone TEXT PRIMARY KEY,
    name TEXT,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_orders INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS stock (
    product_id INTEGER PRIMARY KEY,
    quantity INTEGER NOT NULL DEFAULT 0
  );

  -- Multi-vendor tables
  CREATE TABLE IF NOT EXISTS store_owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL REFERENCES store_owners(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    logo_url TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS store_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL REFERENCES stores(id),
    name TEXT NOT NULL,
    name_bn TEXT DEFAULT '',
    price INTEGER NOT NULL,
    category TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    stock INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add store_id column to existing tables if missing (migration)
try {
  db.exec(`ALTER TABLE orders ADD COLUMN store_id INTEGER DEFAULT NULL`);
} catch (e) { /* column already exists */ }
try {
  db.exec(`ALTER TABLE cart_items ADD COLUMN store_id INTEGER DEFAULT NULL`);
} catch (e) { /* column already exists */ }

// Create indexes for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
  CREATE INDEX IF NOT EXISTS idx_store_products_store ON store_products(store_id);
  CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
  CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
  CREATE INDEX IF NOT EXISTS idx_store_owners_email ON store_owners(email);
`);

// Initialize stock from products.json (only if stock table is empty)
const stockCount = db.prepare("SELECT COUNT(*) as count FROM stock").get();
if (stockCount.count === 0) {
  const products = require("../../data/products.json");
  const insertStock = db.prepare(
    "INSERT OR IGNORE INTO stock (product_id, quantity) VALUES (?, ?)"
  );
  products.forEach((p) => insertStock.run(p.id, p.stock));
}

// === USER FUNCTIONS ===

function upsertUser(phone, name) {
  try {
    db.prepare(`
      INSERT INTO users (phone, name, last_seen)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(phone) DO UPDATE SET
        name = COALESCE(?, name),
        last_seen = CURRENT_TIMESTAMP
    `).run(phone, name, name);
  } catch (err) {
    console.error("DB upsertUser error:", err.message);
  }
}

function getUser(phone) {
  try {
    return db.prepare("SELECT * FROM users WHERE phone = ?").get(phone);
  } catch (err) {
    console.error("DB getUser error:", err.message);
    return null;
  }
}

// === STOCK FUNCTIONS ===

function getStock(productId) {
  try {
    const row = db
      .prepare("SELECT quantity FROM stock WHERE product_id = ?")
      .get(productId);
    return row ? row.quantity : 0;
  } catch (err) {
    console.error("DB getStock error:", err.message);
    return 0;
  }
}

function decreaseStock(productId, quantity) {
  try {
    db.prepare(
      "UPDATE stock SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?"
    ).run(quantity, productId, quantity);
  } catch (err) {
    console.error("DB decreaseStock error:", err.message);
  }
}

// === CART FUNCTIONS ===

function addToCart(userId, productId, productName, price, quantity) {
  try {
    const existing = db
      .prepare("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?")
      .get(userId, productId);

    if (existing) {
      db.prepare(
        "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?"
      ).run(quantity, userId, productId);
    } else {
      db.prepare(
        "INSERT INTO cart_items (user_id, product_id, product_name, price, quantity) VALUES (?, ?, ?, ?, ?)"
      ).run(userId, productId, productName, price, quantity);
    }
  } catch (err) {
    console.error("DB addToCart error:", err.message);
  }
}

function getCart(userId) {
  try {
    return db.prepare("SELECT * FROM cart_items WHERE user_id = ?").all(userId);
  } catch (err) {
    console.error("DB getCart error:", err.message);
    return [];
  }
}

function removeFromCart(userId, productId) {
  try {
    const result = db
      .prepare("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?")
      .run(userId, productId);
    return result.changes > 0;
  } catch (err) {
    console.error("DB removeFromCart error:", err.message);
    return false;
  }
}

function clearCart(userId) {
  try {
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
  } catch (err) {
    console.error("DB clearCart error:", err.message);
  }
}

// === ORDER FUNCTIONS ===

// Transaction: create order + decrease stock + clear cart (all or nothing)
const createOrderTransaction = db.transaction(
  (orderId, userId, userName, items, total) => {
    // Save order
    db.prepare(
      "INSERT INTO orders (id, user_id, user_name, items, total) VALUES (?, ?, ?, ?, ?)"
    ).run(orderId, userId, userName, JSON.stringify(items), total);

    // Decrease stock for each item
    items.forEach((item) => {
      db.prepare(
        "UPDATE stock SET quantity = quantity - ? WHERE product_id = ? AND quantity >= ?"
      ).run(item.quantity, item.productId, item.quantity);
    });

    // Update user order count
    db.prepare(
      "UPDATE users SET total_orders = total_orders + 1 WHERE phone = ?"
    ).run(userId);

    // Clear cart
    db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
  }
);

function createOrder(orderId, userId, userName, items, total) {
  try {
    createOrderTransaction(orderId, userId, userName, items, total);
  } catch (err) {
    console.error("DB createOrder error:", err.message);
    throw err;
  }
}

function getOrder(orderId) {
  try {
    return db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  } catch (err) {
    console.error("DB getOrder error:", err.message);
    return null;
  }
}

function getUserOrders(userId) {
  try {
    return db
      .prepare(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
      )
      .all(userId);
  } catch (err) {
    console.error("DB getUserOrders error:", err.message);
    return [];
  }
}

function updateOrderStatus(orderId, status) {
  try {
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(
      status,
      orderId
    );
  } catch (err) {
    console.error("DB updateOrderStatus error:", err.message);
  }
}

function getAllPendingOrders() {
  try {
    return db
      .prepare(
        "SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC"
      )
      .all();
  } catch (err) {
    console.error("DB getAllPendingOrders error:", err.message);
    return [];
  }
}

// === STORE OWNER FUNCTIONS ===

function createStoreOwner(email, hashedPassword, name) {
  const result = db.prepare(
    "INSERT INTO store_owners (email, password, name) VALUES (?, ?, ?)"
  ).run(email, hashedPassword, name);
  return result.lastInsertRowid;
}

function getStoreOwnerByEmail(email) {
  return db.prepare("SELECT * FROM store_owners WHERE email = ?").get(email);
}

function getStoreOwnerById(id) {
  return db.prepare("SELECT id, email, name, created_at FROM store_owners WHERE id = ?").get(id);
}

function updateStoreOwnerPassword(ownerId, hashedPassword) {
  db.prepare("UPDATE store_owners SET password = ? WHERE id = ?").run(hashedPassword, ownerId);
}

// === STORE FUNCTIONS ===

function createStore(ownerId, name, slug, description, phone) {
  const result = db.prepare(
    "INSERT INTO stores (owner_id, name, slug, description, phone) VALUES (?, ?, ?, ?, ?)"
  ).run(ownerId, name, slug, description || "", phone || "");
  return result.lastInsertRowid;
}

function getStoreByOwner(ownerId) {
  return db.prepare("SELECT * FROM stores WHERE owner_id = ?").get(ownerId);
}

function getStoreBySlug(slug) {
  return db.prepare("SELECT * FROM stores WHERE slug = ? AND is_active = 1").get(slug);
}

function updateStore(storeId, fields) {
  const allowed = ["name", "description", "phone", "address", "logo_url", "banner_url"];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (updates.length === 0) return;
  values.push(storeId);
  db.prepare(`UPDATE stores SET ${updates.join(", ")} WHERE id = ?`).run(...values);
}

// === STORE PRODUCT FUNCTIONS ===

function getStoreProducts(storeId) {
  return db.prepare(
    "SELECT * FROM store_products WHERE store_id = ? AND is_active = 1 ORDER BY created_at DESC"
  ).all(storeId);
}

function getStoreProduct(storeId, productId) {
  return db.prepare(
    "SELECT * FROM store_products WHERE id = ? AND store_id = ?"
  ).get(productId, storeId);
}

function createStoreProduct(storeId, data) {
  const result = db.prepare(`
    INSERT INTO store_products (store_id, name, name_bn, price, category, description, image, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(storeId, data.name, data.name_bn || "", data.price, data.category || "", data.description || "", data.image || "", data.stock || 0);
  return result.lastInsertRowid;
}

function updateStoreProduct(storeId, productId, data) {
  const allowed = ["name", "name_bn", "price", "category", "description", "image", "stock", "is_active"];
  const updates = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (updates.length === 0) return;
  values.push(productId, storeId);
  db.prepare(`UPDATE store_products SET ${updates.join(", ")} WHERE id = ? AND store_id = ?`).run(...values);
}

function deleteStoreProduct(storeId, productId) {
  db.prepare("UPDATE store_products SET is_active = 0 WHERE id = ? AND store_id = ?").run(productId, storeId);
}

// === DASHBOARD QUERY FUNCTIONS ===

function getStoreOrders(storeId, { status, search, page = 1, limit = 20 } = {}) {
  let where = "WHERE store_id = ?";
  const params = [storeId];

  if (status && status !== "all") {
    where += " AND status = ?";
    params.push(status);
  }
  if (search) {
    where += " AND (id LIKE ? OR user_name LIKE ? OR user_id LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM orders ${where}`).get(...params).count;
  const offset = (page - 1) * limit;
  params.push(limit, offset);
  const orders = db.prepare(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params);

  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

function getStoreOrder(storeId, orderId) {
  return db.prepare("SELECT * FROM orders WHERE id = ? AND store_id = ?").get(orderId, storeId);
}

function updateStoreOrderStatus(storeId, orderId, status) {
  db.prepare("UPDATE orders SET status = ? WHERE id = ? AND store_id = ?").run(status, orderId, storeId);
}

function getStoreCustomers(storeId, { search, page = 1, limit = 20 } = {}) {
  let where = "WHERE o.store_id = ?";
  const params = [storeId];

  if (search) {
    where += " AND (o.user_name LIKE ? OR o.user_id LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  const countSql = `SELECT COUNT(DISTINCT o.user_id) as count FROM orders o ${where}`;
  const total = db.prepare(countSql).get(...params).count;

  const offset = (page - 1) * limit;
  params.push(limit, offset);
  const customers = db.prepare(`
    SELECT o.user_id as phone, o.user_name as name,
      COUNT(*) as total_orders,
      SUM(o.total) as total_spent,
      MIN(o.created_at) as first_order,
      MAX(o.created_at) as last_order
    FROM orders o ${where}
    GROUP BY o.user_id
    ORDER BY last_order DESC
    LIMIT ? OFFSET ?
  `).all(...params);

  return { customers, total, page, limit, totalPages: Math.ceil(total / limit) };
}

function getStoreStats(storeId) {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_orders,
      SUM(total) as total_revenue,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
    FROM orders WHERE store_id = ?
  `).get(storeId);

  const totalCustomers = db.prepare(
    "SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE store_id = ?"
  ).get(storeId).count;

  const totalProducts = db.prepare(
    "SELECT COUNT(*) as count FROM store_products WHERE store_id = ? AND is_active = 1"
  ).get(storeId).count;

  const thisMonth = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders WHERE store_id = ? AND created_at >= date('now', 'start of month')
  `).get(storeId);

  const today = db.prepare(`
    SELECT COUNT(*) as orders, COALESCE(SUM(total), 0) as revenue
    FROM orders WHERE store_id = ? AND date(created_at) = date('now')
  `).get(storeId);

  const recentOrders = db.prepare(
    "SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC LIMIT 10"
  ).all(storeId);

  return {
    total_orders: stats.total_orders || 0,
    total_revenue: stats.total_revenue || 0,
    pending_orders: stats.pending_orders || 0,
    confirmed_orders: stats.confirmed_orders || 0,
    delivered_orders: stats.delivered_orders || 0,
    cancelled_orders: stats.cancelled_orders || 0,
    total_customers: totalCustomers,
    total_products: totalProducts,
    this_month_orders: thisMonth.orders || 0,
    this_month_revenue: thisMonth.revenue || 0,
    today_orders: today.orders || 0,
    today_revenue: today.revenue || 0,
    recent_orders: recentOrders,
  };
}

function getStoreAnalytics(storeId) {
  // Revenue last 30 days (daily)
  const dailyRevenue = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as orders, SUM(total) as revenue
    FROM orders WHERE store_id = ? AND created_at >= date('now', '-30 days')
    GROUP BY date(created_at) ORDER BY date ASC
  `).all(storeId);

  // Top selling products
  const topProducts = db.prepare(`
    SELECT sp.name, sp.id, sp.price,
      (SELECT COUNT(*) FROM orders o WHERE o.store_id = ? AND o.items LIKE '%"productId":' || sp.id || '%') as order_count
    FROM store_products sp WHERE sp.store_id = ? AND sp.is_active = 1
    ORDER BY order_count DESC LIMIT 5
  `).all(storeId, storeId);

  // Orders by status
  const ordersByStatus = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM orders WHERE store_id = ?
    GROUP BY status
  `).all(storeId);

  return { dailyRevenue, topProducts, ordersByStatus };
}

// Graceful shutdown
function close() {
  db.close();
  console.log("Database connection closed.");
}

module.exports = {
  upsertUser,
  getUser,
  getStock,
  decreaseStock,
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  createOrder,
  getOrder,
  getUserOrders,
  updateOrderStatus,
  getAllPendingOrders,
  // Store owner
  createStoreOwner,
  getStoreOwnerByEmail,
  getStoreOwnerById,
  updateStoreOwnerPassword,
  // Store
  createStore,
  getStoreByOwner,
  getStoreBySlug,
  updateStore,
  // Store products
  getStoreProducts,
  getStoreProduct,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  // Dashboard
  getStoreOrders,
  getStoreOrder,
  updateStoreOrderStatus,
  getStoreCustomers,
  getStoreStats,
  getStoreAnalytics,
  close,
};
