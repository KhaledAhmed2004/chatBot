// ============================================================
// REST API Routes - Web Store er jonno
// ============================================================
// Ki kore: React frontend theke HTTP request ashbe, ekhane handle hobe
// Keno: WhatsApp bot er store.js WhatsApp-formatted text return kore,
//        web store er jonno clean JSON return dorkar
// Database: same SQLite DB use kore (WhatsApp bot + web store = same data)
// ============================================================

const express = require("express");
const router = express.Router();
const db = require("../services/database");
const products = require("../../data/products.json");
const { sendMessage } = require("../bot/whatsapp");

// ============================================================
// GET /api/products - Shob products + live stock dekhao
// ============================================================
// Ki kore: products.json theke product list ney, database theke
//          real-time stock check kore, JSON return kore
// Keno: Frontend e product grid dekhano er jonno
// ============================================================
router.get("/products", (req, res) => {
  const productsWithStock = products.map((p) => ({
    ...p,
    stock: db.getStock(p.id),
  }));
  res.json(productsWithStock);
});

// ============================================================
// GET /api/products/:id - Single product detail + live stock
// ============================================================
// Ki kore: URL er :id parameter diye product khonje, stock check kore
// Keno: Product detail page er jonno
// ============================================================
router.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json({
    ...product,
    stock: db.getStock(product.id),
  });
});

// ============================================================
// GET /api/cart/:sessionId - Cart er items dekhao
// ============================================================
// Ki kore: sessionId diye user er cart items database theke ney
// Keno: Cart drawer/page e items dekhano er jonno
// sessionId: browser e localStorage e stored UUID (login er aage)
//            ba phone number (login er pore)
// ============================================================
router.get("/cart/:sessionId", (req, res) => {
  const items = db.getCart(req.params.sessionId);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ items, total, count });
});

// ============================================================
// POST /api/cart/:sessionId - Cart e item add koro
// ============================================================
// Ki kore: product exist kina check kore, stock check kore,
//          pore database e cart item add kore
// Keno: "Add to Cart" button click korle ei API call hoy
// Body: { productId: 1, quantity: 2 }
// ============================================================
router.post("/cart/:sessionId", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const { sessionId } = req.params;

  // Validate
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const stock = db.getStock(productId);
  if (stock <= 0)
    return res.status(400).json({ error: `${product.name} is out of stock` });
  if (quantity > stock)
    return res
      .status(400)
      .json({ error: `Only ${stock} available`, available: stock });
  if (quantity < 1 || quantity > 99)
    return res.status(400).json({ error: "Quantity must be 1-99" });

  db.addToCart(sessionId, product.id, product.name, product.price, quantity);

  // Updated cart return koro
  const items = db.getCart(sessionId);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ success: true, items, total, count });
});

// ============================================================
// PUT /api/cart/:sessionId/:productId - Cart item er quantity update
// ============================================================
// Ki kore: purano item remove kore notun quantity diye add kore
//          (database e updateQuantity function nai tai remove+add)
// Keno: Cart e +/- button diye quantity change korle
// Body: { quantity: 3 }
// Note: quantity 0 dile item remove hobe
// ============================================================
router.put("/cart/:sessionId/:productId", (req, res) => {
  const { sessionId, productId } = req.params;
  const { quantity } = req.body;
  const pid = parseInt(productId);

  // quantity 0 = remove
  if (quantity === 0) {
    db.removeFromCart(sessionId, pid);
    const items = db.getCart(sessionId);
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    return res.json({ success: true, items, total, count });
  }

  const product = products.find((p) => p.id === pid);
  if (!product) return res.status(404).json({ error: "Product not found" });

  const stock = db.getStock(pid);
  if (quantity > stock)
    return res
      .status(400)
      .json({ error: `Only ${stock} available`, available: stock });

  // Remove old, add new quantity
  db.removeFromCart(sessionId, pid);
  db.addToCart(sessionId, pid, product.name, product.price, quantity);

  const items = db.getCart(sessionId);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ success: true, items, total, count });
});

// ============================================================
// DELETE /api/cart/:sessionId/:productId - Cart theke item remove
// ============================================================
// Ki kore: specific product cart theke delete kore
// Keno: Cart e "X" (remove) button click korle
// ============================================================
router.delete("/cart/:sessionId/:productId", (req, res) => {
  db.removeFromCart(req.params.sessionId, parseInt(req.params.productId));
  const items = db.getCart(req.params.sessionId);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ success: true, items, total, count });
});

