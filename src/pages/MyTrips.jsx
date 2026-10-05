import { useCallback, useEffect, useState } from "react";
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

  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Get the actual logged-in user
      let userId = localStorage.getItem("safeSeatUserId");

      // If safeSeatUserId is missing, try safeSeatUser
      if (!userId) {
        try {
          const storedUser = JSON.parse(
            localStorage.getItem("safeSeatUser") || "null"
          );

          if (storedUser?.id) {
            userId = String(storedUser.id);
            localStorage.setItem("safeSeatUserId", userId);
          }
        } catch (userError) {
          console.error("Unable to read safeSeatUser:", userError);
        }
      }

      console.log("=================================");
      console.log("MY TRIPS - USER ID:", userId);
      console.log("=================================");

      if (!userId) {
        setBookings([]);
        setError("Please login again to view your trips.");
        return;
      }

      const url = `${API_BASE_URL}/api/bookings/user/${userId}`;

      console.log("MY TRIPS - FETCHING:", url);

      const response = await fetch(url);

      console.log("MY TRIPS - STATUS:", response.status);

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      console.log("MY TRIPS - BACKEND RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to fetch your bookings."
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message || "Unable to fetch your bookings."
        );
      }

      // Backend currently returns:
      //
      // {
      //   success: true,
      //   count: 2,
      //   bookings: [...]
      // }

      const backendBookings = Array.isArray(data?.bookings)
        ? data.bookings
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      console.log(
        "MY TRIPS - BOOKINGS RECEIVED:",
        backendBookings
      );

      console.log(
        "MY TRIPS - BOOKING COUNT:",
        backendBookings.length
      );

      setBookings(backendBookings);

      // Save latest backend bookings as local backup
      localStorage.setItem(
        "safeSeatBookings",
        JSON.stringify(backendBookings)
      );
    } catch (err) {
      console.error("MY TRIPS ERROR:", err);

      setError(
        err.message || "Unable to load your trips."
      );

      // Fallback to localStorage only if backend fails
      try {
        const stored = JSON.parse(
          localStorage.getItem("safeSeatBookings") || "[]"
        );

        if (Array.isArray(stored)) {
          setBookings(stored);
        } else {
          setBookings([]);
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
  }, []);

  // =====================================================
  // LOAD BOOKINGS + BOOKING UPDATE LISTENER
  // =====================================================

  useEffect(() => {
    // Delay initial fetch so React 19 does not complain
    // about state updates directly inside the effect.
    const timer = window.setTimeout(() => {
      void loadBookings();
    }, 0);

    const handleUpdate = () => {
      void loadBookings();
    };

    window.addEventListener(
      "safeSeatBookingUpdated",
      handleUpdate
    );

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "safeSeatBookingUpdated",
        handleUpdate
      );
    };
  }, [loadBookings]);

  // =====================================================
  // BOOKING ID
  // =====================================================

  const getBookingId = (trip) => {
    return (
      trip?.bookingId ||
      trip?.booking_id ||
      trip?.id ||
      null
    );
  };

  // =====================================================
  // TRANSPORT
  // =====================================================

  const getTransport = (trip) => {
    return (
      trip?.transportType ||
      trip?.transport_type ||
      trip?.transportMode ||
      trip?.transport_mode ||
      trip?.mode ||
      trip?.type ||
      "bus"
    )
      .toString()
      .toLowerCase();
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatus = (trip) => {
    const status =
      trip?.bookingStatus ||
      trip?.booking_status ||
      trip?.status ||
      "Confirmed";

    return String(status);
  };

  // =====================================================
  // TRAIN
  // =====================================================

  const getTrainName = (trip) => {
    return (
      trip?.train?.name ||
      trip?.trainName ||
      trip?.train_name ||
      "SafeSeat Express"
    );
  };

  const getTrainNumber = (trip) => {
    return (
      trip?.train?.number ||
      trip?.trainNumber ||
      trip?.train_number ||
      "N/A"
    );
  };

  // =====================================================
  // BUS
  // =====================================================

  const getBusName = (trip) => {
    return (
      trip?.busName ||
      trip?.bus_name ||
      trip?.bus?.name ||
      trip?.bus?.bus_name ||
      "SafeSeat Bus"
    );
  };

  const getBusNumber = (trip) => {
    return (
      trip?.busNumber ||
      trip?.bus_number ||
      trip?.bus?.busNumber ||
      trip?.bus?.bus_number ||
      "N/A"
    );
  };

  // =====================================================
  // ROUTE
  // =====================================================

  const getFrom = (trip) => {
    return (
      trip?.from ||
      trip?.source ||
      trip?.fromCity ||
      trip?.from_city ||
      trip?.origin ||
      trip?.source_city ||
      "Origin"
    );
  };

  const getTo = (trip) => {
    return (
      trip?.to ||
      trip?.destination ||
      trip?.toCity ||
      trip?.to_city ||
      trip?.dest ||
      trip?.destination_city ||
      "Destination"
    );
  };

  // =====================================================
  // DEPARTURE
  // =====================================================

  const getDeparture = (trip) => {
    return (
      trip?.departure ||
      trip?.departureTime ||
      trip?.departure_time ||
      trip?.bus?.departure ||
      trip?.bus?.departure_time ||
      trip?.train?.departure ||
      trip?.train?.departure_time ||
      "--:--"
    );
  };

  // =====================================================
  // ARRIVAL
  // =====================================================

  const getArrival = (trip) => {
    return (
      trip?.arrival ||
      trip?.arrivalTime ||
      trip?.arrival_time ||
      trip?.bus?.arrival ||
      trip?.bus?.arrival_time ||
      trip?.train?.arrival ||
      trip?.train?.arrival_time ||
      "--:--"
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const getDate = (trip) => {
    const value =
      trip?.formattedDate ||
      trip?.travelDate ||
      trip?.journeyDate ||
      trip?.journey_date ||
      trip?.date;

    if (!value) {
      return "N/A";
    }

    // Backend sends values like:
    // 2026-09-27T00:00:00.000Z

    const dateValue = new Date(value);

    if (!Number.isNaN(dateValue.getTime())) {
      return dateValue.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    return String(value);
  };

  // =====================================================
  // SEATS
  // =====================================================

  const getSeats = (trip) => {
    if (
      Array.isArray(trip?.selectedSeats) &&
      trip.selectedSeats.length > 0
    ) {
      return trip.selectedSeats.join(", ");
    }

    if (
      Array.isArray(trip?.seats) &&
      trip.seats.length > 0
    ) {
      return trip.seats.join(", ");
    }

    if (
      Array.isArray(trip?.passengers) &&
      trip.passengers.length > 0
    ) {
      return trip.passengers
        .map((passenger) => {
          const seat =
            passenger?.seat ||
            passenger?.seatNumber ||
            "N/A";

          if (trip?.coach) {
            return `${trip.coach}-${seat}`;
          }

          return seat;
        })
        .join(", ");
    }

    if (
      trip?.seatNumber !== undefined &&
      trip?.seatNumber !== null
    ) {
      return String(trip.seatNumber);
    }

    if (
      trip?.seats !== undefined &&
      trip?.seats !== null &&
      !Array.isArray(trip.seats)
    ) {
      return String(trip.seats);
    }

    return "N/A";
  };

  // =====================================================
  // PASSENGER COUNT
  // =====================================================

  const getPassengerCount = (trip) => {
    if (
      trip?.passengerCount !== undefined &&
      trip?.passengerCount !== null
    ) {
      return Number(trip.passengerCount);
    }

    if (
      Array.isArray(trip?.passengers) &&
      trip.passengers.length > 0
    ) {
      return trip.passengers.length;
    }

    if (
      Array.isArray(trip?.selectedSeats) &&
      trip.selectedSeats.length > 0
    ) {
      return trip.selectedSeats.length;
    }

    if (
      trip?.seats !== undefined &&
      trip?.seats !== null
    ) {
      const number = Number(trip.seats);

      if (!Number.isNaN(number) && number > 0) {
        return number;
      }
    }

    return 1;
  };

  // =====================================================
  // AMOUNT
  // =====================================================

  const getAmount = (trip) => {
    const amount =
      trip?.totalAmount ??
      trip?.total_amount ??
      trip?.amount ??
      trip?.totalFare ??
      trip?.total_fare ??
      trip?.fare ??
      0;

    const numericAmount = Number(amount);

    return Number.isNaN(numericAmount)
      ? 0
      : numericAmount;
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredBookings = bookings.filter((trip) => {
    const status = getStatus(trip)
      .toLowerCase()
      .trim();

    if (filter === "confirmed") {
      return (
        status === "confirmed" ||
        status === "booked" ||
        status === "paid"
      );
    }

    if (filter === "cancelled") {
      return (
        status === "cancelled" ||
        status === "canceled"
      );
    }

    return true;
  });

  // =====================================================
  // CANCEL TRIP
  // =====================================================

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

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received while cancelling booking."
        );
      }

      console.log(
        "CANCEL BOOKING RESPONSE:",
        data
      );

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message ||
            "Failed to cancel booking."
        );
      }

      await loadBookings();

      setSelectedTrip(null);

      alert(
        "Trip cancelled successfully. You can now request a refund."
      );
    } catch (err) {
      console.error(
        "CANCEL TRIP ERROR:",
        err
      );

      alert(
        err.message ||
          "Unable to cancel the trip."
      );
    }
  };

  // =====================================================
  // REQUEST REFUND
  // =====================================================

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
          String(getBookingId(trip)) ===
          String(bookingId)
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
          String(getBookingId(trip)) ===
          String(bookingId)
      );

    if (currentBooking) {
      setSelectedTrip(currentBooking);

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

    alert(
      "Refund request submitted successfully. Your refund is being processed."
    );
  };

  // =====================================================
  // REFUND STATUS
  // =====================================================

  const getRefundStatus = (trip) => {
    return (
      trip?.refundStatus ||
      "Not Requested"
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

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

            <h2>Loading your trips...</h2>

            <p>
              Please wait while we fetch
              your bookings.
            </p>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================

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

        {/* HERO */}

        <section className="my-trips-hero">
          <div className="my-trips-hero-content">
            <span className="hero-label">
              YOUR JOURNEYS
            </span>

            <h1>
              My <span>Trips</span>
            </h1>

            <p>
              View and manage all your
              SafeSeat bus and train
              bookings in one place.
            </p>
          </div>

          <div className="hero-icon-wrapper">
            <div className="hero-icon">
              🎫
            </div>
          </div>
        </section>

        {/* ERROR */}

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

        {/* CONTROLS */}

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

        {/* EMPTY */}

        {filteredBookings.length === 0 && (
          <section className="empty-trips">
            <div className="empty-trip-icon">
              🎫
            </div>

            <h2>No trips found</h2>

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

        {/* TRIPS */}

        {filteredBookings.length > 0 && (
          <section className="trips-list">
            {filteredBookings.map(
              (trip, index) => {
                const transport =
                  getTransport(trip);

                const status =
                  getStatus(trip);

                const normalizedStatus =
                  status
                    .toLowerCase()
                    .trim();

                const isCancelled =
                  normalizedStatus ===
                    "cancelled" ||
                  normalizedStatus ===
                    "canceled";

                const isTrain =
                  transport === "train";

                const bookingId =
                  getBookingId(trip);

                return (
                  <article
                    className={`trip-card ${
                      isCancelled
                        ? "trip-card-cancelled"
                        : ""
                    }`}
                    key={
                      bookingId || index
                    }
                  >
                    {/* CARD TOP */}

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

                    {/* ROUTE */}

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
                          {getArrival(
                            trip
                          )}
                        </strong>

                        <span>
                          {getTo(trip)}
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}

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

                    {/* FOOTER */}

                    <div className="trip-card-footer">
                      <div className="booking-id">
                        <span>
                          BOOKING ID
                        </span>

                        <strong>
                          {bookingId ||
                            "N/A"}
                        </strong>
                      </div>

                      <div className="trip-actions">
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

                        {!isCancelled && (
                          <button
                            type="button"
                            className="cancel-trip-btn"
                            onClick={() =>
                              cancelTrip(
                                bookingId
                              )
                            }
                          >
                            Cancel Trip
                          </button>
                        )}

                        {isCancelled &&
                          !trip.refundStatus && (
                            <button
                              type="button"
                              className="refund-btn"
                              onClick={() =>
                                requestRefund(
                                  bookingId
                                )
                              }
                            >
                              💰 Request Refund
                            </button>
                          )}

                        {isCancelled &&
                          trip.refundStatus ===
                            "Processing" && (
                            <button
                              type="button"
                              className="refund-processing-btn"
                              disabled
                            >
                              ⏳ Refund
                              Processing
                            </button>
                          )}

                        {isCancelled &&
                          trip.refundStatus ===
                            "Refunded" && (
                            <button
                              type="button"
                              className="refund-completed-btn"
                              disabled
                            >
                              ✓ Refund
                              Completed
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

      {/* TICKET MODAL */}

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

              <div className="ticket-info-grid">
                <div>
                  <span>DATE</span>

                  <strong>
                    {getDate(
                      selectedTrip
                    )}
                  </strong>
                </div>

                <div>
                  <span>CLASS</span>

                  <strong>
                    {selectedTrip.selectedClass ||
                      selectedTrip.trainClass ||
                      selectedTrip.train_class ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>COACH</span>

                  <strong>
                    {selectedTrip.coach ||
                      "N/A"}
                  </strong>
                </div>

                <div>
                  <span>TRAIN NO.</span>

                  <strong>
                    {getTrainNumber(
                      selectedTrip
                    )}
                  </strong>
                </div>
              </div>

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
                          P{index + 1}
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
                            passenger.seatNumber ||
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

              <div className="ticket-bottom">
                <div>
                  <span>
                    BOOKING ID
                  </span>

                  <strong>
                    {getBookingId(
                      selectedTrip
                    ) || "N/A"}
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

              {getStatus(
                selectedTrip
              ).toLowerCase() !==
                "cancelled" &&
                getStatus(
                  selectedTrip
                ).toLowerCase() !==
                  "canceled" && (
                  <button
                    type="button"
                    className="ticket-cancel-btn"
                    onClick={() =>
                      cancelTrip(
                        getBookingId(
                          selectedTrip
                        )
                      )
                    }
                  >
                    Cancel Trip
                  </button>
                )}

              {(getStatus(
                selectedTrip
              ).toLowerCase() ===
                "cancelled" ||
                getStatus(
                  selectedTrip
                ).toLowerCase() ===
                  "canceled") &&
                !selectedTrip.refundStatus && (
                  <button
                    type="button"
                    className="ticket-refund-btn"
                    onClick={() =>
                      requestRefund(
                        getBookingId(
                          selectedTrip
                        )
                      )
                    }
                  >
                    💰 Request Refund
                  </button>
                )}

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