import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./BookingConfirmation.css";
import Footer from "../components/Footer";
function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] =
    useState(null);

  useEffect(() => {
    let data =
      location.state || {};

    if (!data.bookingId) {
      try {
        data = JSON.parse(
          sessionStorage.getItem(
            "safeSeatBooking"
          ) || "{}"
        );
      } catch (error) {
        console.error(
          "Unable to read booking data:",
          error
        );

        data = {};
      }
    }

    if (!data.bookingId) {
      alert(
        "Booking information is missing."
      );

      navigate("/");

      return;
    }

    setBooking(data);

    sessionStorage.setItem(
      "safeSeatBooking",
      JSON.stringify(data)
    );

    localStorage.setItem(
      "safeSeatBooking",
      JSON.stringify(data)
    );

  }, [
    location.state,
    navigate,
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleMyTrips = () => {
    navigate("/my-trips");
  };

  const handleHome = () => {
    navigate("/");
  };

  if (!booking) {
    return (
      <div className="confirmation-loading">

        <div className="loading-spinner"></div>

        <h2>
          Loading your booking...
        </h2>

      </div>
    );
  }

  // =====================================================
  // TRANSPORT
  // =====================================================

  const transportType =
    (
      booking.transportType ||
      booking.transportMode ||
      booking.mode ||
      booking.type ||
      "bus"
    )
      .toString()
      .toLowerCase();

  const isTrain =
    transportType === "train";

  // =====================================================
  // BUS / TRAIN
  // =====================================================

  const bus =
    booking.bus || {};

  const train =
    booking.train || {};

  // =====================================================
  // PASSENGERS
  // =====================================================

  const passengers =
    Array.isArray(
      booking.passengers
    )
      ? booking.passengers
      : [];

  // =====================================================
  // SEATS
  // =====================================================

  const selectedSeats =
    Array.isArray(
      booking.selectedSeats
    )
      ? booking.selectedSeats
      : passengers
          .map(
            (passenger) =>
              passenger.seat
          )
          .filter(Boolean);

  // =====================================================
  // BOOKING ID
  // =====================================================

  const bookingId =
    booking.bookingId ||
    booking.booking?.bookingId ||
    "--";

  // =====================================================
  // ROUTE
  // =====================================================

  const from =
    booking.from ||
    booking.booking?.from ||
    (isTrain
      ? booking.fromCity
      : bus.from) ||
    bus.from_city ||
    "Origin";

  const to =
    booking.to ||
    booking.booking?.to ||
    (isTrain
      ? booking.toCity
      : bus.to) ||
    bus.to_city ||
    "Destination";

  // =====================================================
  // DATE
  // =====================================================

  const travelDate =
    booking.travelDate ||
    booking.journeyDate ||
    booking.journey_date ||
    booking.booking?.journeyDate ||
    booking.date ||
    "";

  // =====================================================
  // COUNT
  // =====================================================

  const passengerCount =
    Number(
      booking.passengerCount
    ) ||
    passengers.length ||
    selectedSeats.length ||
    0;

  // =====================================================
  // AMOUNT
  // =====================================================

  const totalAmount =
    Number(
      booking.totalAmount ||
      booking.booking?.amount ||
      booking.amount ||
      0
    );

  // =====================================================
  // PAYMENT
  // =====================================================

  const paymentMethod =
    booking.paymentMethod ||
    booking.booking?.paymentMethod ||
    "UPI";

  const paymentStatus =
    booking.paymentStatus ||
    booking.booking?.paymentStatus ||
    "Paid";

  const bookingStatus =
    booking.bookingStatus ||
    booking.booking?.bookingStatus ||
    "Confirmed";

  // =====================================================
  // TRANSPORT NAME
  // =====================================================

  const transportName = isTrain
    ? (
        train.name ||
        train.trainName ||
        booking.trainName ||
        "SafeSeat Express"
      )
    : (
        bus.operator ||
        bus.bus_name ||
        booking.operator ||
        "SafeSeat Bus"
      );

  // =====================================================
  // TRANSPORT NUMBER
  // =====================================================

  const transportNumber = isTrain
    ? (
        train.number ||
        train.trainNumber ||
        booking.trainNumber ||
        "N/A"
      )
    : (
        bus.bus_number ||
        booking.busNumber ||
        ""
      );

  // =====================================================
  // TRANSPORT TYPE NAME
  // =====================================================

  const vehicleType = isTrain
    ? (
        train.trainType ||
        train.type ||
        booking.trainType ||
        booking.selectedClass ||
        "Express Train"
      )
    : (
        bus.busType ||
        bus.bus_type ||
        "Bus Service"
      );

  // =====================================================
  // DEPARTURE
  // =====================================================

  const departure =
    isTrain
      ? (
          train.departure ||
          booking.departure ||
          booking.departureTime ||
          "--"
        )
      : (
          bus.departure ||
          bus.departure_time ||
          booking.departure ||
          "--"
        );

  // =====================================================
  // ARRIVAL
  // =====================================================

  const arrival =
    isTrain
      ? (
          train.arrival ||
          booking.arrival ||
          booking.arrivalTime ||
          "--"
        )
      : (
          bus.arrival ||
          bus.arrival_time ||
          booking.arrival ||
          "--"
        );

  // =====================================================
  // CLASS
  // =====================================================

  const trainClass =
    booking.selectedClass ||
    booking.trainClass ||
    train.class ||
    booking.train_class ||
    "General";

  // =====================================================
  // COACH
  // =====================================================

  const coach =
    booking.coach ||
    "";

  // =====================================================
  // DISPLAY DATE
  // =====================================================

  const formattedDate =
    formatDate(travelDate);

  return (
    <div className="confirmation-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="confirmation-navbar">

        <div
          className="confirmation-brand"
          onClick={handleHome}
        >

          <div className="confirmation-logo">
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

        <div className="confirmation-nav-status">

          <span className="status-dot"></span>

          Booking confirmed

        </div>

      </header>

      <main className="confirmation-container">

        {/* =================================================
            SUCCESS
        ================================================= */}

        <section className="success-section">

          <div className="success-icon">
            ✓
          </div>

          <span className="success-label">
            BOOKING SUCCESSFUL
          </span>

          <h1>
            Your trip is confirmed!
          </h1>

          <p>
            Your{" "}
            {isTrain
              ? "train"
              : "bus"}{" "}
            ticket has been successfully
            booked. Have a safe journey.
          </p>

        </section>

        {/* =================================================
            BOOKING ID
        ================================================= */}

        <section className="booking-id-card">

          <div>

            <span>
              BOOKING ID
            </span>

            <strong>
              {bookingId}
            </strong>

          </div>

          <div className="confirmed-badge">
            ✓ {bookingStatus}
          </div>

        </section>

        {/* =================================================
            TICKET
        ================================================= */}

        <section className="ticket-card">

          <div className="ticket-header">

            <div>

              <span className="ticket-label">

                {isTrain
                  ? "TRAIN TICKET"
                  : "BUS TICKET"}

              </span>

              <h2>
                {transportName}
              </h2>

              <p>
                {vehicleType}

                {transportNumber && (
                  <>
                    {" · "}
                    {transportNumber}
                  </>
                )}
              </p>

            </div>

            <div className="ticket-logo">

              {(
                transportName ||
                "S"
              )
                .charAt(0)
                .toUpperCase()}

            </div>

          </div>

          <div className="ticket-divider"></div>

          {/* =================================================
              ROUTE
          ================================================= */}

          <div className="ticket-route">

            <div className="ticket-location">

              <span>
                FROM
              </span>

              <strong>
                {from}
              </strong>

              <small>
                {departure}
              </small>

            </div>

            <div className="ticket-route-line">
              <span>
                →
              </span>
            </div>

            <div className="ticket-location">

              <span>
                TO
              </span>

              <strong>
                {to}
              </strong>

              <small>
                {arrival}
              </small>

            </div>

          </div>

          <div className="ticket-divider"></div>

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="ticket-details-grid">

            <div className="ticket-detail">

              <span>
                Journey date
              </span>

              <strong>
                {formattedDate ||
                  "--"}
              </strong>

            </div>

            <div className="ticket-detail">

              <span>
                Seats
              </span>

              <strong>

                {selectedSeats.join(
                  ", "
                ) || "--"}

              </strong>

            </div>

            <div className="ticket-detail">

              <span>
                Passengers
              </span>

              <strong>
                {passengerCount}
              </strong>

            </div>

            <div className="ticket-detail">

              <span>
                Payment
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>

            {isTrain && (

              <div className="ticket-detail">

                <span>
                  Class
                </span>

                <strong>
                  {trainClass}
                </strong>

              </div>

            )}

            {isTrain && coach && (

              <div className="ticket-detail">

                <span>
                  Coach
                </span>

                <strong>
                  {coach}
                </strong>

              </div>

            )}

          </div>

        </section>

        {/* =================================================
            PASSENGERS
        ================================================= */}

        {passengers.length > 0 && (

          <section className="passenger-confirmation-card">

            <div className="confirmation-card-title">

              <div>

                <span>
                  PASSENGERS
                </span>

                <h2>
                  Traveller details
                </h2>

              </div>

              <span className="passenger-count">

                {passengers.length}{" "}
                Passenger
                {passengers.length > 1
                  ? "s"
                  : ""}

              </span>

            </div>

            <div className="confirmed-passengers">

              {passengers.map(
                (
                  passenger,
                  index
                ) => (

                  <div
                    className="confirmed-passenger"
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
                          "Passenger"}
                      </strong>

                      <span>

                        Age:{" "}
                        {passenger.age ||
                          "--"}

                        {" · "}

                        {passenger.gender ===
                        "men"
                          ? "Man"
                          : passenger.gender ===
                            "women"
                          ? "Woman"
                          : "Gender not selected"}

                      </span>

                    </div>

                    <div className="confirmed-seat">

                      <span>
                        SEAT
                      </span>

                      <strong>
                        {coach &&
                        isTrain
                          ? `${coach}-${passenger.seat || "--"}`
                          : passenger.seat ||
                            "--"}
                      </strong>

                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}

        {/* =================================================
            PAYMENT
        ================================================= */}

        <section className="payment-confirmation-card">

          <div>

            <span>
              PAYMENT SUMMARY
            </span>

            <h2>
              Payment details
            </h2>

          </div>

          <div className="payment-summary-content">

            <div className="payment-summary-row">

              <span>
                Payment method
              </span>

              <strong>
                {paymentMethod}
              </strong>

            </div>

            <div className="payment-summary-row">

              <span>
                Payment status
              </span>

              <strong className="payment-status">
                {paymentStatus}
              </strong>

            </div>

            <div className="payment-summary-row total">

              <span>
                Total amount
              </span>

              <strong>
                ₹
                {totalAmount.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <section className="confirmation-actions">

          <button
            type="button"
            className="print-ticket-button"
            onClick={
              handlePrint
            }
          >
            🖨 Print Ticket
          </button>

          <button
            type="button"
            className="my-trips-button"
            onClick={
              handleMyTrips
            }
          >
            View My Trips →
          </button>

        </section>

        {/* =================================================
            TRACK
        ================================================= */}

        <section className="track-ticket-card">

          <div className="track-icon">
            🎫
          </div>

          <div>

            <strong>
              Track your ticket
            </strong>

            <p>

              Use your booking ID{" "}
              <b>
                {bookingId}
              </b>{" "}
              to check your ticket
              status anytime.

            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/track-ticket",
                {
                  state: {
                    bookingId,
                  },
                }
              )
            }
          >
            Track Ticket
          </button>

        </section>

        <div className="confirmation-footer-message">

          <span>
            🛡️
          </span>

          <p>
            Your booking is securely stored.
            Please keep your booking ID for
            future reference.
          </p>

        </div>

      </main>

    </div>
  );
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(
  dateString
) {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(
      `${dateString}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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
export default BookingConfirmation;