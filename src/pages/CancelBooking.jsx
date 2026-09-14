import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CancelBooking.css";

const API_BASE_URL = "https://safeseat.onrender.com";
function CancelBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     BOOKING ID FROM NAVIGATION
  ====================================================== */

  useEffect(() => {
    const incomingBookingId =
      location.state?.bookingId;

    if (incomingBookingId) {
      setBookingId(incomingBookingId);

      findBooking(incomingBookingId);
    }
  }, [location.state]);


  /* =====================================================
     FIND BOOKING
  ====================================================== */

  const findBooking = async (
    idFromNavigation = null
  ) => {
    setError("");
    setBooking(null);
    setCancelled(false);

    const id =
      idFromNavigation ||
      bookingId.trim();

    if (!id) {
      setError(
        "Please enter your Booking ID."
      );
      return;
    }

    try {
      setLoading(true);

      const userId =
        localStorage.getItem(
          "safeSeatUserId"
        ) || 1;

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/user/${userId}`
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to load bookings."
        );
      }

      const bookings =
        Array.isArray(result.bookings)
          ? result.bookings
          : [];

      const foundBooking =
        bookings.find(
          (item) =>
            String(
              item.booking_id ||
              item.bookingId ||
              ""
            ).toLowerCase() ===
            String(id).trim().toLowerCase()
        );

      if (!foundBooking) {
        setError(
          "Booking not found. Please check your Booking ID."
        );
        return;
      }

      const status =
        foundBooking.booking_status ||
        foundBooking.bookingStatus ||
        "Confirmed";

      if (
        status.toLowerCase() ===
        "cancelled"
      ) {
        setError(
          "This booking has already been cancelled."
        );
        return;
      }

      const seats = foundBooking.seats
        ? String(foundBooking.seats)
            .split(",")
            .map((seat) =>
              seat.trim()
            )
            .filter(Boolean)
        : [];

      setBooking({
        ...foundBooking,

        bookingId:
          foundBooking.booking_id ||
          foundBooking.bookingId,

        from:
          foundBooking.from_city ||
          foundBooking.from,

        to:
          foundBooking.to_city ||
          foundBooking.to,

        journeyDate:
          foundBooking.journey_date ||
          foundBooking.journeyDate,

        transportType:
          foundBooking.transport_type ||
          foundBooking.transportType ||
          "Bus",

        passengers:
          foundBooking.passenger_count ||
          foundBooking.passengers ||
          seats.length ||
          1,

        amount:
          foundBooking.amount ||
          foundBooking.totalAmount ||
          0,

        seats,
        bookingStatus: status,
      });

    } catch (error) {
      console.error(
        "Unable to find booking:",
        error
      );

      setError(
        error.message ||
          "Unable to find booking."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     CANCEL
  ====================================================== */

  const handleCancel = async () => {
    if (!booking?.bookingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/${booking.bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to cancel booking."
        );
      }

      setBooking((previous) => ({
        ...previous,
        bookingStatus: "Cancelled",
      }));

      setCancelled(true);

    } catch (error) {
      console.error(
        "Cancellation failed:",
        error
      );

      setError(
        error.message ||
          "Unable to cancel booking."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="cancel-page">

      {/* NAVBAR */}

      <nav className="cancel-navbar">

        <div
          className="cancel-logo"
          onClick={() => navigate("/")}
        >

          <div className="cancel-logo-box">
            S
          </div>

          <div className="cancel-logo-text">

            <strong>
              SafeSeat
            </strong>

            <span>
              SMART TRAVEL
            </span>

          </div>

        </div>

        <button
          className="cancel-back-btn"
          onClick={() =>
            navigate("/my-trips")
          }
        >
          ← My Trips
        </button>

      </nav>


      <main className="cancel-container">

        {/* HEADER */}

        <section className="cancel-header">

          <span>
            TICKET MANAGEMENT
          </span>

          <h1>
            Cancel Your <strong>Booking</strong>
          </h1>

          <p>
            Enter your booking ID to find
            your reservation and cancel
            your journey.
          </p>

        </section>


        {/* SEARCH */}

        <section className="cancel-search-card">

          <div className="cancel-search-icon">
            ✕
          </div>

          <div className="cancel-search-content">

            <label>
              ENTER BOOKING ID
            </label>

            <div className="cancel-search-row">

              <input
                type="text"
                placeholder="Example: BM123456"
                value={bookingId}
                onChange={(e) =>
                  setBookingId(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    findBooking();
                  }
                }}
              />

              <button
                onClick={() =>
                  findBooking()
                }
                disabled={loading}
              >
                {loading
                  ? "Finding..."
                  : "Find Booking →"}
              </button>

            </div>

            {error && (
              <p className="cancel-error">
                ⚠ {error}
              </p>
            )}

          </div>

        </section>


        {/* BOOKING */}

        {booking && !cancelled && (

          <section className="cancel-booking-card">

            <div className="cancel-booking-header">

              <div>

                <span>
                  BOOKING FOUND
                </span>

                <h2>
                  {booking.bookingId}
                </h2>

              </div>

              <div className="active-status">
                ● Confirmed
              </div>

            </div>


            <div className="cancel-route">

              <div>

                <small>
                  FROM
                </small>

                <strong>
                  {booking.from ||
                    "Not available"}
                </strong>

              </div>

              <div className="cancel-route-arrow">
                →
              </div>

              <div className="cancel-route-destination">

                <small>
                  TO
                </small>

                <strong>
                  {booking.to ||
                    "Not available"}
                </strong>

              </div>

            </div>


            <div className="cancel-info-grid">

              <div>

                <span>
                  JOURNEY DATE
                </span>

                <strong>
                  {booking.journeyDate ||
                    booking.date ||
                    "Not available"}
                </strong>

              </div>


              <div>

                <span>
                  TRANSPORT
                </span>

                <strong>
                  {booking.transportType ||
                    "Bus"}
                </strong>

              </div>


              <div>

                <span>
                  PASSENGERS
                </span>

                <strong>
                  {booking.passengers ||
                    1}
                </strong>

              </div>


              <div>

                <span>
                  AMOUNT PAID
                </span>

                <strong>
                  ₹
                  {Number(
                    booking.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>


            <div className="cancel-warning">

              <div className="warning-icon">
                !
              </div>

              <div>

                <strong>
                  Are you sure you want to cancel?
                </strong>

                <p>
                  This action will cancel your
                  booking. Please make sure you
                  want to continue.
                </p>

              </div>

            </div>


            <div className="cancel-actions">

              <button
                className="keep-booking-btn"
                onClick={() =>
                  navigate("/my-trips")
                }
              >
                Keep Booking
              </button>

              <button
                className="confirm-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>

            </div>

          </section>

        )}


        {/* SUCCESS */}

        {cancelled && (

          <section className="cancel-success-card">

            <div className="success-icon">
              ✓
            </div>

            <span>
              BOOKING CANCELLED
            </span>

            <h2>
              Your booking has been cancelled
            </h2>

            <p>
              Booking ID
            </p>

            <strong className="success-booking-id">
              {booking?.bookingId}
            </strong>

            <div className="cancelled-status">
              ● Cancelled
            </div>

            <div className="success-actions">

              <button
                onClick={() =>
                  navigate("/my-trips")
                }
              >
                View My Trips
              </button>

              <button
                onClick={() =>
                  navigate("/")
                }
              >
                Search Another Journey
              </button>

            </div>

          </section>

        )}


        {!booking &&
          !cancelled &&
          !error && (

            <section className="cancel-empty">

              <div>
                🎫
              </div>

              <h2>
                Need to cancel a booking?
              </h2>

              <p>
                Enter your booking ID above
                to find and manage your
                reservation.
              </p>

            </section>

          )}

      </main>

    </div>
  );
}

export default CancelBooking;