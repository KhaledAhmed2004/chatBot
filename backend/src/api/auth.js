const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../services/database");
const { requireAuth, generateToken } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register — new store owner signup
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const existing = db.getStoreOwnerByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const ownerId = db.createStoreOwner(email.toLowerCase().trim(), hashedPassword, name.trim());

    const owner = { id: ownerId, email: email.toLowerCase().trim(), name: name.trim() };
    const token = generateToken(owner);

    res.status(201).json({ success: true, token, owner });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login — store owner login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const owner = db.getStoreOwnerByEmail(email.toLowerCase().trim());
    if (!owner) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, owner.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(owner);
    const store = db.getStoreByOwner(owner.id);

    res.json({
      success: true,
      token,
      owner: { id: owner.id, email: owner.email, name: owner.name },
      store: store || null,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me — get current owner + store info
router.get("/me", requireAuth, (req, res) => {
  try {
    const owner = db.getStoreOwnerById(req.owner.id);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    const store = db.getStoreByOwner(owner.id);
    res.json({ owner, store: store || null });
  } catch (err) {
    console.error("Auth me error:", err.message);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

module.exports = router;
