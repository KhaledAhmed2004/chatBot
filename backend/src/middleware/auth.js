const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "shopbot-secret-key-change-in-production";

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.owner = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function generateToken(owner) {
  return jwt.sign(
    { id: owner.id, email: owner.email, name: owner.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { requireAuth, generateToken, JWT_SECRET };
