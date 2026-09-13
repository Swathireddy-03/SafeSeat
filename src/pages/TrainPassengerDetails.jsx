import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TrainPassengerDetails.css";
import Footer from "../components/Footer";
function PassengerDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking =
    location.state ||
    JSON.parse(
      sessionStorage.getItem("safeSeatBooking") || "null"
    );

  if (!booking) {
    return (
      <div className="passenger-details-error">
        <div className="passenger-details-error-card">
          <div className="error-icon">!</div>

          <h2>Booking details not found</h2>

          <p>
            Please select your train and seats again.
          </p>

          <button
            type="button"
            onClick={() => navigate("/train-results")}
          >
            Back to Trains
          </button>
        </div>
      </div>
    );
  }

  /*
  =====================================================
  GET SELECTED SEATS
  =====================================================
  */

  const selectedSeats =
    Array.isArray(booking.selectedSeats)
      ? booking.selectedSeats
      : Array.isArray(booking.seats)
      ? booking.seats
      : Array.isArray(booking.passengers)
      ? booking.passengers
          .map((passenger) => passenger.seat)
          .filter(Boolean)
      : [];

  /*
  =====================================================
  INITIAL PASSENGERS

  IMPORTANT:
  NAME IS EMPTY.
  USER MUST ENTER IT MANUALLY.
  =====================================================
  */

  const initialPassengers =
    selectedSeats.length > 0
      ? selectedSeats.map((seat, index) => {
          const oldPassenger =
            Array.isArray(booking.passengers)
              ? booking.passengers[index]
              : null;

          return {
            id: index + 1,
            seat: seat,
            name: "",
            age: "",
            gender: "",
            preference:
              oldPassenger?.preference || "",
          };
        })
      : Array.isArray(booking.passengers)
      ? booking.passengers.map((passenger, index) => ({
          id: passenger.id || index + 1,
          seat: passenger.seat || "",
          name: "",
          age: "",
          gender: "",
          preference: passenger.preference || "",
        }))
      : [];

  const [passengers, setPassengers] =
    useState(initialPassengers);

  const [error, setError] = useState("");

  /*
  =====================================================
  UPDATE PASSENGER
  =====================================================
  */

  const handlePassengerChange = (
    index,
    field,
    value
  ) => {
    setPassengers((previousPassengers) =>
      previousPassengers.map(
        (passenger, passengerIndex) =>
          passengerIndex === index
            ? {
                ...passenger,
                [field]: value,
              }
            : passenger
      )
    );

    setError("");
  };

  /*
  =====================================================
  CONTINUE
  =====================================================
  */

  const handleContinue = () => {
    setError("");

    /*
    VALIDATE EVERY PASSENGER
    */

    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];

      if (!passenger.name.trim()) {
        setError(
          `Please enter the name of Passenger ${
            i + 1
          }.`
        );
        return;
      }

      if (!passenger.age) {
        setError(
          `Please enter the age of Passenger ${
            i + 1
          }.`
        );
        return;
      }

      if (
        Number(passenger.age) < 1 ||
        Number(passenger.age) > 120
      ) {
        setError(
          `Please enter a valid age for Passenger ${
            i + 1
          }.`
        );
        return;
      }

      if (!passenger.gender) {
        setError(
          `Please select gender for Passenger ${
            i + 1
          }.`
        );
        return;
      }
    }

    /*
    CREATE UPDATED BOOKING
    */

    const updatedBooking = {
      ...booking,

      mode: "train",
      transportMode: "train",
      type: "train",

      passengers: passengers,

      passengerCount:
        passengers.length,

      selectedSeats:
        passengers
          .map(
            (passenger) =>
              passenger.seat
          )
          .filter(Boolean),
    };

    /*
    SAVE TEMPORARY BOOKING
    */

    sessionStorage.setItem(
      "safeSeatBooking",
      JSON.stringify(updatedBooking)
    );

    /*
    GO TO PAYMENT
    */

    navigate("/train-payment", {
      state: updatedBooking,
    });
  };

  /*
  =====================================================
  BACK
  =====================================================
  */

  const handleBack = () => {
    navigate(
      "/train-seats/" +
        (booking.train?.id || ""),
      {
        state: booking,
      }
    );
  };

  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (
    <div className="passenger-details-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="passenger-details-navbar">

        <div
          className="passenger-details-brand"
          onClick={() => navigate("/")}
        >
          <div className="passenger-details-logo">
            S
          </div>

          <div>
            <strong>SafeSeat</strong>

            <span>
              Travel smarter
            </span>
          </div>
        </div>

        <div className="passenger-details-route">

          <strong>
            {booking.from || "Origin"} →{" "}
            {booking.to || "Destination"}
          </strong>

          <span>
            {booking.formattedDate ||
              booking.travelDate ||
              booking.date ||
              "Travel date"}{" "}
            ·{" "}
            {passengers.length}{" "}
            Passenger
            {passengers.length > 1
              ? "s"
              : ""}
          </span>

        </div>

        <button
          type="button"
          className="passenger-details-back"
          onClick={handleBack}
        >
          ← Back
        </button>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="passenger-details-container">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="passenger-details-heading">

          <div>

            <span>
              PASSENGER DETAILS
            </span>

            <h1>
              Enter passenger details
            </h1>

            <p>
              Please enter the details of every
              passenger travelling on this train.
            </p>

          </div>

          <div className="details-booking-summary">

            <strong>
              {booking.train?.name ||
                "SafeSeat Express"}
            </strong>

            <span>
              Train{" "}
              {booking.train?.number ||
                "N/A"}
            </span>

            <small>
              {booking.selectedClass ||
                "N/A"}{" "}
              · Coach{" "}
              {booking.coach ||
                "N/A"}
            </small>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #ffb3b3",
              color: "#c62828",
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontWeight: "600",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div className="passenger-details-layout">

          {/* =================================================
              PASSENGERS
          ================================================= */}

          <section className="passenger-details-card">

            <div className="passenger-details-card-header">

              <div>

                <span>
                  TRAVELLERS
                </span>

                <h2>
                  Passenger information
                </h2>

              </div>

              <div className="passenger-count-badge">
                {passengers.length}
              </div>

            </div>

            <div className="passenger-details-list">

              {passengers.length === 0 ? (

                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  <h3>
                    No seats selected
                  </h3>

                  <p>
                    Please go back and select
                    train seats.
                  </p>

                  <button
                    type="button"
                    onClick={handleBack}
                  >
                    Select Seats
                  </button>
                </div>

              ) : (

                passengers.map(
                  (passenger, index) => (

                    <div
                      className="passenger-detail-item"
                      key={
                        passenger.id ||
                        index + 1
                      }
                    >

                      {/* NUMBER */}

                      <div className="passenger-detail-number">
                        P
                        {index + 1}
                      </div>

                      <div className="passenger-detail-content">

                        {/* TOP */}

                        <div className="passenger-detail-top">

                          <div>

                            <span className="passenger-label">
                              PASSENGER{" "}
                              {index + 1}
                            </span>

                            <h3>
                              Passenger{" "}
                              {index + 1}
                            </h3>

                          </div>

                          <div
                            className="passenger-gender-badge gender-none"
                          >
                            {passenger.gender
                              ? passenger.gender ===
                                "men"
                                ? "♂ Male"
                                : "♀ Female"
                              : "Select gender"}
                          </div>

                        </div>

                        {/* =================================================
                            NAME
                        ================================================= */}

                        <div
                          className="passenger-input-group"
                          style={{
                            marginBottom: "18px",
                          }}
                        >

                          <label>
                            FULL NAME
                          </label>

                          <input
                            type="text"
                            value={
                              passenger.name
                            }
                            onChange={(e) =>
                              handlePassengerChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter passenger full name"
                          />

                        </div>

                        {/* =================================================
                            AGE + GENDER
                        ================================================= */}

                        <div
                          className="passenger-form-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "1fr 1fr",
                            gap: "15px",
                            marginBottom:
                              "18px",
                          }}
                        >

                          {/* AGE */}

                          <div className="passenger-input-group">

                            <label>
                              AGE
                            </label>

                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={
                                passenger.age
                              }
                              onChange={(e) =>
                                handlePassengerChange(
                                  index,
                                  "age",
                                  e.target.value
                                )
                              }
                              placeholder="Enter age"
                            />

                          </div>

                          {/* GENDER */}

                          <div className="passenger-input-group">

                            <label>
                              GENDER
                            </label>

                            <select
                              value={
                                passenger.gender
                              }
                              onChange={(e) =>
                                handlePassengerChange(
                                  index,
                                  "gender",
                                  e.target.value
                                )
                              }
                            >

                              <option value="">
                                Select gender
                              </option>

                              <option value="men">
                                Male
                              </option>

                              <option value="women">
                                Female
                              </option>

                            </select>

                          </div>

                        </div>

                        {/* =================================================
                            SEAT INFORMATION
                        ================================================= */}

                        <div className="passenger-detail-info-grid">

                          <div className="passenger-info-box">

                            <span>
                              SEAT
                            </span>

                            <strong>
                              {booking.coach ||
                                "N/A"}
                              -
                              {passenger.seat ||
                                "N/A"}
                            </strong>

                          </div>

                          <div className="passenger-info-box">

                            <span>
                              TRAIN CLASS
                            </span>

                            <strong>
                              {booking.selectedClass ||
                                "N/A"}
                            </strong>

                          </div>

                          <div className="passenger-info-box">

                            <span>
                              SAFESEAT PREFERENCE
                            </span>

                            <strong>
                              {passenger.preference ||
                                "No preference"}
                            </strong>

                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <aside className="passenger-details-summary">

            <div className="details-summary-header">

              <span>
                BOOKING SUMMARY
              </span>

              <strong>
                {passengers.length}{" "}
                Passenger
                {passengers.length > 1
                  ? "s"
                  : ""}
              </strong>

            </div>

            {/* ROUTE */}

            <div className="details-summary-route">

              <div>

                <strong>
                  {booking.train?.departure ||
                    "--:--"}
                </strong>

                <span>
                  {booking.from ||
                    "Origin"}
                </span>

              </div>

              <div className="details-summary-arrow">
                →
              </div>

              <div>

                <strong>
                  {booking.train?.arrival ||
                    "--:--"}
                </strong>

                <span>
                  {booking.to ||
                    "Destination"}
                </span>

              </div>

            </div>

            <div className="details-summary-divider"></div>

            {/* DATE */}

            <div className="details-summary-row">

              <span>
                Travel date
              </span>

              <strong>
                {booking.formattedDate ||
                  booking.travelDate ||
                  booking.date ||
                  "N/A"}
              </strong>

            </div>

            {/* CLASS */}

            <div className="details-summary-row">

              <span>
                Class
              </span>

              <strong>
                {booking.selectedClass ||
                  "N/A"}
              </strong>

            </div>

            {/* COACH */}

            <div className="details-summary-row">

              <span>
                Coach
              </span>

              <strong>
                {booking.coach ||
                  "N/A"}
              </strong>

            </div>

            {/* SEATS */}

            <div className="details-summary-row">

              <span>
                Seats
              </span>

              <strong>
                {selectedSeats.length > 0
                  ? selectedSeats
                      .map(
                        (seat) =>
                          `${
                            booking.coach ||
                            ""
                          }-${seat}`
                      )
                      .join(", ")
                  : "N/A"}
              </strong>

            </div>

            <div className="details-summary-divider"></div>

            {/* FARE */}

            <div className="details-summary-price">

              <span>
                Total fare
              </span>

              <strong>
                ₹
                {Number(
                  booking.totalAmount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* CONTINUE */}

            <button
              type="button"
              className="passenger-details-continue"
              onClick={handleContinue}
              disabled={
                passengers.length === 0
              }
            >
              Continue to payment

              <span>
                →
              </span>

            </button>

            <p className="details-summary-note">
              Please enter and verify all
              passenger details before continuing.
            </p>

          </aside>

        </div>

      </main>
<Footer />
    </div>
  );
}

export default PassengerDetails;