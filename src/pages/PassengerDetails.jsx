import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PassengerDetails.css";
import Footer from "../components/Footer";
function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // GET BOOKING DATA
  // =====================================================

  let bookingData = location.state || {};

  // If page was refreshed, recover from sessionStorage
  if (!bookingData.bus) {
    try {
      bookingData = JSON.parse(
        sessionStorage.getItem("safeSeatBooking") || "{}"
      );
    } catch (error) {
      bookingData = {};
    }
  }

  const bus = bookingData.bus || null;

  const from = bookingData.from || "Hyderabad";
  const to = bookingData.to || "Bangalore";

  const travelDate =
    bookingData.travelDate ||
    bookingData.date ||
    "";

  const formattedDate =
    bookingData.formattedDate ||
    formatDate(travelDate);

  const selectedSeats =
    bookingData.selectedSeats || [];

  const passengerCount =
    Number(
      bookingData.passengerCount ||
        bookingData.passengers?.length ||
        selectedSeats.length ||
        1
    );

  // =====================================================
  // PASSENGER FORM
  // =====================================================

  const [passengers, setPassengers] =
    useState(() => {
      const existing =
        bookingData.passengers || [];

      return Array.from(
        {
          length: passengerCount,
        },
        (_, index) => {
          const oldPassenger =
            existing[index] || {};

          return {
            id: index + 1,

            name:
              oldPassenger.name || "",

            age:
              oldPassenger.age || "",

            gender:
              oldPassenger.gender || "women",

            seat:
              oldPassenger.seat ||
              selectedSeats[index] ||
              null,
          };
        }
      );
    });

  const [errors, setErrors] =
    useState({});

  // =====================================================
  // IF NO BUS DATA
  // =====================================================

  useEffect(() => {
    if (!bus) {
      alert(
        "Booking information is missing. Please select a bus again."
      );

      navigate("/");
    }
  }, [bus, navigate]);

  // =====================================================
  // UPDATE PASSENGER
  // =====================================================

  const updatePassenger = (
    passengerId,
    field,
    value
  ) => {
    setPassengers(
      (currentPassengers) =>
        currentPassengers.map(
          (passenger) =>
            passenger.id === passengerId
              ? {
                  ...passenger,
                  [field]: value,
                }
              : passenger
        )
    );

    // Remove field error while typing
    setErrors((currentErrors) => {
      const updated = {
        ...currentErrors,
      };

      delete updated[
        `${passengerId}-${field}`
      ];

      return updated;
    });
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validatePassengers = () => {
    const newErrors = {};

    passengers.forEach(
      (passenger) => {
        if (
          !passenger.name.trim()
        ) {
          newErrors[
            `${passenger.id}-name`
          ] = "Enter passenger name";
        }

        if (!passenger.age) {
          newErrors[
            `${passenger.id}-age`
          ] = "Enter age";
        } else if (
          Number(passenger.age) < 1 ||
          Number(passenger.age) > 120
        ) {
          newErrors[
            `${passenger.id}-age`
          ] = "Enter a valid age";
        }

        if (!passenger.gender) {
          newErrors[
            `${passenger.id}-gender`
          ] = "Select gender";
        }

        if (!passenger.seat) {
          newErrors[
            `${passenger.id}-seat`
          ] = "Seat not selected";
        }
      }
    );

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =====================================================
  // CONTINUE TO PAYMENT
  // =====================================================

  const handleContinue = () => {
  if (!validatePassengers()) {
    alert("Please complete all passenger details.");
    return;
  }

  const updatedBookingData = {
    ...bookingData,

    passengers,

    passengerCount: passengers.length,

    selectedSeats: passengers.map(
      (passenger) => Number(passenger.seat)
    ),

    totalAmount:
      Number(bus.price || 0) *
      passengers.length,
  };

  console.log(
    "================================="
  );
  console.log("PASSENGER DETAILS COMPLETE");
  console.log(
    "Booking data:",
    updatedBookingData
  );
  console.log(
    "================================="
  );

  sessionStorage.setItem(
    "safeSeatBooking",
    JSON.stringify(updatedBookingData)
  );

  navigate("/payment", {
    state: updatedBookingData,
  });
};

  // =====================================================
  // GO BACK
  // =====================================================

  const handleBack = () => {
    navigate(
      `/seats/${bus?.id || ""}`,
      {
        state: bookingData,
      }
    );
  };

  if (!bus) {
    return null;
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="passenger-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="passenger-navbar">

        <div
          className="passenger-brand"
          onClick={() =>
            navigate("/")
          }
        >
          <div className="passenger-logo">
            S
          </div>

          <div>
            <strong>
              SafeSeat
            </strong>

            <span>
              Smart travel booking
            </span>
          </div>
        </div>

        <div className="passenger-route">

          <strong>
            {from} → {to}
          </strong>

          <span>
            {formattedDate} ·{" "}
            {passengers.length}{" "}
            Passenger
            {passengers.length > 1
              ? "s"
              : ""}
          </span>

        </div>

        <button
          type="button"
          className="passenger-back-button"
          onClick={handleBack}
        >
          ← Back to seats
        </button>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="passenger-container">

        {/* PAGE HEADING */}

        <div className="passenger-heading">

          <div>

            <span>
              PASSENGER DETAILS
            </span>

            <h1>
              Who is travelling?
            </h1>

            <p>
              Enter the details of each
              passenger travelling on this
              journey.
            </p>

          </div>

          <div className="journey-summary">

            <strong>
              {bus.operator}
            </strong>

            <span>
              {bus.busType}
            </span>

            <span>
              {bus.departure} →{" "}
              {bus.arrival}
            </span>

          </div>

        </div>

        {/* =================================================
            PROGRESS
        ================================================= */}

        <div className="booking-progress">

          <div className="progress-step completed">
            <span>✓</span>
            <strong>Seats</strong>
          </div>

          <div className="progress-line active"></div>

          <div className="progress-step current">
            <span>2</span>
            <strong>Passengers</strong>
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>3</span>
            <strong>Payment</strong>
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>4</span>
            <strong>Confirmation</strong>
          </div>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="passenger-layout">

          {/* =================================================
              PASSENGER FORMS
          ================================================= */}

          <section className="passenger-forms">

            {passengers.map(
              (passenger) => (
                <article
                  className="passenger-form-card"
                  key={passenger.id}
                >

                  {/* CARD HEADER */}

                  <div className="passenger-card-header">

                    <div className="passenger-card-title">

                      <div className="passenger-avatar">
                        P{passenger.id}
                      </div>

                      <div>
                        <strong>
                          Passenger{" "}
                          {passenger.id}
                        </strong>

                        <span>
                          Seat{" "}
                          {passenger.seat ||
                            "--"}
                        </span>
                      </div>

                    </div>

                    <div className="seat-badge">
                      Seat{" "}
                      {passenger.seat ||
                        "--"}
                    </div>

                  </div>

                  {/* FORM */}

                  <div className="passenger-form-grid">

                    {/* NAME */}

                    <div className="form-field full-width">

                      <label>
                        Full name
                      </label>

                      <input
                        type="text"
                        placeholder="Enter passenger name"
                        value={
                          passenger.name
                        }
                        onChange={(event) =>
                          updatePassenger(
                            passenger.id,
                            "name",
                            event.target.value
                          )
                        }
                      />

                      {errors[
                        `${passenger.id}-name`
                      ] && (
                        <small className="field-error">
                          {
                            errors[
                              `${passenger.id}-name`
                            ]
                          }
                        </small>
                      )}

                    </div>

                    {/* AGE */}

                    <div className="form-field">

                      <label>
                        Age
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Age"
                        value={
                          passenger.age
                        }
                        onChange={(event) =>
                          updatePassenger(
                            passenger.id,
                            "age",
                            event.target.value
                          )
                        }
                      />

                      {errors[
                        `${passenger.id}-age`
                      ] && (
                        <small className="field-error">
                          {
                            errors[
                              `${passenger.id}-age`
                            ]
                          }
                        </small>
                      )}

                    </div>

                    {/* GENDER */}

                    <div className="form-field">

                      <label>
                        Gender
                      </label>

                      <select
                        value={
                          passenger.gender
                        }
                        onChange={(event) =>
                          updatePassenger(
                            passenger.id,
                            "gender",
                            event.target.value
                          )
                        }
                      >
                        <option value="women">
                          Women
                        </option>

                        <option value="men">
                          Men
                        </option>
                      </select>

                      {errors[
                        `${passenger.id}-gender`
                      ] && (
                        <small className="field-error">
                          {
                            errors[
                              `${passenger.id}-gender`
                            ]
                          }
                        </small>
                      )}

                    </div>

                  </div>

                </article>
              )
            )}

          </section>

          {/* =================================================
              BOOKING SUMMARY
          ================================================= */}

          <aside className="passenger-summary-card">

            <div className="summary-label">
              BOOKING SUMMARY
            </div>

            <h2>
              Your journey
            </h2>

            {/* BUS */}

            <div className="summary-bus">

              <div className="summary-bus-logo">
                {bus.operator?.charAt(0)}
              </div>

              <div>
                <strong>
                  {bus.operator}
                </strong>

                <span>
                  {bus.busType}
                </span>
              </div>

            </div>

            {/* ROUTE */}

            <div className="passenger-summary-route">

              <div>
                <strong>
                  {bus.departure}
                </strong>

                <span>
                  {from}
                </span>
              </div>

              <div className="route-arrow">
                →
              </div>

              <div>
                <strong>
                  {bus.arrival}
                </strong>

                <span>
                  {to}
                </span>
              </div>

            </div>

            {/* DATE */}

            <div className="summary-detail-row">

              <span>
                Journey date
              </span>

              <strong>
                {formattedDate}
              </strong>

            </div>

            {/* SEATS */}

            <div className="summary-detail-row">

              <span>
                Selected seats
              </span>

              <strong>
                {passengers
                  .map(
                    (passenger) =>
                      passenger.seat
                  )
                  .filter(Boolean)
                  .join(", ") ||
                  "--"}
              </strong>

            </div>

            {/* PASSENGERS */}

            <div className="summary-detail-row">

              <span>
                Passengers
              </span>

              <strong>
                {passengers.length}
              </strong>

            </div>

            <div className="summary-divider"></div>

            {/* FARE */}

            <div className="fare-row">

              <span>
                ₹{bus.price || 0} ×{" "}
                {passengers.length}
              </span>

              <strong>
                ₹
                {(
                  Number(
                    bus.price || 0
                  ) *
                  passengers.length
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <div className="total-fare">

              <span>
                Total fare
              </span>

              <strong>
                ₹
                {(
                  Number(
                    bus.price || 0
                  ) *
                  passengers.length
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* CONTINUE */}

            <button
              type="button"
              className="passenger-continue-button"
              onClick={
                handleContinue
              }
            >
              Continue to payment

              <span>
                →
              </span>
            </button>

            <p className="secure-note">
              🔒 Your passenger details are
              securely handled by SafeSeat.
            </p>

          </aside>

        </div>

      </main>
    </div>
  );
}

// =====================================================
// DATE FORMAT
// =====================================================

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
export default PassengerDetails;