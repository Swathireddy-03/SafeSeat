const express = require("express");
const db = require("../config/db");

const router = express.Router();

// =====================================================
// TEST AUTH ROUTE
// GET /api/auth
// =====================================================

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth API is working",
  });
});

// =====================================================
// SIGNUP
// POST /api/auth/signup
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("=================================");
    console.log("SIGNUP REQUEST");
    console.log(req.body);
    console.log("=================================");

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const [result] = await db.execute(
      `
      INSERT INTO users
      (name, email, password)
      VALUES (?, ?, ?)
      `,
      [name, email, password]
    );

    console.log("User created:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: result.insertId,
        name,
        email,
      },
    });

  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account",
      error: error.message,
    });
  }
});

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await db.execute(
      `
      SELECT
        id,
        name,
        email,
        password,
        created_at
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login",
      error: error.message,
    });
  }
});

module.exports = router;