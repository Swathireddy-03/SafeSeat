const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const seatRoutes = require("./routes/seatRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* =========================================================
   ROOT / HEALTH CHECK
   ========================================================= */

app.get("/", async (req, res) => {
  try {
    const [result] = await db.execute(
      "SELECT COUNT(*) AS count FROM buses"
    );

    res.json({
      success: true,
      message: "SafeSeat Backend is running successfully 🚍🚆",
      busCount: Number(result[0].count),
    });
  } catch (error) {
    console.error("HOME ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Backend is running but database check failed",
      error: error.message,
    });
  }
});

/* =========================================================
   API ROUTES
   ========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/buses", busRoutes);

app.use("/api/seats", seatRoutes);

/*
  ONE BOOKING SYSTEM
  Handles:
  🚌 Bus bookings
  🚆 Train bookings
*/
app.use("/api/bookings", bookingRoutes);

/*
  Admin APIs
  - statistics
  - all bookings
  - users
*/
app.use("/api/admin", adminRoutes);

/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

/* =========================================================
   START SERVER
   ========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚍🚆 SafeSeat Backend Running");
  console.log(`📡 Port: ${PORT}`);
  console.log("=================================");
});