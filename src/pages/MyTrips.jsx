
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyTrips.css";
import Footer from "../components/Footer";

function MyTrips() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    loadBookings();

    const handleUpdate = () => {
      loadBookings();
    };

    window.addEventListener(
      "safeSeatBookingUpdated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "safeSeatBookingUpdated",
        handleUpdate
      );
    };
  }, []);

  /* =====================================================
      LOAD BOOKINGS
  ===================================================== */

  const loadBookings = () => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("safeSeatBookings") || "[]"
      );

      setBookings(
        Array.isArray(stored) ? stored : []
      );
    } catch (error) {
      console.error("Unable to load trips:", error);
      setBookings([]);
    }
  };

  /* =====================================================
      TRANSPORT
  ===================================================== */

  const getTransport = (trip) => {
    return (
      trip.transportMode ||
      trip.mode ||
      trip.type ||
      "bus"
    ).toLowerCase();
  };

  /* =====================================================
      STATUS
  ===================================================== */

  const getStatus = (trip) => {
    return (
      trip.bookingStatus ||
      trip.booking_status ||
      "Confirmed"
    );
  };

  /* =====================================================
      TRAIN
  ===================================================== */

  const getTrainName = (trip) => {
    return (
      trip.train?.name ||
      trip.train_name ||
      trip.name ||
      "SafeSeat Express"
    );
  };

  const getTrainNumber = (trip) => {
    return (
      trip.train?.number ||
      trip.train_number ||
      "N/A"
    );
  };

  /* =====================================================
      ROUTE
  ===================================================== */

  const getFrom = (trip) => {
    return (
      trip.from ||
      trip.source ||
      trip.fromCity ||
      "Origin"
    );
  };

  const getTo = (trip) => {
    return (
      trip.to ||
      trip.destination ||
      trip.toCity ||
      "Destination"
    );
  };

  /* =====================================================
      DATE
  ===================================================== */

  const getDate = (trip) => {
    return (
      trip.formattedDate ||
      trip.travelDate ||
      trip.journeyDate ||
      trip.date ||
      "N/A"
    );
  };

  /* =====================================================
      SEATS
  ===================================================== */

  const getSeats = (trip) => {
    if (
      Array.isArray(trip.selectedSeats) &&
      trip.selectedSeats.length > 0
    ) {
      return trip.selectedSeats.join(", ");
    }

    if (
      Array.isArray(trip.passengers) &&
      trip.passengers.length > 0
    ) {
      return trip.passengers
        .map((passenger) => {
          const seat = passenger.seat || "N/A";

          if (trip.coach) {
            return `${trip.coach}-${seat}`;
          }

          return seat;
        })
        .join(", ");
    }

    return trip.seats || "N/A";
  };

  /* =====================================================
      PASSENGER COUNT
  ===================================================== */

  const getPassengerCount = (trip) => {
    if (trip.passengerCount) {
      return trip.passengerCount;
    }

    if (Array.isArray(trip.passengers)) {
      return trip.passengers.length;
    }

    return 1;
  };

  /* =====================================================
      AMOUNT
  ===================================================== */

  const getAmount = (trip) => {
    return Number(
      trip.totalAmount ||
        trip.amount ||
        trip.totalFare ||
        0
    );
  };

  /* =====================================================
      FILTER
  ===================================================== */

  const filteredBookings = bookings.filter((trip) => {
    const status = getStatus(trip).toLowerCase();

    if (filter === "confirmed") {
      return status === "confirmed";
    }

    if (filter === "cancelled") {
      return status === "cancelled";
    }

    return true;
  });

  /* =====================================================
      CANCEL TRIP
  ===================================================== */

  const cancelTrip = (bookingId) => {
    if (!bookingId) {
      alert("Booking ID not found.");
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this trip?"
    );

    if (!confirmCancel) {
      return;
    }

    const updatedBookings = bookings.map((trip) => {
      if (trip.bookingId === bookingId) {
        return {
          ...trip,
          bookingStatus: "Cancelled",
          refundStatus: null,
        };
      }

      return trip;
    });

    setBookings(updatedBookings);

    localStorage.setItem(
      "safeSeatBookings",
      JSON.stringify(updatedBookings)
    );

    const currentBooking = updatedBookings.find(
      (trip) => trip.bookingId === bookingId
    );

    if (currentBooking) {
      localStorage.setItem(
        "safeSeatBooking",
        JSON.stringify(currentBooking)
      );

      sessionStorage.setItem(
        "safeSeatBooking",
        JSON.stringify(currentBooking)
      );
    }

    window.dispatchEvent(
      new Event("safeSeatBookingUpdated")
    );

    setSelectedTrip(null);

    alert(
      "Trip cancelled successfully. You can now request a refund."
    );
  };

  /* =====================================================
      REQUEST REFUND
  ===================================================== */

  const requestRefund = (bookingId) => {
    if (!bookingId) {
      alert("Booking ID not found.");
      return;
    }

    const confirmRefund = window.confirm(
      "Do you want to request a refund for this cancelled trip?"
    );

    if (!confirmRefund) {
      return;
    }

    const updatedBookings = bookings.map((trip) => {
      if (trip.bookingId === bookingId) {
        return {
          ...trip,
          refundStatus: "Processing",
          refundRequestedAt:
            new Date().toISOString(),
        };
      }

      return trip;
    });

    setBookings(updatedBookings);

    localStorage.setItem(
      "safeSeatBookings",
      JSON.stringify(updatedBookings)
    );

    const currentBooking = updatedBookings.find(
      (trip) => trip.bookingId === bookingId
    );

    if (currentBooking) {
      localStorage.setItem(
        "safeSeatBooking",
        JSON.stringify(currentBooking)
      );

      sessionStorage.setItem(
        "safeSeatBooking",
        JSON.stringify(currentBooking)
      );
    }

    window.dispatchEvent(
      new Event("safeSeatBookingUpdated")
    );

    setSelectedTrip(null);

    alert(
      "Refund request submitted successfully. Your refund is being processed."
    );
  };

  /* =====================================================
      REFUND STATUS
  ===================================================== */

  const getRefundStatus = (trip) => {
    return trip.refundStatus || "Not Requested";
  };

  /* =====================================================
      RENDER
  ===================================================== */

  return (
    <div className="my-trips-page">

      <main className="my-trips-container">

        {/* BACK HOME */}

        <button
          type="button"
          className="my-trips-back-home"
          onClick={() => navigate("/home")}
        >
          ← Back to Home
        </button>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="my-trips-hero">

          <div className="my-trips-hero-content">

            <span className="hero-label">
              YOUR JOURNEYS
            </span>

            <h1>
              My <span>Trips</span>
            </h1>

            <p>
              View and manage all your SafeSeat
              bus and train bookings in one place.
            </p>

          </div>

          <div className="hero-icon-wrapper">

            <div className="hero-icon">
              🎫
            </div>

          </div>

        </section>

        {/* =================================================
            CONTROLS
        ================================================= */}

        <section className="trip-controls">

          <div className="trip-count">

            <div className="trip-count-number">
              {filteredBookings.length}
            </div>

            <div>

              <strong>
                {filteredBookings.length === 1
                  ? "Trip"
                  : "Trips"}
              </strong>

              <span>
                Your booked journeys
              </span>

            </div>

          </div>

          <div className="trip-filters">

            <button
              type="button"
              className={
                filter === "all"
                  ? "filter-active"
                  : ""
              }
              onClick={() => setFilter("all")}
            >
              All Trips
            </button>

            <button
              type="button"
              className={
                filter === "confirmed"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setFilter("confirmed")
              }
            >
              Confirmed
            </button>

            <button
              type="button"
              className={
                filter === "cancelled"
                  ? "filter-active"
                  : ""
              }
              onClick={() =>
                setFilter("cancelled")
              }
            >
              Cancelled
            </button>

          </div>

        </section>

        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredBookings.length === 0 && (

          <section className="empty-trips">

            <div className="empty-trip-icon">
              🎫
            </div>

            <h2>
              No trips found
            </h2>

            <p>
              You don't have any{" "}
              {filter === "all"
                ? ""
                : filter}{" "}
              trips yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/home")
              }
            >
              Book a Trip
              <span>→</span>
            </button>

          </section>

        )}

        {/* =================================================
            TRIPS LIST
        ================================================= */}

        {filteredBookings.length > 0 && (

          <section className="trips-list">

            {filteredBookings.map(
              (trip, index) => {

                const transport =
                  getTransport(trip);

                const status =
                  getStatus(trip);

                const isCancelled =
                  status.toLowerCase() ===
                  "cancelled";

                const isTrain =
                  transport === "train";

                return (

                  <article
                    className={`trip-card ${
                      isCancelled
                        ? "trip-card-cancelled"
                        : ""
                    }`}
                    key={
                      trip.bookingId ||
                      index
                    }
                  >

                    {/* =====================================
                        CARD TOP
                    ===================================== */}

                    <div className="trip-card-top">

                      <div className="trip-transport">

                        <div
                          className={`transport-icon ${
                            isTrain
                              ? "train"
                              : "bus"
                          }`}
                        >
                          {isTrain
                            ? "🚆"
                            : "🚌"}
                        </div>

                        <div>

                          <span className="transport-label">
                            {isTrain
                              ? "TRAIN JOURNEY"
                              : "BUS JOURNEY"}
                          </span>

                          <h2>
                            {isTrain
                              ? getTrainName(trip)
                              : trip.busName ||
                                trip.bus?.name ||
                                "SafeSeat Bus"}
                          </h2>

                          <p>
                            {isTrain
                              ? `Train ${getTrainNumber(
                                  trip
                                )}`
                              : trip.busNumber ||
                                "SafeSeat"}
                          </p>

                        </div>

                      </div>

                      <div
                        className={`trip-status ${
                          isCancelled
                            ? "cancelled"
                            : "confirmed"
                        }`}
                      >

                        <span className="status-dot"></span>

                        {status}

                      </div>

                    </div>

                    {/* =====================================
                        ROUTE
                    ===================================== */}

                    <div className="trip-route">

                      <div className="trip-location">

                        <strong>
                          {trip.departure ||
                            trip.train?.departure ||
                            "--:--"}
                        </strong>

                        <span>
                          {getFrom(trip)}
                        </span>

                      </div>

                      <div className="route-line">

                        <span className="route-dot"></span>

                        <span className="route-dashes"></span>

                        <span className="route-arrow">
                          →
                        </span>

                        <span className="route-dashes"></span>

                        <span className="route-dot"></span>

                      </div>

                      <div className="trip-location destination">

                        <strong>
                          {trip.arrival ||
                            trip.train?.arrival ||
                            "--:--"}
                        </strong>

                        <span>
                          {getTo(trip)}
                        </span>

                      </div>

                    </div>

                    {/* =====================================
                        DETAILS
                    ===================================== */}

                    <div className="trip-details">

                      <div className="trip-detail">

                        <span>
                          TRAVEL DATE
                        </span>

                        <strong>
                          {getDate(trip)}
                        </strong>

                      </div>

                      <div className="trip-detail">

                        <span>
                          PASSENGERS
                        </span>

                        <strong>
                          {getPassengerCount(
                            trip
                          )}
                        </strong>

                      </div>

                      <div className="trip-detail">

                        <span>
                          SEATS
                        </span>

                        <strong>
                          {getSeats(trip)}
                        </strong>

                      </div>

                      <div className="trip-detail fare">

                        <span>
                          TOTAL FARE
                        </span>

                        <strong>
                          ₹
                          {getAmount(
                            trip
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    <div className="trip-card-footer">

                      <div className="booking-id">

                        <span>
                          BOOKING ID
                        </span>

                        <strong>
                          {trip.bookingId ||
                            "N/A"}
                        </strong>

                      </div>

                      <div className="trip-actions">

                        {/* VIEW TICKET */}

                        <button
                          type="button"
                          className="view-ticket-btn"
                          onClick={() =>
                            setSelectedTrip(
                              trip
                            )
                          }
                        >
                          View Ticket
                        </button>

                        {/* CANCEL */}

                        {!isCancelled && (

                          <button
                            type="button"
                            className="cancel-trip-btn"
                            onClick={() =>
                              cancelTrip(
                                trip.bookingId
                              )
                            }
                          >
                            Cancel Trip
                          </button>

                        )}

                        {/* REFUND */}

                        {isCancelled &&
                          !trip.refundStatus && (

                            <button
                              type="button"
                              className="refund-btn"
                              onClick={() =>
                                requestRefund(
                                  trip.bookingId
                                )
                              }
                            >
                              💰 Request Refund
                            </button>

                          )}

                        {/* REFUND PROCESSING */}

                        {isCancelled &&
                          trip.refundStatus ===
                            "Processing" && (

                            <button
                              type="button"
                              className="refund-processing-btn"
                              disabled
                            >
                              ⏳ Refund Processing
                            </button>

                          )}

                        {/* REFUNDED */}

                        {isCancelled &&
                          trip.refundStatus ===
                            "Refunded" && (

                            <button
                              type="button"
                              className="refund-completed-btn"
                              disabled
                            >
                              ✓ Refund Completed
                            </button>

                          )}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </section>

        )}

      </main>

      {/* =================================================
          TICKET MODAL
      ================================================= */}

      {selectedTrip && (

        <div
          className="ticket-overlay"
          onClick={() =>
            setSelectedTrip(null)
          }
        >

          <div
            className="ticket-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="ticket-modal-header">

              <div>

                <span>
                  SAFESEAT TICKET
                </span>

                <h2>
                  {getTrainName(
                    selectedTrip
                  )}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTrip(null)
                }
              >
                ×
              </button>

            </div>

            <div className="ticket-main">

              {/* TYPE */}

              <div className="ticket-type">

                <span>
                  {getTransport(
                    selectedTrip
                  ).toUpperCase()}
                </span>

                <strong>
                  {getStatus(
                    selectedTrip
                  )}
                </strong>

              </div>

              {/* ROUTE */}

              <div className="ticket-route">

                <div>

                  <strong>
                    {selectedTrip.departure ||
                      selectedTrip.train
                        ?.departure ||
                      "--:--"}
                  </strong>

                  <span>
                    {getFrom(
                      selectedTrip
                    )}
                  </span>

                </div>

                <div className="ticket-route-arrow">
                  →
                </div>

                <div>

                  <strong>
                    {selectedTrip.arrival ||
                      selectedTrip.train
                        ?.arrival ||
                      "--:--"}
                  </strong>

                  <span>
                    {getTo(
                      selectedTrip
                    )}
                  </span>

                </div>

              </div>

              {/* INFO */}

              <div className="ticket-info-grid">

                <div>

                  <span>
                    DATE
                  </span>

                  <strong>
                    {getDate(
                      selectedTrip
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    CLASS
                  </span>

                  <strong>
                    {selectedTrip.selectedClass ||
                      selectedTrip.trainClass ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    COACH
                  </span>

                  <strong>
                    {selectedTrip.coach ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    TRAIN NO.
                  </span>

                  <strong>
                    {getTrainNumber(
                      selectedTrip
                    )}
                  </strong>

                </div>

              </div>

              {/* PASSENGERS */}

              <div className="ticket-passengers">

                <h3>
                  Passenger Details
                </h3>

                {Array.isArray(
                  selectedTrip.passengers
                ) &&
                selectedTrip.passengers.length >
                  0 ? (

                  selectedTrip.passengers.map(
                    (
                      passenger,
                      index
                    ) => (

                      <div
                        className="ticket-passenger"
                        key={
                          passenger.id ||
                          index
                        }
                      >

                        <div className="passenger-number">
                          P
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
                            {passenger.gender ===
                            "men"
                              ? "Male"
                              : passenger.gender ===
                                "women"
                              ? "Female"
                              : "Gender not selected"}
                            {" • "}
                            Age{" "}
                            {passenger.age ||
                              "N/A"}
                          </span>

                        </div>

                        <strong className="passenger-seat">

                          {selectedTrip.coach
                            ? `${selectedTrip.coach}-`
                            : ""}

                          {passenger.seat ||
                            "N/A"}

                        </strong>

                      </div>

                    )
                  )

                ) : (

                  <div className="ticket-passenger">

                    <div className="passenger-number">
                      P1
                    </div>

                    <div className="passenger-info">

                      <strong>
                        Passenger
                      </strong>

                      <span>
                        Passenger details
                      </span>

                    </div>

                    <strong className="passenger-seat">

                      {getSeats(
                        selectedTrip
                      )}

                    </strong>

                  </div>

                )}

              </div>

              {/* =================================================
                  PAYMENT + REFUND
              ================================================= */}

              <div className="ticket-bottom">

                <div>

                  <span>
                    BOOKING ID
                  </span>

                  <strong>
                    {selectedTrip.bookingId ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    PAYMENT
                  </span>

                  <strong>
                    {selectedTrip.paymentMethod ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    PAYMENT STATUS
                  </span>

                  <strong className="payment-paid">

                    {selectedTrip.paymentStatus ||
                      "Paid"}

                  </strong>

                </div>

                <div>

                  <span>
                    REFUND STATUS
                  </span>

                  <strong
                    className={
                      selectedTrip.refundStatus ===
                      "Processing"
                        ? "refund-processing"
                        : selectedTrip.refundStatus ===
                          "Refunded"
                        ? "refund-completed"
                        : "refund-not-requested"
                    }
                  >
                    {getRefundStatus(
                      selectedTrip
                    )}
                  </strong>

                </div>

              </div>

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="ticket-modal-footer">

              <button
                type="button"
                className="ticket-close-btn"
                onClick={() =>
                  setSelectedTrip(null)
                }
              >
                Close
              </button>

              {/* CANCEL */}

              {getStatus(
                selectedTrip
              ).toLowerCase() !==
                "cancelled" && (

                <button
                  type="button"
                  className="ticket-cancel-btn"
                  onClick={() =>
                    cancelTrip(
                      selectedTrip.bookingId
                    )
                  }
                >
                  Cancel Trip
                </button>

              )}

              {/* REQUEST REFUND */}

              {getStatus(
                selectedTrip
              ).toLowerCase() ===
                "cancelled" &&
                !selectedTrip.refundStatus && (

                <button
                  type="button"
                  className="ticket-refund-btn"
                  onClick={() =>
                    requestRefund(
                      selectedTrip.bookingId
                    )
                  }
                >
                  💰 Request Refund
                </button>

              )}

              {/* PROCESSING */}

              {selectedTrip.refundStatus ===
                "Processing" && (

                <button
                  type="button"
                  className="ticket-refund-btn"
                  disabled
                >
                  ⏳ Refund Processing
                </button>

              )}

              {/* COMPLETED */}

              {selectedTrip.refundStatus ===
                "Refunded" && (

                <button
                  type="button"
                  className="refund-completed-btn"
                  disabled
                >
                  ✓ Refund Completed
                </button>

              )}

            </div>

          </div>

        </div>

      )}

      <Footer />

    </div>
  );
}

export default MyTrips;

