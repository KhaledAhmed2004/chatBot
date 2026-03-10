const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../services/database");

const router = express.Router();

// === STORE MANAGEMENT ===

// POST /api/dashboard/store — create store
router.post("/store", (req, res) => {
  try {
    // Check if owner already has a store
    const existing = db.getStoreByOwner(req.owner.id);
    if (existing) {
      return res.status(400).json({ error: "You already have a store" });
    }

    const { name, slug, description, phone } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: "Store name and slug required" });
    }

    // Validate slug (lowercase, alphanumeric + hyphens)
    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (cleanSlug.length < 3) {
      return res.status(400).json({ error: "Slug must be at least 3 characters" });
    }

    // Check slug uniqueness
    const slugExists = db.getStoreBySlug(cleanSlug);
    if (slugExists) {
      return res.status(400).json({ error: "This store URL is already taken" });
    }

    const storeId = db.createStore(req.owner.id, name.trim(), cleanSlug, description, phone);
    const store = db.getStoreByOwner(req.owner.id);

    res.status(201).json({ success: true, store });
  } catch (err) {
    console.error("Create store error:", err.message);
    res.status(500).json({ error: "Failed to create store" });
  }
});

// GET /api/dashboard/store — get my store
router.get("/store", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found. Create one first." });
    res.json({ store });
  } catch (err) {
    res.status(500).json({ error: "Failed to get store" });
  }
});

// PUT /api/dashboard/store — update store settings
router.put("/store", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    db.updateStore(store.id, req.body);
    const updated = db.getStoreByOwner(req.owner.id);
    res.json({ success: true, store: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update store" });
  }
});

// === DASHBOARD STATS ===

// GET /api/dashboard/stats
router.get("/stats", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const stats = db.getStoreStats(store.id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /api/dashboard/analytics
router.get("/analytics", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const analytics = db.getStoreAnalytics(store.id);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});

// === ORDERS ===

// GET /api/dashboard/orders
router.get("/orders", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const { status, search, page, limit } = req.query;
    const result = db.getStoreOrders(store.id, {
      status,
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    // Parse items JSON for each order
    result.orders = result.orders.map((o) => ({
      ...o,
      items: JSON.parse(o.items || "[]"),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to get orders" });
  }
});

// GET /api/dashboard/orders/:id
router.get("/orders/:id", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const order = db.getStoreOrder(store.id, req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.items = JSON.parse(order.items || "[]");
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to get order" });
  }
});

// PUT /api/dashboard/orders/:id/status
router.put("/orders/:id/status", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const { status } = req.body;
    const allowed = ["pending", "confirmed", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    db.updateStoreOrderStatus(store.id, req.params.id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// POST /api/dashboard/orders — create order from dashboard
router.post("/orders", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const { customerName, phone, items } = req.body;
    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer name, phone, and items required" });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // Validate products exist and calculate total
    let total = 0;
    const orderItems = items.map((item) => {
      const product = db.getStoreProduct(store.id, item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const subtotal = product.price * item.quantity;
      total += subtotal;
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      };
    });

    const orderId = "DASH-" + Date.now().toString(36).toUpperCase();
    db.upsertUser(cleanPhone, customerName);
    db.createOrder(orderId, cleanPhone, customerName, orderItems, total);

    res.status(201).json({ success: true, orderId, total });
  } catch (err) {
    console.error("Dashboard create order error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

// === PRODUCTS CRUD ===

// GET /api/dashboard/products
router.get("/products", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const products = db.getStoreProducts(store.id);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: "Failed to get products" });
  }
});

// POST /api/dashboard/products
router.post("/products", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Product name and price required" });
    }

    const productId = db.createStoreProduct(store.id, req.body);
    const product = db.getStoreProduct(store.id, productId);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /api/dashboard/products/:id
router.put("/products/:id", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const product = db.getStoreProduct(store.id, parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });

    db.updateStoreProduct(store.id, parseInt(req.params.id), req.body);
    const updated = db.getStoreProduct(store.id, parseInt(req.params.id));
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /api/dashboard/products/:id
router.delete("/products/:id", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    db.deleteStoreProduct(store.id, parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// === CUSTOMERS ===

// GET /api/dashboard/customers
router.get("/customers", (req, res) => {
  try {
    const store = db.getStoreByOwner(req.owner.id);
    if (!store) return res.status(404).json({ error: "No store found" });

    const { search, page, limit } = req.query;
    const result = db.getStoreCustomers(store.id, {
      search,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to get customers" });
  }
});

// === ACCOUNT SETTINGS ===

// PUT /api/dashboard/account/password
router.put("/account/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const owner = db.getStoreOwnerByEmail(req.owner.email);
    const valid = await bcrypt.compare(currentPassword, owner.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.updateStoreOwnerPassword(req.owner.id, hashed);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// === PUBLIC STORE API ===
// These are mounted separately (no auth required)

const publicRouter = express.Router();

// GET /api/store/:slug/products — public product listing
publicRouter.get("/:slug/products", (req, res) => {
  try {
    const store = db.getStoreBySlug(req.params.slug);
    if (!store) return res.status(404).json({ error: "Store not found" });

    const products = db.getStoreProducts(store.id);
    res.json({ store: { name: store.name, slug: store.slug, description: store.description, logo_url: store.logo_url }, products });
  } catch (err) {
    res.status(500).json({ error: "Failed to get store products" });
  }
});

// GET /api/store/:slug — public store info
publicRouter.get("/:slug", (req, res) => {
  try {
    const store = db.getStoreBySlug(req.params.slug);
    if (!store) return res.status(404).json({ error: "Store not found" });

    res.json({
      name: store.name,
      slug: store.slug,
      description: store.description,
      phone: store.phone,
      logo_url: store.logo_url,
      banner_url: store.banner_url,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get store" });
  }
});

module.exports = { dashboardRouter: router, publicStoreRouter: publicRouter };
