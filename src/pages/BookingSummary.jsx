import { useLocation, useNavigate } from "react-router-dom";
import "./BookingSummary.css";
import Footer from "../components/Footer";
function BookingSummary() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state || {};

  const {
    bus,
    passengers = [],
    from,
    to,
    formattedDate,
    travelDate,
    selectedSeats = [],
    totalAmount = 0,
  } = booking;

  const displayDate =
    formattedDate || formatDate(travelDate);

  if (!bus || passengers.length === 0) {
    return (
      <div className="summary-error-page">
        <div className="summary-error-card">
          <div className="error-icon">!</div>

          <h2>Booking information not found</h2>

          <p>
            We could not find your passenger or
            seat selection information.
          </p>

          <button onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const farePerPassenger = Number(bus.price || 699);

  const finalTotal =
    farePerPassenger * passengers.length;

  const finalSeats =
    passengers
      .map((passenger) => passenger.seat)
      .filter(Boolean);

  const handlePayment = () => {
    const paymentData = {
      ...booking,

      bus,

      from,
      to,

      travelDate,

      formattedDate: displayDate,

      passengers,

      passengerCount: passengers.length,

      selectedSeats:
        finalSeats.length > 0
          ? finalSeats
          : selectedSeats,

      totalAmount: finalTotal,

      bookingStatus: "Pending",

      paymentStatus: "Pending",
    };

    sessionStorage.setItem(
      "safeSeatBooking",
      JSON.stringify(paymentData)
    );

    navigate("/payment", {
      state: paymentData,
    });
  };

  return (
    <div className="booking-summary-page">

      {/* NAVBAR */}

      <header className="summary-navbar">

        <div
          className="summary-brand"
          onClick={() => navigate("/")}
        >
          <div className="summary-logo">
            S
          </div>

          <div>
            <strong>SafeSeat</strong>
            <span>Travel smarter</span>
          </div>
        </div>

        <div className="summary-route-top">
          <strong>
            {from} → {to}
          </strong>

          <span>
            {displayDate} · {passengers.length}{" "}
            {passengers.length === 1
              ? "Passenger"
              : "Passengers"}
          </span>
        </div>

        <button
          className="summary-back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

      </header>


      {/* MAIN */}

      <main className="summary-container">

        <div className="summary-heading">

          <div>
            <span>BOOKING SUMMARY</span>

            <h1>
              Review your journey
            </h1>

            <p>
              Check your journey, passengers,
              seats and fare before payment.
            </p>
          </div>

          <div className="summary-step">
            <span>STEP</span>
            <strong>4 / 5</strong>
          </div>

        </div>


        {/* JOURNEY */}

        <section className="journey-summary-card">

          <div className="journey-card-title">

            <span>YOUR JOURNEY</span>

            <strong>
              {bus.operator ||
                bus.bus_name ||
                "SafeSeat Express"}
            </strong>

          </div>

          <div className="journey-main">

            <div className="journey-location">

              <strong>
                {bus.departure ||
                  bus.departure_time ||
                  "20:30"}
              </strong>

              <span>{from}</span>

            </div>

            <div className="journey-middle">

              <span className="journey-line"></span>

              <span className="journey-arrow">
                →
              </span>

              <small>
                {bus.duration || "Travel"}
              </small>

            </div>

            <div className="journey-location">

              <strong>
                {bus.arrival ||
                  bus.arrival_time ||
                  "05:30"}
              </strong>

              <span>{to}</span>

            </div>

          </div>

          <div className="journey-meta">

            <div>
              <span>TRAVEL DATE</span>
              <strong>{displayDate}</strong>
            </div>

            <div>
              <span>BUS TYPE</span>
              <strong>
                {bus.busType ||
                  bus.bus_type ||
                  "AC Bus"}
              </strong>
            </div>

            <div>
              <span>PASSENGERS</span>
              <strong>
                {passengers.length}
              </strong>
            </div>

          </div>

        </section>


        <div className="summary-grid">

          {/* PASSENGERS */}

          <section className="passenger-review-card">

            <div className="review-card-header">

              <div>
                <span>TRAVELLER INFORMATION</span>
                <h2>Passengers</h2>
              </div>

              <button
                onClick={() => navigate(-1)}
              >
                Edit
              </button>

            </div>

            <div className="review-passengers">

              {passengers.map(
                (passenger, index) => (

                  <div
                    className="review-passenger"
                    key={
                      passenger.id ||
                      index
                    }
                  >

                    <div className="review-passenger-number">

                      P{passenger.id ||
                        index + 1}

                    </div>

                    <div className="review-passenger-info">

                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.age} years ·{" "}
                        {passenger.gender ===
                        "women"
                          ? "Woman"
                          : "Man"}
                      </span>

                    </div>

                    <div className="review-seat">

                      <span>SEAT</span>

                      <strong>
                        {passenger.seat ||
                          "--"}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>


          {/* FARE */}

          <aside className="final-fare-card">

            <span className="fare-label">
              FARE DETAILS
            </span>

            <h2>
              Payment summary
            </h2>

            <div className="fare-detail-row">

              <span>
                ₹
                {farePerPassenger.toLocaleString(
                  "en-IN"
                )} × {passengers.length}
              </span>

              <strong>
                ₹
                {finalTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="fare-detail-row">

              <span>Bus fare</span>

              <strong>
                ₹
                {finalTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="fare-divider"></div>

            <div className="final-total">

              <div>
                <span>Total payable</span>

                <small>
                  Inclusive booking fare
                </small>
              </div>

              <strong>
                ₹
                {finalTotal.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <button
              className="payment-button"
              onClick={handlePayment}
            >
              Continue to payment
              <span>→</span>
            </button>

            <div className="secure-box">

              <span>🔒</span>

              <p>
                Your booking details are
                securely stored for this
                booking.
              </p>

            </div>

          </aside>

        </div>


        {/* SELECTED SEATS */}

        <section className="selected-seat-review">

          <div>

            <span>SEAT SELECTION</span>

            <h2>
              Your selected seats
            </h2>

          </div>

          <div className="seat-review-list">

            {(finalSeats.length > 0
              ? finalSeats
              : selectedSeats
            ).map(
              (seat, index) => (

                <div
                  className="seat-review-tag"
                  key={index}
                >

                  <strong>
                    P{index + 1}
                  </strong>

                  <span>
                    Seat {seat}
                  </span>

                </div>

              )
            )}

          </div>

        </section>

      </main>

    </div>
  );
}


function formatDate(dateString) {

  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}
<Footer />
export default BookingSummary;