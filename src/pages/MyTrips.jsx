import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyTrips.css";
import Footer from "../components/Footer";

const API_BASE_URL = "https://safeseat.onrender.com";

function MyTrips() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      LOAD BOOKINGS FROM BACKEND
  ===================================================== */

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem(
        "safeSeatUserId"
      );

      if (!userId) {
        console.error("SafeSeat user ID not found.");

        setBookings([]);
        setError(
          "Please login again to view your trips."
        );

        setLoading(false);
        return;
      }

      console.log(
        "Loading bookings for user:",
        userId
      );

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/user/${userId}`
      );

      const data = await response.json();

      console.log(
        "MY TRIPS BACKEND RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load your bookings."
        );
      }

      const backendBookings =
        Array.isArray(data.bookings)
          ? data.bookings
          : [];

      setBookings(backendBookings);

      /*
        Keep localStorage synchronized.
        This is only a local copy now.
        The backend/database is the main source.
      */
      localStorage.setItem(
        "safeSeatBookings",
        JSON.stringify(backendBookings)
      );

    } catch (error) {
      console.error(
        "Unable to load trips:",
        error
      );

      setError(
        error.message ||
          "Unable to load your trips."
      );

      /*
        Fallback to localStorage if backend
        temporarily cannot be reached.
      */
      try {
        const stored = JSON.parse(
          localStorage.getItem(
            "safeSeatBookings"
          ) || "[]"
        );

        if (Array.isArray(stored)) {
          setBookings(stored);
        }
      } catch (storageError) {
        console.error(
          "Local booking fallback failed:",
          storageError
        );

        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
      TRANSPORT
  ===================================================== */

  const getTransport = (trip) => {
    return (
      trip.transportType ||
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
      trip.trainName ||
      trip.train_name ||
      trip.name ||
      "SafeSeat Express"
    );
  };

  const getTrainNumber = (trip) => {
    return (
      trip.train?.number ||
      trip.trainNumber ||
      trip.train_number ||
      "N/A"
    );
  };

  /* =====================================================
      BUS
  ===================================================== */

  const getBusName = (trip) => {
    return (
      trip.busName ||
      trip.bus_name ||
      trip.bus?.name ||
      "SafeSeat Bus"
    );
  };

  const getBusNumber = (trip) => {
    return (
      trip.busNumber ||
      trip.bus_number ||
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
      trip.from_city ||
      "Origin"
    );
  };

  const getTo = (trip) => {
    return (
      trip.to ||
      trip.destination ||
      trip.toCity ||
      trip.to_city ||
      "Destination"
    );
  };

  /* =====================================================
      DEPARTURE
  ===================================================== */

  const getDeparture = (trip) => {
    return (
      trip.departure ||
      trip.departureTime ||
      trip.departure_time ||
      trip.train?.departure ||
      "--:--"
    );
  };

  /* =====================================================
      ARRIVAL
  ===================================================== */

  const getArrival = (trip) => {
    return (
      trip.arrival ||
      trip.arrivalTime ||
      trip.arrival_time ||
      trip.train?.arrival ||
      "--:--"
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
      trip.journey_date ||
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
          const seat =
            passenger.seat || "N/A";

          if (trip.coach) {
            return `${trip.coach}-${seat}`;
          }

          return seat;
        })
        .join(", ");
    }

    /*
      Backend currently stores the number
      of seats in `seats`.
    */
    if (
      trip.seats !== undefined &&
      trip.seats !== null
    ) {
      return String(trip.seats);
    }

    return "N/A";
  };

  /* =====================================================
      PASSENGER COUNT
  ===================================================== */

  const getPassengerCount = (trip) => {
    if (trip.passengerCount) {
      return trip.passengerCount;
    }

    if (
      Array.isArray(trip.passengers) &&
      trip.passengers.length > 0
    ) {
      return trip.passengers.length;
    }

    /*
      Backend stores the seat count.
      For the current booking structure,
      use it as the passenger count.
    */
    if (trip.seats) {
      return Number(trip.seats);
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

  const filteredBookings = bookings.filter(
    (trip) => {
      const status =
        getStatus(trip).toLowerCase();

      if (filter === "confirmed") {
        return status === "confirmed";
      }

      if (filter === "cancelled") {
        return status === "cancelled";
      }

      return true;
    }
  );

  /* =====================================================
      CANCEL TRIP
  ===================================================== */

  const cancelTrip = async (bookingId) => {
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

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "CANCEL BOOKING RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to cancel booking."
        );
      }

      /*
        Reload from backend so the status
        comes directly from MySQL.
      */
      await loadBookings();

      setSelectedTrip(null);

      alert(
        "Trip cancelled successfully. You can now request a refund."
      );

    } catch (error) {
      console.error(
        "CANCEL TRIP ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to cancel the trip."
      );
    }
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

    const updatedBookings = bookings.map(
      (trip) => {
        if (
          trip.bookingId === bookingId ||
          trip.booking_id === bookingId
        ) {
          return {
            ...trip,
            refundStatus: "Processing",
            refundRequestedAt:
              new Date().toISOString(),
          };
        }

        return trip;
      }
    );

    setBookings(updatedBookings);

    localStorage.setItem(
      "safeSeatBookings",
      JSON.stringify(updatedBookings)
    );

    const currentBooking =
      updatedBookings.find(
        (trip) =>
          trip.bookingId === bookingId ||
          trip.booking_id === bookingId
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

      setSelectedTrip(currentBooking);
    }

    window.dispatchEvent(
      new Event("safeSeatBookingUpdated")
    );

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
      LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="my-trips-page">

        <main className="my-trips-container">

          <button
            type="button"
            className="my-trips-back-home"
            onClick={() => navigate("/home")}
          >
            ← Back to Home
          </button>

          <section className="empty-trips">

            <div className="empty-trip-icon">
              🎫
            </div>

            <h2>
              Loading your trips...
            </h2>

            <p>
              Please wait while we fetch your
              bookings.
            </p>

          </section>

        </main>

        <Footer />

      </div>
    );
  }

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
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              margin: "20px 0",
              padding: "14px 18px",
              borderRadius: "12px",
              background: "#fff1f2",
              color: "#b42318",
              border: "1px solid #fecdd3",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

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
              onClick={() =>
                setFilter("all")
              }
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
                      trip.booking_id ||
                      trip.id ||
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
                              ? getTrainName(
                                  trip
                                )
                              : getBusName(
                                  trip
                                )}
                          </h2>

                          <p>
                            {isTrain
                              ? `Train ${getTrainNumber(
                                  trip
                                )}`
                              : getBusNumber(
                                  trip
                                )}
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
                          {getDeparture(
                            trip
                          )}
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
                          {getArrival(trip)}
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
                            trip.booking_id ||
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
                                trip.bookingId ||
                                  trip.booking_id
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
                                  trip.bookingId ||
                                    trip.booking_id
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
                  {getTransport(
                    selectedTrip
                  ) === "train"
                    ? getTrainName(
                        selectedTrip
                      )
                    : getBusName(
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
                    {getDeparture(
                      selectedTrip
                    )}
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
                    {getArrival(
                      selectedTrip
                    )}
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
                        {selectedTrip.passengerName ||
                          "Passenger"}
                      </strong>

                      <span>
                        {selectedTrip.passengerGender ===
                        "men"
                          ? "Male"
                          : selectedTrip.passengerGender ===
                            "women"
                          ? "Female"
                          : "Passenger details"}
                        {" • "}
                        Age{" "}
                        {selectedTrip.passengerAge ||
                          "N/A"}
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
                      selectedTrip.booking_id ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    PAYMENT
                  </span>

                  <strong>
                    {selectedTrip.paymentMethod ||
                      selectedTrip.payment_method ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    PAYMENT STATUS
                  </span>

                  <strong className="payment-paid">

                    {selectedTrip.paymentStatus ||
                      selectedTrip.payment_status ||
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
                      selectedTrip.bookingId ||
                        selectedTrip.booking_id
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
                      selectedTrip.bookingId ||
                        selectedTrip.booking_id
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