import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SeatSelection.css";
import Footer from "../components/Footer";
const API_URL = "http://localhost:5000";

const DEFAULT_TOTAL_SEATS = 36;

function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchState = location.state || {};

  // =====================================================
  // BUS DATA
  // =====================================================

  const bus = searchState.bus || {
    id: 1,
    operator: "SafeSeat Express",
    busType: "AC Sleeper",
    departure: "20:30",
    arrival: "05:30",
    duration: "09h 00m",
    price: 699,
    totalSeats: DEFAULT_TOTAL_SEATS,
    availableSeats: 12,
  };

  const busId = Number(bus.id);

  const totalSeats =
    Number(bus.totalSeats) || DEFAULT_TOTAL_SEATS;

  // =====================================================
  // ROUTE
  // =====================================================

  const from =
    searchState.from ||
    "Hyderabad";

  const to =
    searchState.to ||
    "Bangalore";

  // =====================================================
  // DATE
  // =====================================================

  const travelDate =
    searchState.travelDate ||
    searchState.date ||
    "";

  const formattedDate =
    searchState.formattedDate ||
    formatDate(travelDate);

  // =====================================================
  // PASSENGER COUNT
  // =====================================================

  const passengerCount =
    Number(
      searchState.passengerCount ??
        searchState.passengers ??
        1
    ) || 1;

  // =====================================================
  // PASSENGERS
  // =====================================================

  const [passengers, setPassengers] =
    useState(() =>
      Array.from(
        {
          length: passengerCount,
        },
        (_, index) => ({
          id: index + 1,
          name: `Passenger ${index + 1}`,
          gender:
            index === 0
              ? "women"
              : "men",
          preference: "none",
          seat: null,
        })
      )
    );

  const [activePassengerId, setActivePassengerId] =
    useState(1);

  // =====================================================
  // REAL OCCUPIED SEATS FROM DATABASE
  // =====================================================

  const [occupiedSeats, setOccupiedSeats] =
    useState({});

  const [loadingSeats, setLoadingSeats] =
    useState(true);

  const [seatError, setSeatError] =
    useState("");

  // =====================================================
  // FETCH OCCUPIED SEATS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    const fetchSeats = async () => {
      try {
        setLoadingSeats(true);
        setSeatError("");

        console.log(
          "Fetching seats for bus:",
          busId
        );

        const response = await fetch(
          `${API_URL}/api/seats/${busId}`
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data = await response.json();

        console.log(
          "Seat API response:",
          data
        );

        if (!data.success) {
          throw new Error(
            data.message ||
              "Unable to fetch seats"
          );
        }

        const seatMap = {};

        (data.occupiedSeats || []).forEach(
          (seat) => {
            seatMap[
              Number(seat.seatNumber)
            ] = {
              gender:
                seat.gender,
              passengerName:
                seat.passengerName,
              bookingId:
                seat.bookingId,
            };
          }
        );

        if (!cancelled) {
          setOccupiedSeats(seatMap);
        }
      } catch (error) {
        console.error(
          "Seat fetching error:",
          error
        );

        if (!cancelled) {
          setSeatError(
            "Unable to load occupied seats."
          );
          setOccupiedSeats({});
        }
      } finally {
        if (!cancelled) {
          setLoadingSeats(false);
        }
      }
    };

    if (busId) {
      fetchSeats();
    }

    return () => {
      cancelled = true;
    };
  }, [busId]);

  // =====================================================
  // ACTIVE PASSENGER
  // =====================================================

  const activePassenger =
    passengers.find(
      (passenger) =>
        passenger.id ===
        activePassengerId
    );

  // =====================================================
  // SEAT POSITION
  // =====================================================

  const getSeatPosition = (
    seatNumber
  ) => {
    return (
      ((seatNumber - 1) % 4) + 1
    );
  };

  // =====================================================
  // SURROUNDING SEATS
  // =====================================================

  const getSurroundingSeats = (
    seatNumber
  ) => {
    const surrounding = [];

    const position =
      getSeatPosition(seatNumber);

    // Left

    if (
      position === 2 ||
      position === 4
    ) {
      surrounding.push(
        seatNumber - 1
      );
    }

    // Right

    if (
      position === 1 ||
      position === 3
    ) {
      surrounding.push(
        seatNumber + 1
      );
    }

    // Previous row

    const previousRowSeat =
      seatNumber - 4;

    if (previousRowSeat >= 1) {
      surrounding.push(
        previousRowSeat
      );
    }

    // Next row

    const nextRowSeat =
      seatNumber + 4;

    if (
      nextRowSeat <= totalSeats
    ) {
      surrounding.push(
        nextRowSeat
      );
    }

    return surrounding.filter(
      (seat) =>
        seat >= 1 &&
        seat <= totalSeats
    );
  };

  // =====================================================
  // PASSENGER AT SEAT
  // =====================================================

  const getPassengerAtSeat = (
    seatNumber
  ) => {
    return passengers.find(
      (passenger) =>
        passenger.seat === seatNumber
    );
  };

  // =====================================================
  // OCCUPANT GENDER
  // =====================================================

  const getOccupantGender = (
    seatNumber
  ) => {
    const selectedPassenger =
      getPassengerAtSeat(
        seatNumber
      );

    if (selectedPassenger) {
      return selectedPassenger.gender;
    }

    return (
      occupiedSeats[seatNumber]
        ?.gender || null
    );
  };

  // =====================================================
  // SAFESEAT MATCH
  // =====================================================

  const isSafeSeatMatch = (
    seatNumber,
    preference
  ) => {
    if (preference === "none") {
      return true;
    }

    const surroundingSeats =
      getSurroundingSeats(
        seatNumber
      );

    const surroundingPassengers =
      surroundingSeats
        .map((seat) => ({
          seat,
          gender:
            getOccupantGender(seat),
        }))
        .filter(
          (item) =>
            item.gender !== null
        );

    if (
      surroundingPassengers.length ===
      0
    ) {
      return true;
    }

    return surroundingPassengers.every(
      (passenger) =>
        passenger.gender ===
        preference
    );
  };

  // =====================================================
  // RECOMMENDED SEATS
  // =====================================================

  const recommendedSeats = useMemo(() => {
    if (!activePassenger) {
      return [];
    }

    return Array.from(
      {
        length: totalSeats,
      },
      (_, index) => index + 1
    ).filter((seatNumber) => {
      const isOccupied =
        Boolean(
          occupiedSeats[seatNumber]
        );

      const selectedByAnotherPassenger =
        passengers.some(
          (passenger) =>
            passenger.seat ===
              seatNumber &&
            passenger.id !==
              activePassengerId
        );

      if (
        isOccupied ||
        selectedByAnotherPassenger
      ) {
        return false;
      }

      return isSafeSeatMatch(
        seatNumber,
        activePassenger.preference
      );
    });
  }, [
    activePassenger,
    activePassengerId,
    passengers,
    occupiedSeats,
    totalSeats,
  ]);

  // =====================================================
  // CHANGE PREFERENCE
  // =====================================================

  const handlePreferenceChange = (
    passengerId,
    preference
  ) => {
    setPassengers(
      (currentPassengers) =>
        currentPassengers.map(
          (passenger) =>
            passenger.id ===
            passengerId
              ? {
                  ...passenger,
                  preference,
                  seat: null,
                }
              : passenger
        )
    );

    setActivePassengerId(
      passengerId
    );
  };

  // =====================================================
  // SELECT SEAT
  // =====================================================

  const handleSeatSelect = (
    seatNumber
  ) => {
    if (!activePassenger) {
      return;
    }

    // Database occupied seat

    if (
      occupiedSeats[seatNumber]
    ) {
      alert(
        `Seat ${seatNumber} is already booked.`
      );

      return;
    }

    // Another passenger selected it

    const selectedByAnotherPassenger =
      passengers.some(
        (passenger) =>
          passenger.id !==
            activePassengerId &&
          passenger.seat ===
            seatNumber
      );

    if (
      selectedByAnotherPassenger
    ) {
      return;
    }

    // Clicking selected seat removes it

    if (
      activePassenger.seat ===
      seatNumber
    ) {
      setPassengers(
        (currentPassengers) =>
          currentPassengers.map(
            (passenger) =>
              passenger.id ===
              activePassengerId
                ? {
                    ...passenger,
                    seat: null,
                  }
                : passenger
          )
      );

      return;
    }

    // Select seat

    setPassengers(
      (currentPassengers) =>
        currentPassengers.map(
          (passenger) =>
            passenger.id ===
            activePassengerId
              ? {
                  ...passenger,
                  seat: seatNumber,
                }
              : passenger
        )
    );
  };

  // =====================================================
  // SEAT CLICK
  // =====================================================

  const handleSeatClick = (
    seatNumber
  ) => {
    if (
      occupiedSeats[seatNumber]
    ) {
      return;
    }

    const anotherPassenger =
      passengers.find(
        (passenger) =>
          passenger.id !==
            activePassengerId &&
          passenger.seat ===
            seatNumber
      );

    if (anotherPassenger) {
      return;
    }

    handleSeatSelect(
      seatNumber
    );
  };

  // =====================================================
  // SEAT CLASS
  // =====================================================

  const getSeatClass = (
    seatNumber
  ) => {
    const databaseSeat =
      occupiedSeats[seatNumber];

    if (databaseSeat) {
      if (
        databaseSeat.gender ===
        "women"
      ) {
        return "seat occupied-women";
      }

      if (
        databaseSeat.gender ===
        "men"
      ) {
        return "seat occupied-men";
      }

      return "seat occupied-seat";
    }

    const selectedPassenger =
      getPassengerAtSeat(
        seatNumber
      );

    if (selectedPassenger) {
      if (
        selectedPassenger.id ===
        activePassengerId
      ) {
        return "seat selected-seat active-passenger-seat";
      }

      return "seat selected-seat other-passenger-seat";
    }

    if (
      activePassenger &&
      isSafeSeatMatch(
        seatNumber,
        activePassenger.preference
      )
    ) {
      return "seat safe-match";
    }

    return "seat available-seat";
  };

  // =====================================================
  // RENDER SEAT
  // =====================================================

  const renderSeat = (
    seatNumber
  ) => {
    const databaseSeat =
      occupiedSeats[seatNumber];

    const selectedPassenger =
      getPassengerAtSeat(
        seatNumber
      );

    const isRecommended =
      !databaseSeat &&
      !selectedPassenger &&
      activePassenger &&
      isSafeSeatMatch(
        seatNumber,
        activePassenger.preference
      );

    const isActivePassengerSeat =
      selectedPassenger?.id ===
      activePassengerId;

    return (
      <button
        key={seatNumber}
        type="button"
        className={`${getSeatClass(
          seatNumber
        )} ${
          isRecommended
            ? "recommended-seat"
            : ""
        }`}
        onClick={() =>
          handleSeatClick(
            seatNumber
          )
        }
        disabled={
          Boolean(databaseSeat) ||
          Boolean(
            selectedPassenger &&
              !isActivePassengerSeat
          )
        }
        title={
          databaseSeat
            ? `${
                databaseSeat.gender ===
                "men"
                  ? "Man"
                  : "Woman"
              } passenger - Booked`
            : isRecommended
            ? "SafeSeat recommendation"
            : "Available seat"
        }
      >
        {selectedPassenger
          ? `P${selectedPassenger.id}`
          : seatNumber}
      </button>
    );
  };

  // =====================================================
  // RENDER ROW
  // =====================================================

  const renderRow = (row) => {
    const seat1 =
      (row - 1) * 4 + 1;

    const seat2 =
      seat1 + 1;

    const seat3 =
      seat1 + 2;

    const seat4 =
      seat1 + 3;

    return (
      <div
        className="seat-row"
        key={row}
      >
        <div className="seat-side">
          {seat1 <= totalSeats &&
            renderSeat(seat1)}

          {seat2 <= totalSeats &&
            renderSeat(seat2)}
        </div>

        <div className="aisle">
          <span>{row}</span>
        </div>

        <div className="seat-side">
          {seat3 <= totalSeats &&
            renderSeat(seat3)}

          {seat4 <= totalSeats &&
            renderSeat(seat4)}
        </div>
      </div>
    );
  };

  // =====================================================
  // CONTINUE
  // =====================================================

  const allPassengersSelected =
    passengers.every(
      (passenger) =>
        passenger.seat !== null
    );

  const handleContinue = () => {
  console.log("=================================");
  console.log("CONTINUE BUTTON CLICKED");
  console.log("Passengers:", passengers);
  console.log("Selected seats:", passengers.map(
    (passenger) => passenger.seat
  ));
  console.log("=================================");

  const allSelected = passengers.every(
    (passenger) => passenger.seat !== null
  );

  if (!allSelected) {
    alert(
      "Please select a seat for every passenger before continuing."
    );
    return;
  }

  const bookingData = {
    bus,
    passengers,

    passengerCount: passengers.length,

    from,
    to,

    date: travelDate,
    travelDate,
    formattedDate,

    selectedSeats: passengers.map(
      (passenger) => Number(passenger.seat)
    ),

    totalAmount:
      Number(bus.price || 0) *
      passengers.length,
  };

  console.log(
    "Navigating to Passenger Details:",
    bookingData
  );

  sessionStorage.setItem(
    "safeSeatBooking",
    JSON.stringify(bookingData)
  );

  navigate("/passenger-details", {
    state: bookingData,
  });
};

  const totalRows =
    Math.ceil(
      totalSeats / 4
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="seat-selection-page">

      {/* NAVBAR */}

      <header className="seat-navbar">

        <div
          className="seat-brand"
          onClick={() =>
            navigate("/")
          }
        >
          <div className="seat-logo">
            S
          </div>

          <div>
            <strong>
              SafeSeat
            </strong>

            <span>
              Travel smarter
            </span>
          </div>
        </div>

        <div className="seat-route">

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
          className="seat-back-button"
          onClick={() =>
            navigate(
              "/results",
              {
                state: {
                  from,
                  to,
                  date: travelDate,
                  passengers:
                    passengers.length,
                },
              }
            )
          }
        >
          ← Back to buses
        </button>

      </header>

      {/* MAIN */}

      <main className="seat-container">

        {/* HEADING */}

        <div className="seat-page-heading">

          <div>

            <span>
              SAFESEAT SELECTION
            </span>

            <h1>
              Choose your seats
            </h1>

            <p>
              Select a preference for every
              passenger. SafeSeat identifies
              compatible surrounding seats.
            </p>

          </div>

          <div className="seat-bus-summary">

            <strong>
              {bus.operator}
            </strong>

            <span>
              {bus.busType} ·{" "}
              {totalSeats} seats
            </span>

          </div>

        </div>

        {/* PASSENGER PREFERENCES */}

        <section className="passenger-preference-card">

          <div className="passenger-preference-header">

            <div className="preference-icon">
              ✦
            </div>

            <div>
              <strong>
                SafeSeat preferences
              </strong>

              <span>
                Set the preferred surroundings
                separately for every passenger.
              </span>
            </div>

          </div>

          <div className="passenger-list">

            {passengers.map(
              (passenger) => (
                <div
                  className={`passenger-preference ${
                    activePassengerId ===
                    passenger.id
                      ? "passenger-active"
                      : ""
                  }`}
                  key={passenger.id}
                >

                  <div className="passenger-info">

                    <div className="passenger-number">
                      {passenger.id}
                    </div>

                    <div>
                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.seat
                          ? `Seat ${passenger.seat} selected`
                          : "Choose a seat"}
                      </span>
                    </div>

                  </div>

                  <div className="passenger-options">

                    <button
                      type="button"
                      className={
                        passenger.preference ===
                        "none"
                          ? "active-none"
                          : ""
                      }
                      onClick={() =>
                        handlePreferenceChange(
                          passenger.id,
                          "none"
                        )
                      }
                    >
                      No preference
                    </button>

                    <button
                      type="button"
                      className={
                        passenger.preference ===
                        "women"
                          ? "active-women"
                          : ""
                      }
                      onClick={() =>
                        handlePreferenceChange(
                          passenger.id,
                          "women"
                        )
                      }
                    >
                      ♀ Women
                    </button>

                    <button
                      type="button"
                      className={
                        passenger.preference ===
                        "men"
                          ? "active-men"
                          : ""
                      }
                      onClick={() =>
                        handlePreferenceChange(
                          passenger.id,
                          "men"
                        )
                      }
                    >
                      ♂ Men
                    </button>

                  </div>

                  <button
                    type="button"
                    className="choose-seat-button"
                    onClick={() =>
                      setActivePassengerId(
                        passenger.id
                      )
                    }
                  >
                    {activePassengerId ===
                    passenger.id
                      ? "Selecting"
                      : "Choose seat"}
                  </button>

                </div>
              )
            )}

          </div>

        </section>

        {/* LAYOUT */}

        <div className="seat-layout">

          {/* SEAT MAP */}

          <section className="seat-map-card">

            <div className="seat-map-header">

              <div>
                <span>
                  {bus.busType}
                </span>

                <h2>
                  Seat layout
                </h2>
              </div>

              <div className="seat-count">
                {totalSeats} seats
              </div>

            </div>

            {/* LOADING */}

            {loadingSeats && (
              <div className="seat-loading">
                Loading current seat availability...
              </div>
            )}

            {/* ERROR */}

            {seatError && (
              <div className="seat-error">
                {seatError}
              </div>
            )}

            {/* ACTIVE PASSENGER */}

            {activePassenger && (
              <div className="active-passenger-banner">

                <div className="active-passenger-circle">
                  P{activePassenger.id}
                </div>

                <div>

                  <strong>
                    Selecting for{" "}
                    {activePassenger.name}
                  </strong>

                  <span>
                    Preference:{" "}
                    {activePassenger.preference ===
                    "men"
                      ? "Men surroundings"
                      : activePassenger.preference ===
                        "women"
                      ? "Women surroundings"
                      : "No preference"}
                  </span>

                </div>

                <div className="recommended-count">
                  {recommendedSeats.length}{" "}
                  recommended
                </div>

              </div>
            )}

            {/* DRIVER */}

            <div className="driver-area">

              <div className="driver-wheel">
                ◉
              </div>

              <span>
                DRIVER
              </span>

            </div>

            {/* SEAT MAP */}

            <div className="bus-seat-map">

              <div className="seat-column-labels">

                <span>A</span>

                <span>B</span>

                <span></span>

                <span>C</span>

                <span>D</span>

              </div>

              {Array.from(
                {
                  length: totalRows,
                },
                (_, index) =>
                  renderRow(
                    index + 1
                  )
              )}

            </div>

            {/* LEGEND */}

            <div className="seat-legend">

              <div>
                <span className="legend available"></span>
                Available
              </div>

              <div>
                <span className="legend selected"></span>
                Selected
              </div>

              <div>
                <span className="legend women"></span>
                Woman booked
              </div>

              <div>
                <span className="legend men"></span>
                Man booked
              </div>

              <div>
                <span className="legend safe"></span>
                SafeSeat match
              </div>

            </div>

          </section>

          {/* SUMMARY */}

          <aside className="booking-summary-card">

            <div className="summary-top">

              <span>
                BOOKING SUMMARY
              </span>

              <strong>
                {passengers.length}{" "}
                passenger
                {passengers.length > 1
                  ? "s"
                  : ""}
              </strong>

            </div>

            {/* PASSENGERS */}

            <div className="summary-passengers">

              {passengers.map(
                (passenger) => (
                  <div
                    key={passenger.id}
                    className={`summary-passenger ${
                      activePassengerId ===
                      passenger.id
                        ? "summary-passenger-active"
                        : ""
                    }`}
                    onClick={() =>
                      setActivePassengerId(
                        passenger.id
                      )
                    }
                  >

                    <div className="summary-passenger-number">
                      P{passenger.id}
                    </div>

                    <div className="summary-passenger-info">

                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.preference ===
                        "men"
                          ? "Men surroundings"
                          : passenger.preference ===
                            "women"
                          ? "Women surroundings"
                          : "No preference"}
                      </span>

                    </div>

                    <div className="summary-passenger-seat">

                      {passenger.seat ? (
                        <>
                          <strong>
                            {passenger.seat}
                          </strong>

                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              setPassengers(
                                (current) =>
                                  current.map(
                                    (item) =>
                                      item.id ===
                                      passenger.id
                                        ? {
                                            ...item,
                                            seat: null,
                                          }
                                        : item
                                  )
                              );

                              setActivePassengerId(
                                passenger.id
                              );
                            }}
                          >
                            Change
                          </button>
                        </>
                      ) : (
                        <span>
                          --
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>

            <div className="summary-divider"></div>

            {/* ROUTE */}

            <div className="summary-route">

              <div>
                <strong>
                  {bus.departure}
                </strong>

                <span>
                  {from}
                </span>
              </div>

              <div className="summary-line">
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

            <div className="summary-date">

              <span>
                Travel date
              </span>

              <strong>
                {formattedDate}
              </strong>

            </div>

            {/* PRICE */}

            <div className="summary-price">

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
              className="continue-button"
              disabled={
                !allPassengersSelected ||
                loadingSeats
              }
              onClick={
                handleContinue
              }
            >
              {loadingSeats
                ? "Loading seats..."
                : allPassengersSelected
                ? "Continue to passenger details"
                : "Select all passenger seats"}

              <span>
                →
              </span>

            </button>

            <p className="booking-note">
              SafeSeat recommendations are based
              on currently available surrounding
              passenger information.
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
export default SeatSelection;