// ============================================================
// DELETE /api/cart/:sessionId - Pura cart clear koro
// ============================================================
// Ki kore: user er shob cart items delete kore
// Keno: "Clear Cart" button click korle
// ============================================================
router.delete("/cart/:sessionId", (req, res) => {
  db.clearCart(req.params.sessionId);
  res.json({ success: true, items: [], total: 0, count: 0 });
});

// ============================================================
// POST /api/orders - ORDER PLACE koro (main checkout endpoint)
// ============================================================
// Ki kore:
//   1. Cart items fetch kore sessionId diye
//   2. Stock verify kore (order er aage last check)
//   3. User create/update kore phone number diye
//   4. Order ID generate kore (WEB-XXXXX format)
//   5. Database transaction e order save + stock decrease + cart clear
//   6. Admin ke WhatsApp e notification pathay (non-blocking)
//   7. Success response return kore
// Keno: Checkout page e "Place Order" button click korle
// Body: { sessionId, phone, customerName, address, note }
// ============================================================
router.post("/orders", (req, res) => {
  const { sessionId, phone, customerName, address, note } = req.body;

  // Validate required fields
  if (!sessionId || !phone || !customerName) {
    return res
      .status(400)
      .json({ error: "Name, phone, and session required" });
  }

  // Phone validation (10-15 digits, with optional +)
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return res.status(400).json({ error: "Invalid phone number" });
  }

  // Get cart items
  const cartItems = db.getCart(sessionId);
  if (cartItems.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  // Stock check
  for (const item of cartItems) {
    const stock = db.getStock(item.product_id);
    if (stock < item.quantity) {
      return res.status(400).json({
        error: `${item.product_name} er stock e matro ${stock}ta ache`,
        productId: item.product_id,
      });
    }
  }

  // Build order items
  let total = 0;
  let itemsText = "";
  const items = cartItems.map((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    itemsText += `- ${item.product_name} x${item.quantity} = ৳${subtotal}\n`;
    return {
      productId: item.product_id,
      name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      subtotal,
    };
  });

  // Generate order ID (WEB- prefix to distinguish from WhatsApp orders)
  const orderId = "WEB-" + Date.now().toString(36).toUpperCase();

  // Create user + order (transaction)
  try {
    db.upsertUser(cleanPhone, customerName);
    db.createOrder(orderId, cleanPhone, customerName, items, total);
  } catch (err) {
    return res.status(500).json({ error: "Order place korte problem hoise" });
  }

  // Admin WhatsApp notification (non-blocking, fail silently)
  const adminNumber = process.env.ADMIN_NUMBER;
  if (adminNumber) {
    const adminMsg =
      `🛒 *New Web Order!*\n\n` +
      `Order ID: *${orderId}*\n` +
      `Customer: ${customerName}\n` +
      `Phone: ${cleanPhone}\n` +
      `Address: ${address || "N/A"}\n\n` +
      `*Items:*\n${itemsText}\n` +
      `*Total: ৳${total}*` +
      (note ? `\n\nNote: ${note}` : "");
    sendMessage(adminNumber, adminMsg).catch(() => {});
  }

  res.json({
    success: true,
    orderId,
    total,
    items,
    message: "Order placed successfully!",
  });
});

// ============================================================
// GET /api/orders/:orderId - Single order dekhao
// ============================================================
// Ki kore: order ID diye database theke order details fetch kore
// Keno: Order tracking page e order ID diye search korle
// Note: items field JSON string hishabe stored, parse kore return kori
// ============================================================
router.get("/orders/:orderId", (req, res) => {
  const order = db.getOrder(req.params.orderId);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.items = JSON.parse(order.items);
  res.json(order);
});

// ============================================================
// GET /api/orders/by-phone/:phone - Phone number diye shob orders
// ============================================================
// Ki kore: phone number diye user er last 10 orders fetch kore
// Keno: Order tracking page e phone diye search korle order history dekhay
// ============================================================
router.get("/orders/by-phone/:phone", (req, res) => {
  const cleanPhone = req.params.phone.replace(/[^0-9]/g, "");
  const orders = db.getUserOrders(cleanPhone);
  const parsed = orders.map((o) => ({
    ...o,
    items: JSON.parse(o.items),
  }));
  res.json(parsed);
});

module.exports = router;
