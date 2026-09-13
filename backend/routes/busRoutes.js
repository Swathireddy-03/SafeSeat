const express = require("express");
const db = require("../config/db");

const router = express.Router();

/* =========================================================
   GET ALL BUSES
   GET /api/buses
========================================================= */

router.get("/", async (req, res) => {
  try {
    const [buses] = await db.execute(`
      SELECT
        b.*,

        COALESCE(
          (
            SELECT SUM(bk.seats)
            FROM bookings bk
            WHERE bk.bus_id = b.id
            AND bk.booking_status <> 'Cancelled'
          ),
          0
        ) AS booked_seats

      FROM buses b
      ORDER BY b.created_at DESC
    `);

    const formattedBuses = buses.map((bus) => ({
      ...bus,
      id: Number(bus.id),
      total_seats: Number(bus.total_seats),
      price: Number(bus.price),
      booked_seats: Number(bus.booked_seats || 0),
    }));

    res.json({
      success: true,
      count: formattedBuses.length,
      buses: formattedBuses,
    });

  } catch (error) {
    console.error("GET BUSES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch buses",
      error: error.message,
    });
  }
});

/* =========================================================
   SEARCH BUSES
   GET /api/buses/search
========================================================= */

router.get("/search", async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = `
      SELECT
        b.*,

        COALESCE(
          (
            SELECT SUM(bk.seats)
            FROM bookings bk
            WHERE bk.bus_id = b.id
            AND bk.booking_status <> 'Cancelled'
          ),
          0
        ) AS booked_seats

      FROM buses b
      WHERE 1 = 1
    `;

    const values = [];

    /* -----------------------------------------------------
       FROM CITY
    ----------------------------------------------------- */

    if (from) {
      query += `
        AND LOWER(b.from_city) = LOWER(?)
      `;

      values.push(from.trim());
    }

    /* -----------------------------------------------------
       TO CITY
    ----------------------------------------------------- */

    if (to) {
      query += `
        AND LOWER(b.to_city) = LOWER(?)
      `;

      values.push(to.trim());
    }

    query += `
      ORDER BY b.departure_time ASC
    `;

    const [buses] = await db.execute(
      query,
      values
    );

    const formattedBuses = buses.map((bus) => ({
      ...bus,
      id: Number(bus.id),
      total_seats: Number(bus.total_seats),
      price: Number(bus.price),
      booked_seats: Number(bus.booked_seats || 0),
    }));

    res.json({
      success: true,
      count: formattedBuses.length,
      buses: formattedBuses,
    });

  } catch (error) {
    console.error("SEARCH BUSES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to search buses",
      error: error.message,
    });
  }
});

/* =========================================================
   GET SINGLE BUS
   GET /api/buses/:id
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [buses] = await db.execute(
      `
      SELECT
        b.*,

        COALESCE(
          (
            SELECT SUM(bk.seats)
            FROM bookings bk
            WHERE bk.bus_id = b.id
            AND bk.booking_status <> 'Cancelled'
          ),
          0
        ) AS booked_seats

      FROM buses b
      WHERE b.id = ?
      `,
      [id]
    );

    if (buses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const bus = buses[0];

    res.json({
      success: true,
      bus: {
        ...bus,
        id: Number(bus.id),
        total_seats: Number(bus.total_seats),
        price: Number(bus.price),
        booked_seats: Number(bus.booked_seats || 0),
      },
    });

  } catch (error) {
    console.error("GET SINGLE BUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch bus",
      error: error.message,
    });
  }
});

/* =========================================================
   ADD BUS
   POST /api/buses
========================================================= */

