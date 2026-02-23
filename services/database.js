const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "data", "bot.db"));

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
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
`);

// Create indexes for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
`);

// Initialize stock from products.json (only if stock table is empty)
const stockCount = db.prepare("SELECT COUNT(*) as count FROM stock").get();
if (stockCount.count === 0) {
  const products = require("../data/products.json");
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
  close,
};
