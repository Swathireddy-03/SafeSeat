import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrackTicket.css";
import Footer from "../components/Footer";
const API_BASE_URL = "http://localhost:5000";

function TrackTicket() {
  const navigate = useNavigate();

  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // TRACK BOOKING
  // =====================================================

  const handleTrack = async () => {
    setError("");
    setBooking(null);

    const enteredId =
      bookingId.trim();

    if (!enteredId) {
      setError(
        "Please enter your Booking ID."
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // BACKEND BOOKING API
      // =================================================

      const response =
        await fetch(
          `${API_BASE_URL}/api/bookings/${enteredId}`
        );

      const result =
        await response.json();

      console.log(
        "Track ticket response:",
        result
      );

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Booking not found. Please check your Booking ID."
        );
      }

      // =================================================
      // GET ACTUAL BOOKING
      // =================================================

      const data =
        result.booking ||
        result.data ||
        result;

      const seats = data.seats
        ? data.seats
            .toString()
            .split(",")
            .map((seat) =>
              seat.trim()
            )
            .filter(Boolean)
        : [];

      const transportType =
        (
          data.transport_type ||
          data.transportType ||
          data.transport ||
          data.type ||
          data.mode ||
          "bus"
        )
          .toString()
          .toLowerCase();

      // =================================================
      // FORMAT BOOKING
      // =================================================

      const formattedBooking = {
        ...data,

        bookingId:
          data.booking_id ||
          data.bookingId ||
          enteredId,

        bookingStatus:
          data.booking_status ||
          data.bookingStatus ||
          "Confirmed",

        transportType:
          transportType === "train"
            ? "Train"
            : "Bus",

        from:
          data.from_city ||
          data.from ||
          data.fromLocation ||
          "Not available",

        to:
          data.to_city ||
          data.to ||
          data.toLocation ||
          "Not available",

        date:
          data.journey_date ||
          data.journeyDate ||
          data.date ||
          "",

        journeyDate:
          data.journey_date ||
          data.journeyDate ||
          data.date ||
          "",

        departure:
          data.departure_time ||
          data.departure ||
          data.departureTime ||
          "",

        arrival:
          data.arrival_time ||
          data.arrival ||
          data.arrivalTime ||
          "",

        seats,

        passengerCount:
          Number(
            data.passenger_count ||
            data.passengerCount ||
            0
          ) || seats.length,

        paymentMethod:
          data.payment_method ||
          data.paymentMethod ||
          "UPI",

        paymentStatus:
          data.payment_status ||
          data.paymentStatus ||
          "Paid",

        amount:
          Number(
            data.amount ||
            data.total_amount ||
            data.totalAmount ||
            0
          ),

        totalAmount:
          Number(
            data.amount ||
            data.total_amount ||
            data.totalAmount ||
            0
          ),

        bus: {
          name:
            data.bus_name ||
            data.operator ||
            "SafeSeat Bus",

          operator:
            data.operator ||
            data.bus_name ||
            "SafeSeat Express",

          busType:
            data.bus_type ||
            "AC Bus",

          busNumber:
            data.bus_number ||
            "",
        },

        train: {
          name:
            data.train_name ||
            data.operator ||
            "SafeSeat Railways",

          operator:
            data.operator ||
            data.train_name ||
            "SafeSeat Railways",

          trainNumber:
            data.train_number ||
            "",

          trainType:
            data.train_type ||
            data.train_class ||
            "Express Train",

          class:
            data.train_class ||
            data.train_type ||
            "General",
        },

        passengers:
          Array.isArray(
            data.passengers
          )
            ? data.passengers
            : [
                {
                  id: 1,

                  name:
                    data.passenger_name ||
                    "Passenger",

                  age:
                    data.passenger_age ||
                    "--",

                  gender:
                    data.passenger_gender ||
                    "women",

                  seat:
                    seats[0] ||
                    "--",
                },
              ],
      };

      setBooking(
        formattedBooking
      );
    } catch (err) {
      console.error(
        "Track ticket error:",
        err
      );

      setError(
        err.message ||
          "Booking not found. Please check your Booking ID."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
      const [year, month, day] =
        value.split("-");

      const date =
        new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setBookingId("");
    setBooking(null);
    setError("");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="track-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="track-navbar">

        <div
          className="track-logo"
          onClick={() =>
            navigate("/")
          }
        >

          <div className="track-logo-box">
            S
          </div>

          <div className="track-logo-text">

            <strong>
              SafeSeat
            </strong>

            <span>
              SMART TRAVEL
            </span>

          </div>

        </div>

        <button
          className="track-back-btn"
          onClick={() =>
            navigate("/my-trips")
          }
        >
          ← My Trips
        </button>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="track-container">

        {/* HEADER */}

        <section className="track-header">

          <span className="track-label">
            TICKET MANAGEMENT
          </span>

          <h1>
            Track Your{" "}
            <span>Ticket</span>
          </h1>

          <p>
            Enter your booking ID to view
            your journey details and
            current booking status.
          </p>

        </section>

        {/* =================================================
            SEARCH
        ================================================= */}

        <section className="track-search-card">

          <div className="track-search-icon">
            🎫
          </div>

          <div className="track-search-content">

            <label>
              ENTER BOOKING ID
            </label>

            <div className="track-search-row">

              <input
                type="text"
                placeholder="Example: BM123456"
                value={bookingId}
                onChange={(event) =>
                  setBookingId(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    handleTrack();
                  }
                }}
              />

              <button
                onClick={handleTrack}
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "Track Ticket"}

                {!loading && (
                  <span>→</span>
                )}
              </button>

            </div>

            {error && (

              <p className="track-error">
                ⚠ {error}
              </p>

            )}

          </div>

        </section>

        {/* =================================================
            BOOKING DETAILS
        ================================================= */}

        {booking && (

          <section className="ticket-details-card">

            {/* HEADER */}

            <div className="ticket-details-header">

              <div>

                <span>
                  BOOKING CONFIRMATION
                </span>

                <h2>
                  {booking.bookingId}
                </h2>

              </div>

              <div
                className={`ticket-status ${
                  booking.bookingStatus
                    ?.toLowerCase() ===
                  "cancelled"
                    ? "cancelled"
                    : "confirmed"
                }`}
              >
                {booking.bookingStatus ||
                  "Confirmed"}
              </div>

            </div>

            {/* =================================================
                TRANSPORT
            ================================================= */}

            <div className="ticket-transport-info">

              <div className="transport-icon">

                {booking.transportType ===
                "Train"
                  ? "🚆"
                  : "🚌"}

              </div>

              <div>

                <span>
                  {booking.transportType ===
                  "Train"
                    ? "TRAIN JOURNEY"
                    : "BUS JOURNEY"}
                </span>

                <strong>

                  {booking.transportType ===
                  "Train"
                    ? booking.train?.name
                    : booking.bus?.operator}

                </strong>

              </div>

            </div>

            {/* =================================================
                ROUTE
            ================================================= */}

            <div className="ticket-route">

              <div className="ticket-location">

                <small>
                  FROM
                </small>

                <strong>
                  {booking.from}
                </strong>

                <span>
                  {booking.departure ||
                    "--:--"}
                </span>

              </div>

              <div className="ticket-route-line">

                <span>●</span>

                <i></i>

                <span>●</span>

              </div>

              <div className="ticket-location destination">

                <small>
                  TO
                </small>

                <strong>
                  {booking.to}
                </strong>

                <span>
                  {booking.arrival ||
                    "--:--"}
                </span>

              </div>

            </div>

            {/* =================================================
                JOURNEY DETAILS
            ================================================= */}

            <div className="ticket-info-grid">

              <div>

                <span>
                  JOURNEY DATE
                </span>

                <strong>
                  {formatDate(
                    booking.journeyDate
                  )}
                </strong>

              </div>

              <div>

                <span>
                  JOURNEY TIME
                </span>

                <strong>
                  {booking.departure ||
                    "--:--"}
                  {" - "}
                  {booking.arrival ||
                    "--:--"}
                </strong>

              </div>

              <div>

                <span>
                  TRANSPORT
                </span>

                <strong>
                  {booking.transportType}
                </strong>

              </div>

              <div>

                <span>
                  SEATS
                </span>

                <strong>
                  {booking.seats.length
                    ? booking.seats.join(
                        ", "
                      )
                    : "Not assigned"}
                </strong>

              </div>

              <div>

                <span>
                  PASSENGERS
                </span>

                <strong>
                  {booking.passengerCount ||
                    1}
                </strong>

              </div>

              <div>

                <span>
                  PAYMENT
                </span>

                <strong>
                  {booking.paymentMethod ||
                    "UPI"}
                </strong>

              </div>

            </div>

            {/* =================================================
                PASSENGERS
            ================================================= */}

            {booking.passengers?.length >
              0 && (

              <div className="track-passengers">

                <h3>
                  Passenger Details
                </h3>

                {booking.passengers.map(
                  (
                    passenger,
                    index
                  ) => (

                    <div
                      className="track-passenger"
                      key={
                        passenger.id ||
                        index
                      }
                    >

                      <div className="passenger-number">
                        {index + 1}
                      </div>

                      <div className="passenger-info">

                        <strong>
                          {passenger.name ||
                            `Passenger ${
                              index + 1
                            }`}
                        </strong>

                        <span>
                          Age:{" "}
                          {passenger.age ||
                            "--"}

                          {passenger.gender &&
                            ` · ${
                              passenger.gender
                            }`}
                        </span>

                      </div>

                      <strong>
                        Seat{" "}
                        {passenger.seat ||
                          "N/A"}
                      </strong>

                    </div>

                  )
                )}

              </div>

            )}

            {/* =================================================
                AMOUNT
            ================================================= */}

            <div className="ticket-total">

              <div>

                <span>
                  TOTAL AMOUNT
                </span>

                <strong>
                  ₹
                  {Number(
                    booking.totalAmount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div
                className={
                  booking.paymentStatus
                    ?.toLowerCase() ===
                  "paid"
                    ? "payment-success"
                    : "payment-pending"
                }
              >

                {booking.paymentStatus
                  ?.toLowerCase() ===
                "paid"
                  ? "✓ Payment Successful"
                  : `● ${
                      booking.paymentStatus ||
                      "Pending"
                    }`}

              </div>

            </div>

            {/* =================================================
                STATUS
            ================================================= */}

            <div className="ticket-status-section">

              <div>

                <span>
                  TICKET STATUS
                </span>

                <strong>
                  {booking.bookingStatus ||
                    "Confirmed"}
                </strong>

              </div>

              <div>

                <span>
                  BOOKING ID
                </span>

                <strong>
                  {booking.bookingId}
                </strong>

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="ticket-actions">

              <button
                className="ticket-home-btn"
                onClick={
                  handleClear
                }
              >
                Track Another Ticket
              </button>

              <button
                className="ticket-trips-btn"
                onClick={() =>
                  navigate(
                    "/my-trips"
                  )
                }
              >
                View My Trips →
              </button>

            </div>

          </section>

        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!booking &&
          !error &&
          !loading && (

            <section className="track-empty">

              <div className="track-empty-icon">
                🔎
              </div>

              <h2>
                Track your journey
                with ease
              </h2>

              <p>
                Enter your booking ID
                above to see your
                journey, passenger,
                payment and ticket
                status.
              </p>

            </section>

          )}

      </main>
<Footer />
    </div>
  );
}

export default TrackTicket;