router.post("/", async (req, res) => {
  try {
    const {
      bus_name,
      bus_number,
      operator,
      bus_type,
      from_city,
      to_city,
      departure_time,
      arrival_time,
      total_seats,
      price,
    } = req.body;

    console.log("=================================");
    console.log("ADD BUS REQUEST");
    console.log(req.body);
    console.log("=================================");

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (
      !bus_name ||
      !bus_number ||
      !operator ||
      !from_city ||
      !to_city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bus name, bus number, operator, from city and to city are required",
      });
    }

    const finalTotalSeats =
      Number(total_seats) || 40;

    const finalPrice =
      Number(price) || 0;

    if (finalTotalSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: "Total seats must be greater than 0",
      });
    }

    if (finalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    /* -----------------------------------------------------
       CHECK DUPLICATE BUS NUMBER
    ----------------------------------------------------- */

    const [existing] = await db.execute(
      `
      SELECT id
      FROM buses
      WHERE bus_number = ?
      `,
      [bus_number.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A bus with this bus number already exists",
      });
    }

    /* -----------------------------------------------------
       INSERT BUS
    ----------------------------------------------------- */

    const [result] = await db.execute(
      `
      INSERT INTO buses
      (
        bus_name,
        bus_number,
        operator,
        bus_type,
        from_city,
        to_city,
        departure_time,
        arrival_time,
        total_seats,
        price
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        bus_name.trim(),
        bus_number.trim(),
        operator.trim(),
        bus_type || null,
        from_city.trim(),
        to_city.trim(),
        departure_time || null,
        arrival_time || null,
        finalTotalSeats,
        finalPrice,
      ]
    );

    /* -----------------------------------------------------
       GET CREATED BUS
    ----------------------------------------------------- */

    const [newBus] = await db.execute(
      `
      SELECT *
      FROM buses
      WHERE id = ?
      `,
      [result.insertId]
    );

    console.log(
      "Bus created:",
      result.insertId
    );

    res.status(201).json({
      success: true,
      message: "Bus added successfully",
      bus: {
        ...newBus[0],
        id: Number(newBus[0].id),
        total_seats: Number(newBus[0].total_seats),
        price: Number(newBus[0].price),
        booked_seats: 0,
      },
    });

  } catch (error) {
    console.error("ADD BUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add bus",
      error: error.message,
    });
  }
});

/* =========================================================
   UPDATE BUS
   PUT /api/buses/:id
========================================================= */

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      bus_name,
      bus_number,
      operator,
      bus_type,
      from_city,
      to_city,
      departure_time,
      arrival_time,
      total_seats,
      price,
    } = req.body;

    /* -----------------------------------------------------
       CHECK BUS
    ----------------------------------------------------- */

    const [existingBus] = await db.execute(
      `
      SELECT *
      FROM buses
      WHERE id = ?
      `,
      [id]
    );

    if (existingBus.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (
      !bus_name ||
      !bus_number ||
      !operator ||
      !from_city ||
      !to_city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bus name, bus number, operator, from city and to city are required",
      });
    }

    const finalTotalSeats =
      Number(total_seats);

    const finalPrice =
      Number(price);

    if (
      !Number.isInteger(finalTotalSeats) ||
      finalTotalSeats <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Total seats must be a positive number",
      });
    }

    if (
      Number.isNaN(finalPrice) ||
      finalPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number",
      });
    }

    /* -----------------------------------------------------
       CHECK DUPLICATE BUS NUMBER
       Exclude current bus
    ----------------------------------------------------- */

    const [duplicate] = await db.execute(
      `
      SELECT id
      FROM buses
      WHERE bus_number = ?
      AND id <> ?
      `,
      [
        bus_number.trim(),
        id,
      ]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Another bus already uses this bus number",
      });
    }

    /* -----------------------------------------------------
       CHECK CURRENT BOOKINGS
    ----------------------------------------------------- */

    const [bookingResult] = await db.execute(
      `
      SELECT
        COALESCE(SUM(seats), 0) AS booked_seats
      FROM bookings
      WHERE bus_id = ?
      AND booking_status <> 'Cancelled'
      `,
      [id]
    );

    const bookedSeats = Number(
      bookingResult[0].booked_seats || 0
    );

    if (finalTotalSeats < bookedSeats) {
      return res.status(400).json({
        success: false,
        message:
          `Total seats cannot be less than currently booked seats (${bookedSeats})`,
      });
    }

    /* -----------------------------------------------------
       UPDATE
    ----------------------------------------------------- */

    await db.execute(
      `
      UPDATE buses
      SET
        bus_name = ?,
        bus_number = ?,
        operator = ?,
        bus_type = ?,
        from_city = ?,
        to_city = ?,
        departure_time = ?,
        arrival_time = ?,
        total_seats = ?,
        price = ?
      WHERE id = ?
      `,
      [
        bus_name.trim(),
        bus_number.trim(),
        operator.trim(),
        bus_type || null,
        from_city.trim(),
        to_city.trim(),
        departure_time || null,
        arrival_time || null,
        finalTotalSeats,
        finalPrice,
        id,
      ]
    );

    /* -----------------------------------------------------
       GET UPDATED BUS
    ----------------------------------------------------- */

    const [updatedBus] = await db.execute(
      `
      SELECT
        b.*,

        COALESCE(
          (
            SELECT SUM(bk.seats)
            FROM bookings bk
            WHERE bk.bus_id = b.id
            AND bk.booking_status <> 'Cancelled'
          ),
          0
        ) AS booked_seats

      FROM buses b
      WHERE b.id = ?
      `,
      [id]
    );

    const bus = updatedBus[0];

    res.json({
      success: true,
      message: "Bus updated successfully",
      bus: {
        ...bus,
        id: Number(bus.id),
        total_seats: Number(bus.total_seats),
        price: Number(bus.price),
        booked_seats: Number(bus.booked_seats || 0),
      },
    });

  } catch (error) {
    console.error("UPDATE BUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update bus",
      error: error.message,
    });
  }
});

/* =========================================================
   DELETE BUS
   DELETE /api/buses/:id
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    /* -----------------------------------------------------
       CHECK BUS
    ----------------------------------------------------- */

    const [existingBus] = await db.execute(
      `
      SELECT id, bus_name, bus_number
      FROM buses
      WHERE id = ?
      `,
      [id]
    );

    if (existingBus.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    /* -----------------------------------------------------
       CHECK BOOKINGS
    ----------------------------------------------------- */

    const [bookings] = await db.execute(
      `
      SELECT COUNT(*) AS count
      FROM bookings
      WHERE bus_id = ?
      `,
      [id]
    );

    const bookingCount = Number(
      bookings[0].count || 0
    );

    /*
      Do not delete a bus that has booking history.
      This prevents old booking records from becoming
      disconnected from their bus.
    */

    if (bookingCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This bus cannot be removed because booking history exists for it.",
        bookingCount,
      });
    }

    /* -----------------------------------------------------
       DELETE
    ----------------------------------------------------- */

    await db.execute(
      `
      DELETE FROM buses
      WHERE id = ?
      `,
      [id]
    );

    console.log(
      "Bus deleted:",
      id
    );

    res.json({
      success: true,
      message: "Bus removed successfully",
      busId: Number(id),
    });

  } catch (error) {
    console.error("DELETE BUS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove bus",
      error: error.message,
    });
  }
});

module.exports = router;