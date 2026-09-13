const db = require("../config/db");

// =====================================================
// CREATE BOOKING
// =====================================================

const createBooking = async (req, res) => {
  try {
    const {
      userId,
      busId,
      journeyDate,
      seats,
      passengerName,
      passengerAge,
      passengerGender,
      amount,
      paymentMethod,
    } = req.body;

    if (
      !userId ||
      !busId ||
      !journeyDate ||
      !seats ||
      !passengerName ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Required booking details are missing",
      });
    }

    // Check user
    const [users] = await db.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check bus
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

    // Normalize seats
    const seatList = Array.isArray(seats)
      ? seats.map(Number)
      : seats
          .toString()
          .split(",")
          .map((seat) => Number(seat.trim()))
          .filter(Boolean);

    if (seatList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one seat",
      });
    }

    // Check seat range
    for (const seat of seatList) {
      if (
        seat < 1 ||
        seat > Number(bus.total_seats)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid seat number: ${seat}`,
        });
      }
    }

    // Check booked seats
    const [existingBookings] =
      await db.execute(
        `
        SELECT seats
        FROM bookings
        WHERE bus_id = ?
        AND journey_date = ?
        AND LOWER(booking_status) = 'confirmed'
        `,
        [busId, journeyDate]
      );

    const bookedSeats = [];

    existingBookings.forEach((booking) => {
      if (!booking.seats) return;

      const existingSeats =
        booking.seats
          .toString()
          .split(",")
          .map((seat) => Number(seat.trim()))
          .filter(Boolean);

      bookedSeats.push(...existingSeats);
    });

    const alreadyBooked =
      seatList.filter((seat) =>
        bookedSeats.includes(seat)
      );

    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some seats are already booked",
        seats: alreadyBooked,
      });
    }

    // Generate booking ID
    const bookingId =
      "SR" +
      Date.now().toString().slice(-8);

    const paymentStatus =
      paymentMethod ? "Paid" : "Pending";

    // Insert booking
    const [result] =
      await db.execute(
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
          booking_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          bookingId,
          userId,
          busId,
          journeyDate,
          seatList.join(","),
          passengerName,
          passengerAge || null,
          passengerGender || null,
          amount,
          paymentMethod || null,
          paymentStatus,
          "Confirmed",
        ]
      );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      bookingId,
      databaseId: result.insertId,
      busId,
      seats: seatList,
      journeyDate,
      amount,
      paymentMethod: paymentMethod || null,
      paymentStatus,
      bookingStatus: "Confirmed",
    });
  } catch (error) {
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to create booking",
      error: error.message,
    });
  }
};

// =====================================================
// GET USER BOOKINGS
// =====================================================

const getUserBookings = async (req, res) => {
  try {
    const userId = Number(
      req.params.userId
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const [bookings] =
      await db.execute(
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
        JOIN buses
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
    console.error(
      "GET USER BOOKINGS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch bookings",
      error: error.message,
    });
  }
};

// =====================================================
// GET BOOKING BY ID
// =====================================================

const getBookingById = async (req, res) => {
  try {
    const { bookingId } =
      req.params;

    const [bookings] =
      await db.execute(
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
        JOIN buses
          ON b.bus_id = buses.id
        WHERE b.booking_id = ?
        `,
        [bookingId]
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
    console.error(
      "GET BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to fetch booking",
      error: error.message,
    });
  }
};

// =====================================================
// CANCEL BOOKING
// =====================================================

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } =
      req.params;

    const [result] =
      await db.execute(
        `
        UPDATE bookings
        SET booking_status = 'Cancelled'
        WHERE booking_id = ?
        `,
        [bookingId]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      message:
        "Booking cancelled successfully",
      bookingId,
    });
  } catch (error) {
    console.error(
      "CANCEL BOOKING ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to cancel booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};