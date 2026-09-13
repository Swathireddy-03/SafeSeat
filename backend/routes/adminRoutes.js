const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ===============================
// ADMIN HOME
// GET /api/admin
// ===============================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SafeSeat Admin API is working",
  });
});

// ===============================
// ADMIN LOGIN
// POST /api/admin/login
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const adminEmail = "admin@safeseat.com";
    const adminPassword = "admin123";

    // Check admin credentials
    if (
      email.trim().toLowerCase() !== adminEmail ||
      password !== adminPassword
    ) {
      // Save failed login if table exists
      try {
        await db.execute(
          `INSERT INTO admin_logins (email, status)
           VALUES (?, ?)`,
          [email.trim(), "Failed"]
        );
      } catch (logError) {
        console.log("Login history error:", logError.message);
      }

      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    // Save successful login
    try {
      await db.execute(
        `INSERT INTO admin_logins (email, status)
         VALUES (?, ?)`,
        [email.trim(), "Success"]
      );
    } catch (logError) {
      console.log("Login history error:", logError.message);
    }

    return res.json({
      success: true,
      message: "Admin login successful",
      admin: {
        email: adminEmail,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
});

// ===============================
// ADMIN LOGIN HISTORY
// GET /api/admin/logins
// ===============================
router.get("/logins", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, email, login_time, status
       FROM admin_logins
       ORDER BY login_time DESC`
    );

    res.json({
      success: true,
      logins: rows,
    });
  } catch (error) {
    console.error("ADMIN LOGINS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch admin login history",
      error: error.message,
    });
  }
});

module.exports = router;