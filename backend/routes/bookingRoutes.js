const express = require("express");
const router = express.Router();

const db = require("../config/db");

/* =========================================================
   GET ALL BOOKINGS - ADMIN DASHBOARD
   GET /api/bookings
========================================================= */
router.get("/", async (req, res) => {
  try {
    const [bookings] = await db.execute(`
      SELECT
        b.*,

        buses.bus_name,
        buses.bus_number,
        buses.operator,
        buses.bus_type,

        buses.from_city AS bus_from_city,
        buses.to_city AS bus_to_city,
        buses.departure_time AS bus_departure_time,
        buses.arrival_time AS bus_arrival_time

      FROM bookings b

      LEFT JOIN buses
        ON b.bus_id = buses.id

      ORDER BY b.created_at DESC
    `);

    const formattedBookings = bookings.map((booking) => ({
      ...booking,

      id: booking.id,
      bookingId: booking.booking_id,

      userId: booking.user_id,
      busId: booking.bus_id,

      journeyDate: booking.journey_date,

      seats: Number(booking.seats || 0),
      amount: Number(booking.amount || 0),

      passengerName: booking.passenger_name,
      passengerAge: booking.passenger_age,
      passengerGender: booking.passenger_gender,

      paymentMethod: booking.payment_method,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.booking_status,

      transportType: booking.transport_type,

      trainId: booking.train_id,
      trainName: booking.train_name,
      trainNumber: booking.train_number,
      trainType: booking.train_type,
      trainClass: booking.train_class,

      busName: booking.bus_name,
      busNumber: booking.bus_number,
      operator: booking.operator,
      busType: booking.bus_type,

      from:
        booking.bus_from_city ||
        booking.from_city ||
        null,

      to:
        booking.bus_to_city ||
        booking.to_city ||
        null,

      departureTime:
        booking.bus_departure_time ||
        booking.departure_time ||
        null,

      arrivalTime:
        booking.bus_arrival_time ||
        booking.arrival_time ||
        null,

      createdAt: booking.created_at,
    }));

    res.json({
      success: true,
      count: formattedBookings.length,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
});


/* =========================================================
   GET BOOKING STATISTICS - ADMIN DASHBOARD
   GET /api/bookings/stats

   IMPORTANT:
   This route MUST come before /:bookingId
========================================================= */
router.get("/stats", async (req, res) => {
  try {
    const [[bookingStats]] = await db.execute(`
      SELECT
        COUNT(*) AS totalBookings,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(COALESCE(booking_status, '')) = 'confirmed'
              THEN seats
              ELSE 0
            END
          ),
          0
        ) AS totalSeatsBooked,

        COALESCE(
          SUM(
            CASE
              WHEN LOWER(COALESCE(booking_status, '')) = 'confirmed'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS totalRevenue

      FROM bookings
    `);

    const [[busStats]] = await db.execute(`
      SELECT
        COUNT(*) AS totalBuses,
        COALESCE(SUM(total_seats), 0) AS totalBusSeats
      FROM buses
    `);

    res.json({
      success: true,

      stats: {
        totalBookings: Number(bookingStats.totalBookings || 0),
        totalSeatsBooked: Number(
          bookingStats.totalSeatsBooked || 0
        ),
        totalRevenue: Number(
          bookingStats.totalRevenue || 0
        ),

        totalBuses: Number(busStats.totalBuses || 0),
        totalBusSeats: Number(busStats.totalBusSeats || 0),
      },
    });
  } catch (error) {
    console.error("BOOKING STATS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error.message,
    });
  }
});


/* =========================================================
   CREATE BOOKING
   POST /api/bookings

   Supports:
   - Bus bookings
   - Train bookings
========================================================= */
router.post("/", async (req, res) => {
  try {
    const {
      userId,

      transportType = "bus",

      busId,

      trainId,
      trainName,
      trainNumber,
      trainType,
      trainClass,

      journeyDate,

      from,
      to,

      departureTime,
      arrivalTime,

      seats,
      selectedSeats,
      seatNumber,

      passengerName,
      passengerAge,
      passengerGender,

      amount,
      totalAmount,

      paymentMethod,
    } = req.body;

    /* -----------------------------
       BASIC VALIDATION
    ----------------------------- */

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!journeyDate) {
      return res.status(400).json({
        success: false,
        message: "Journey date is required",
      });
    }

    const seatCount =
      Number(seats) ||
      (Array.isArray(selectedSeats)
        ? selectedSeats.length
        : 0);

    if (seatCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "At least one seat is required",
      });
    }

    const finalAmount =
      Number(totalAmount) ||
      Number(amount) ||
      0;


    /* =====================================================
       BUS BOOKING
    ===================================================== */

    if (transportType === "bus") {
      if (!busId) {
        return res.status(400).json({
          success: false,
          message: "Bus ID is required",
        });
      }

      /* Check bus */
      const [buses] = await db.execute(
        `
        SELECT *
        FROM buses
        WHERE id = ?
        `,
        [busId]
      );

      if (buses.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Bus not found",
        });
      }

      const bus = buses[0];

      /* Check already booked seats for this date */

      const [bookingResult] = await db.execute(
        `
        SELECT
          COALESCE(SUM(seats), 0) AS bookedSeats

        FROM bookings

        WHERE bus_id = ?

        AND journey_date = ?

        AND LOWER(
          COALESCE(booking_status, '')
        ) = 'confirmed'
        `,
        [busId, journeyDate]
      );

      const bookedSeats = Number(
        bookingResult[0].bookedSeats || 0
      );

      const availableSeats =
        Number(bus.total_seats) - bookedSeats;

      if (seatCount > availableSeats) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableSeats} seats are available`,
        });
      }
    }


    /* =====================================================
       TRAIN BOOKING
    ===================================================== */

    if (transportType === "train") {
      if (!trainId) {
        return res.status(400).json({
          success: false,
          message: "Train ID is required",
        });
      }

      console.log(
        "Train booking:",
        trainId,
        trainName,
        trainNumber,
        trainClass
      );
    }


    /* =====================================================
       GENERATE BOOKING ID
    ===================================================== */

    const bookingId =
      "SS" +
      Date.now() +
      Math.floor(Math.random() * 1000);


    /* =====================================================
       INSERT BOOKING
    ===================================================== */

    const [result] = await db.execute(
      `
      INSERT INTO bookings
      (
        booking_id,
        user_id,
        bus_id,

        journey_date,
        seats,

        passenger_name,
        passenger_age,
        passenger_gender,

        amount,
        payment_method,

        payment_status,
        booking_status,

        train_class,
        train_id,

        transport_type,

        train_name,
        train_number,
        train_type,

        created_at
      )

      VALUES
      (
        ?,
        ?,
        ?,

        ?,
        ?,

        ?,
        ?,
        ?,

        ?,
        ?,

        ?,
        ?,

        ?,
        ?,

        ?,

        ?,
        ?,
        ?,

        NOW()
      )
      `,
      [
        bookingId,

        userId,

        transportType === "bus"
          ? busId
          : null,

        journeyDate,

        seatCount,

        passengerName || null,
        passengerAge || null,
        passengerGender || null,

        finalAmount,

        paymentMethod || "Cash",

        "Paid",
        "confirmed",

        trainClass || null,
        trainId || null,

        transportType,

        trainName || null,
        trainNumber || null,
        trainType || null,
      ]
    );


    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(201).json({
      success: true,

      message: "Booking created successfully",

      booking: {
        id: result.insertId,

        bookingId,

        userId,

        busId:
          transportType === "bus"
            ? busId
            : null,

        trainId:
          transportType === "train"
            ? trainId
            : null,

        transportType,

        journeyDate,

        seats: seatCount,

        selectedSeats:
          selectedSeats || [],

        seatNumber:
          seatNumber || null,

        passengerName:
          passengerName || null,

        passengerAge:
          passengerAge || null,

        passengerGender:
          passengerGender || null,

        amount: finalAmount,

        paymentMethod:
          paymentMethod || "Cash",

        paymentStatus: "Paid",

        bookingStatus: "confirmed",

        trainClass:
          trainClass || null,

        trainName:
          trainName || null,

        trainNumber:
          trainNumber || null,

        trainType:
          trainType || null,
      },
    });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    });
  }
});


/* =========================================================
   GET BOOKINGS FOR A USER
   GET /api/bookings/user/:userId
========================================================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [bookings] = await db.execute(
      `
      SELECT
        b.*,

        buses.bus_name,
        buses.bus_number,
        buses.operator,
        buses.bus_type,

        buses.from_city,
        buses.to_city,

        buses.departure_time,
        buses.arrival_time

      FROM bookings b

      LEFT JOIN buses
        ON b.bus_id = buses.id

      WHERE b.user_id = ?

      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error("GET USER BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message,
    });
  }
});


/* =========================================================
   GET SINGLE BOOKING
   GET /api/bookings/:bookingId
========================================================= */
router.get("/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [bookings] = await db.execute(
      `
      SELECT
        b.*,

        buses.bus_name,
        buses.bus_number,
        buses.operator,
        buses.bus_type,

        buses.from_city,
        buses.to_city,

        buses.departure_time,
        buses.arrival_time

      FROM bookings b

      LEFT JOIN buses
        ON b.bus_id = buses.id

      WHERE
        b.booking_id = ?
        OR b.id = ?

      LIMIT 1
      `,
      [bookingId, bookingId]
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking: bookings[0],
    });

  } catch (error) {
    console.error("GET SINGLE BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
});


/* =========================================================
   CANCEL BOOKING
   PATCH /api/bookings/:bookingId/cancel
========================================================= */
router.patch("/:bookingId/cancel", async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [result] = await db.execute(
      `
      UPDATE bookings

      SET booking_status = 'Cancelled'

      WHERE
        booking_id = ?
        OR id = ?
      `,
      [bookingId, bookingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
    });

  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
});


/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;