const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();

function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "password must be at least 8 chars" });
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ error: "email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash });

    const token = signToken(user._id.toString());
    return res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signToken(user._id.toString());
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
});

// GET /auth/me (test protected route)
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("_id email createdAt");
  if (!user) return res.status(404).json({ error: "user not found" });
  return res.json({ user: { id: user._id, email: user.email, createdAt: user.createdAt } });
});

module.exports = router;
