const express = require("express");
const db = require("../config/db");

const router = express.Router();

// =====================================================
// GET OCCUPIED SEATS
// GET /api/seats/:busId
// =====================================================

router.get("/:busId", async (req, res) => {
  try {
    const busId = Number(req.params.busId);

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: "Invalid bus ID",
      });
    }

    console.log("Fetching seats for bus:", busId);

    const [bookings] = await db.execute(
      `
      SELECT
        id,
        booking_id,
        bus_id,
        seats,
        passenger_name,
        passenger_gender,
        booking_status
      FROM bookings
      WHERE bus_id = ?
      AND LOWER(booking_status) = 'confirmed'
      `,
      [busId]
    );

    const occupiedSeats = [];

    bookings.forEach((booking) => {
      if (!booking.seats) return;

      /*
        seats may be stored like:

        "1"
        "1,2"
        "1,2,5"
        "[1,2]"
      */

      let seats = [];

      try {
        if (
          typeof booking.seats === "string" &&
          booking.seats.startsWith("[")
        ) {
          seats = JSON.parse(booking.seats);
        } else {
          seats = booking.seats
            .toString()
            .split(",")
            .map((seat) => seat.trim())
            .filter(Boolean);
        }
      } catch (error) {
        seats = booking.seats
          .toString()
          .split(",")
          .map((seat) => seat.trim())
          .filter(Boolean);
      }

      seats.forEach((seat) => {
        occupiedSeats.push({
          seatNumber: Number(seat),
          gender: booking.passenger_gender || null,
          passengerName:
            booking.passenger_name || null,
          bookingId: booking.booking_id,
        });
      });
    });

    res.json({
      success: true,
      busId,
      occupiedSeats,
    });
  } catch (error) {
    console.error("========== GET SEATS ERROR ==========");
    console.error(error);
    console.error("=====================================");

    res.status(500).json({
      success: false,
      message: "Unable to fetch seats",
      error: error.message,
    });
  }
});

// =====================================================
// CHECK ONE SEAT
// GET /api/seats/:busId/:seatNumber
// =====================================================

router.get("/:busId/:seatNumber", async (req, res) => {
  try {
    const busId = Number(req.params.busId);
    const seatNumber = Number(req.params.seatNumber);

    if (!busId || !seatNumber) {
      return res.status(400).json({
        success: false,
        message: "Invalid bus ID or seat number",
      });
    }

    const [bookings] = await db.execute(
      `
      SELECT
        id,
        booking_id,
        seats,
        passenger_name,
        passenger_gender,
        booking_status
      FROM bookings
      WHERE bus_id = ?
      AND LOWER(booking_status) = 'confirmed'
      `,
      [busId]
    );

    let occupied = false;
    let passenger = null;

    for (const booking of bookings) {
      if (!booking.seats) continue;

      const seats = booking.seats
        .toString()
        .split(",")
        .map((seat) => Number(seat.trim()));

      if (seats.includes(seatNumber)) {
        occupied = true;

        passenger = {
          name: booking.passenger_name,
          gender: booking.passenger_gender,
          bookingId: booking.booking_id,
        };

        break;
      }
    }

    res.json({
      success: true,
      busId,
      seatNumber,
      occupied,
      passenger,
    });
  } catch (error) {
    console.error("Seat check error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to check seat",
      error: error.message,
    });
  }
});

// =====================================================
// BOOK SEAT
// POST /api/seats/book
// =====================================================

router.post("/book", async (req, res) => {
  try {
    const {
      busId,
      seatNumber,
      passengerName,
      passengerGender,
      userId,
      journeyDate,
      amount,
      paymentMethod,
    } = req.body;

    console.log("Booking request:", req.body);

    if (
      !busId ||
      !seatNumber ||
      !passengerName ||
      !passengerGender
    ) {
      return res.status(400).json({
        success: false,
        message: "Required booking details are missing",
      });
    }

    // =================================================
    // CHECK BUS
    // =================================================

    const [buses] = await db.execute(
      "SELECT * FROM buses WHERE id = ?",
      [busId]
    );

    if (buses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const bus = buses[0];

    // =================================================
    // CHECK SEAT
    // =================================================

    const [bookings] = await db.execute(
      `
      SELECT id, seats
      FROM bookings
      WHERE bus_id = ?
      AND LOWER(booking_status) = 'confirmed'
      `,
      [busId]
    );

    const requestedSeat = Number(seatNumber);

    const seatAlreadyBooked = bookings.some((booking) => {
      if (!booking.seats) return false;

      const seats = booking.seats
        .toString()
        .split(",")
        .map((seat) => Number(seat.trim()));

      return seats.includes(requestedSeat);
    });

    if (seatAlreadyBooked) {
      return res.status(409).json({
        success: false,
        message: "Seat is already booked",
      });
    }

    // =================================================
    // GENERATE BOOKING ID
    // =================================================

    const bookingId =
      "SR" +
      Date.now().toString().slice(-8);

    // =================================================
    // INSERT BOOKING
    // =================================================

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
        passenger_gender,
        amount,
        payment_method,
        payment_status,
        booking_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        bookingId,
        userId || 1,
        busId,
        journeyDate || new Date(),
        String(seatNumber),
        passengerName,
        passengerGender,
        amount || bus.price,
        paymentMethod || "Pending",
        paymentMethod ? "Paid" : "Pending",
        "Confirmed",
      ]
    );

    // =================================================
    // RESPONSE
    // =================================================

    res.status(201).json({
      success: true,
      message: "Seat booked successfully",
      bookingId,
      databaseId: result.insertId,
      busId,
      seatNumber: requestedSeat,
      passengerName,
      passengerGender,
    });
  } catch (error) {
    console.error("========== BOOK SEAT ERROR ==========");
    console.error(error);
    console.error("=====================================");

    res.status(500).json({
      success: false,
      message: "Unable to book seat",
      error: error.message,
    });
  }
});

module.exports = router;