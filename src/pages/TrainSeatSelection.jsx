import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./TrainSeatSelection.css";
import Footer from "../components/Footer";

/* =====================================================
   TRAIN COACH DATA
===================================================== */

const coachData = {
  "AC Chair Car": {
    prefix: "C1",
    price: 850,
    rows: 8,
    type: "chair",
  },

  Sleeper: {
    prefix: "S1",
    price: 520,
    rows: 8,
    type: "berth",
  },

  "3A": {
    prefix: "B1",
    price: 1250,
    rows: 8,
    type: "berth",
  },

  "2A": {
    prefix: "A1",
    price: 1850,
    rows: 6,
    type: "berth",
  },
};

/* =====================================================
   ALREADY OCCUPIED SEATS
===================================================== */

const initialOccupiedSeats = {
  "C1-2": "women",
  "C1-5": "men",
  "C1-8": "women",
  "C1-13": "men",
  "C1-17": "women",
  "C1-22": "men",
  "C1-27": "women",
  "C1-31": "men",

  "S1-3": "men",
  "S1-7": "women",
  "S1-12": "men",
  "S1-18": "women",

  "B1-4": "men",
  "B1-9": "women",
  "B1-15": "men",
  "B1-21": "women",

  "A1-2": "men",
  "A1-5": "women",
  "A1-9": "men",
};

/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(dateString) {
  if (!dateString) {
    return "Select travel date";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =====================================================
   COMPONENT
===================================================== */

function TrainSeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trainId } = useParams();

  /* ===================================================
     STORED BOOKING
  =================================================== */

  let storedBooking = null;

  try {
    storedBooking = JSON.parse(
      sessionStorage.getItem("safeSeatBooking") || "null"
    );
  } catch {
    storedBooking = null;
  }

  const searchState =
    location.state || storedBooking || {};

  const train = searchState.train;

  const from =
    searchState.from || "Hyderabad";

  const to =
    searchState.to || "Bengaluru";

  const travelDate =
    searchState.travelDate ||
    searchState.date ||
    "";

  const formattedDate =
    searchState.formattedDate ||
    formatDate(travelDate);

  const passengerCount =
    Number(
      searchState.passengerCount ??
        searchState.passengers ??
        1
    ) || 1;

  /* ===================================================
     SELECTED CLASS
  =================================================== */

  const [selectedClass, setSelectedClass] =
    useState(() => {
      if (
        train &&
        train.class &&
        coachData[train.class]
      ) {
        return train.class;
      }

      return "AC Chair Car";
    });

  /* ===================================================
     PASSENGERS
  =================================================== */

  const [passengers, setPassengers] =
    useState(() =>
      Array.from(
        {
          length: passengerCount,
        },
        (_, index) => ({
          id: index + 1,
          name: `Passenger ${index + 1}`,
          gender: null,
          preference: "none",
          seat: null,
        })
      )
    );

  const [activePassengerId, setActivePassengerId] =
    useState(1);

  /* ===================================================
     CURRENT COACH
  =================================================== */

  const currentCoach =
    coachData[selectedClass];

  /* ===================================================
     CREATE SEAT LAYOUT
     
     Sleeper / 3A:
       LB
       MB
       UB
       SL
       SU

     2A:
       LB
       UB
       SL
       SU

     Chair:
       6 chairs per row
  =================================================== */

  const seatLayout = useMemo(() => {
    const coach =
      coachData[selectedClass];

    const seats = [];

    /* ===============================================
       AC CHAIR CAR
    =============================================== */

    if (coach.type === "chair") {
      let number = 1;

      for (
        let row = 1;
        row <= coach.rows;
        row++
      ) {
        for (
          let position = 1;
          position <= 6;
          position++
        ) {
          seats.push({
            number,
            type: "CHAIR",
            label: `${number}`,
            row,
            bay: row,
            side:
              position <= 3
                ? "left"
                : "right",
            position,
          });

          number++;
        }
      }

      return seats;
    }

    /* ===============================================
       SLEEPER / 3A / 2A
    =============================================== */

    let number = 1;

    for (
      let bay = 1;
      bay <= coach.rows;
      bay++
    ) {
      const berthTypes =
        selectedClass === "2A"
          ? ["LB", "UB", "SL", "SU"]
          : ["LB", "MB", "UB", "SL", "SU"];

      berthTypes.forEach(
        (type) => {
          seats.push({
            number,
            type,
            label: `${type} ${number}`,
            row: bay,
            bay,
            side:
              type === "SL" ||
              type === "SU"
                ? "side"
                : "main",
          });

          number++;
        }
      );
    }

    return seats;
  }, [selectedClass]);

  const totalSeats =
    seatLayout.length;

  /* ===================================================
     GET SEAT ID
  =================================================== */

  const getSeatId = (
    seatNumber
  ) =>
    `${currentCoach.prefix}-${seatNumber}`;

  /* ===================================================
     GET SEAT OBJECT
  =================================================== */

  const getSeat = (
    seatNumber
  ) =>
    seatLayout.find(
      (seat) =>
        seat.number === seatNumber
    );

  /* ===================================================
     GET PASSENGER AT SEAT
  =================================================== */

  const getPassengerAtSeat = (
    seatNumber
  ) =>
    passengers.find(
      (passenger) =>
        passenger.seat ===
        seatNumber
    );

  /* ===================================================
     GET OCCUPANT GENDER
  =================================================== */

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
      initialOccupiedSeats[
        getSeatId(seatNumber)
      ] || null
    );
  };

  /* ===================================================
     GET SURROUNDING SEATS

     SafeSeat now checks seats in the same bay
     rather than simply checking number +/- 1.
  =================================================== */

  const getSurroundingSeats = (
    seatNumber
  ) => {
    const currentSeat =
      getSeat(seatNumber);

    if (!currentSeat) {
      return [];
    }

    /* ===============================================
       CHAIR CAR
    =============================================== */

    if (
      currentSeat.type === "CHAIR"
    ) {
      return seatLayout
        .filter(
          (seat) =>
            seat.row ===
              currentSeat.row &&
            seat.number !==
              seatNumber &&
            Math.abs(
              seat.position -
                currentSeat.position
            ) <= 1
        )
        .map(
          (seat) =>
            seat.number
        );
    }

    /* ===============================================
       BERTH COACH
    =============================================== */

    const surrounding = [];

    const sameBay =
      seatLayout.filter(
        (seat) =>
          seat.bay ===
            currentSeat.bay &&
          seat.number !==
            seatNumber
      );

    /* Main berths */

    if (
      currentSeat.side ===
      "main"
    ) {
      sameBay
        .filter(
          (seat) =>
            seat.side === "main"
        )
        .forEach(
          (seat) =>
            surrounding.push(
              seat.number
            )
        );

      /* Side berths */

      sameBay
        .filter(
          (seat) =>
            seat.side === "side"
        )
        .forEach(
          (seat) =>
            surrounding.push(
              seat.number
            )
        );
    }

    /* Side berths */

    else {
      sameBay
        .filter(
          (seat) =>
            seat.side === "side"
        )
        .forEach(
          (seat) =>
            surrounding.push(
              seat.number
            )
        );

      sameBay
        .filter(
          (seat) =>
            seat.side === "main"
        )
        .forEach(
          (seat) =>
            surrounding.push(
              seat.number
            )
        );
    }

    /* Nearby bay */

    seatLayout
      .filter(
        (seat) =>
          Math.abs(
            seat.bay -
              currentSeat.bay
          ) === 1 &&
          seat.side ===
            currentSeat.side &&
          seat.number !==
            seatNumber
      )
      .forEach(
        (seat) =>
          surrounding.push(
            seat.number
          )
      );

    return [
      ...new Set(surrounding),
    ];
  };

  /* ===================================================
     SAFESEAT MATCH
  =================================================== */

  const isSafeSeatMatch = (
    seatNumber,
    preference
  ) => {
    if (
      !preference ||
      preference === "none"
    ) {
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
            getOccupantGender(
              seat
            ),
        }))
        .filter(
          (item) =>
            item.gender !==
            null
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

  /* ===================================================
     ACTIVE PASSENGER
  =================================================== */

  const activePassenger =
    passengers.find(
      (passenger) =>
        passenger.id ===
        activePassengerId
    );

  /* ===================================================
     RECOMMENDED SEATS
  =================================================== */

  const recommendedSeats =
    useMemo(() => {
      if (!activePassenger) {
        return [];
      }

      return seatLayout
        .map(
          (seat) =>
            seat.number
        )
        .filter(
          (seatNumber) => {
            const occupied =
              initialOccupiedSeats[
                getSeatId(
                  seatNumber
                )
              ];

            if (occupied) {
              return false;
            }

            const selectedByAnother =
              passengers.some(
                (passenger) =>
                  passenger.id !==
                    activePassengerId &&
                  passenger.seat ===
                    seatNumber
              );

            if (
              selectedByAnother
            ) {
              return false;
            }

            return isSafeSeatMatch(
              seatNumber,
              activePassenger.preference
            );
          }
        );
    }, [
      activePassenger,
      activePassengerId,
      passengers,
      selectedClass,
      seatLayout,
    ]);

  /* ===================================================
     CHANGE CLASS
  =================================================== */

  const handleClassChange = (
    className
  ) => {
    setSelectedClass(
      className
    );

    setPassengers(
      (currentPassengers) =>
        currentPassengers.map(
          (passenger) => ({
            ...passenger,
            seat: null,
          })
        )
    );

    setActivePassengerId(1);
  };

  /* ===================================================
     PREFERENCE CHANGE
  =================================================== */

  const handlePreferenceChange = (
    passengerId,
    preference
  ) => {
    setPassengers(
      (currentPassengers) =>
        currentPassengers.map(
          (passenger) => {
            if (
              passenger.id !==
              passengerId
            ) {
              return passenger;
            }

            let gender =
              passenger.gender;

            if (
              preference ===
              "women"
            ) {
              gender = "women";
            }

            if (
              preference ===
              "men"
            ) {
              gender = "men";
            }

            if (
              preference ===
              "none"
            ) {
              gender = null;
            }

            return {
              ...passenger,
              gender,
              preference,
              seat: null,
            };
          }
        )
    );

    setActivePassengerId(
      passengerId
    );
  };

  /* ===================================================
     SEAT CLICK
  =================================================== */

  const handleSeatClick = (
    seatNumber
  ) => {
    if (!activePassenger) {
      return;
    }

    const seatId =
      getSeatId(seatNumber);

    /* Already occupied */

    if (
      initialOccupiedSeats[
        seatId
      ]
    ) {
      return;
    }

    /* Selected by another passenger */

    const selectedByAnother =
      passengers.some(
        (passenger) =>
          passenger.id !==
            activePassengerId &&
          passenger.seat ===
            seatNumber
      );

    if (
      selectedByAnother
    ) {
      return;
    }

    setPassengers(
      (currentPassengers) =>
        currentPassengers.map(
          (passenger) => {
            if (
              passenger.id !==
              activePassengerId
            ) {
              return passenger;
            }

            return {
              ...passenger,
              seat:
                passenger.seat ===
                seatNumber
                  ? null
                  : seatNumber,
            };
          }
        )
    );
  };

  /* ===================================================
     SEAT CSS CLASS
  =================================================== */

  const getSeatClass = (
    seatNumber
  ) => {
    const originalGender =
      initialOccupiedSeats[
        getSeatId(seatNumber)
      ];

    if (
      originalGender ===
      "women"
    ) {
      return "train-seat occupied-women";
    }

    if (
      originalGender ===
      "men"
    ) {
      return "train-seat occupied-men";
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
        return "train-seat selected-seat active-passenger-seat";
      }

      return "train-seat selected-seat other-passenger-seat";
    }

    if (
      activePassenger &&
      isSafeSeatMatch(
        seatNumber,
        activePassenger.preference
      )
    ) {
      return "train-seat safe-match";
    }

    return "train-seat available-seat";
  };

  /* ===================================================
     RENDER BERTH
  =================================================== */

  const renderBerth = (
    seat
  ) => {
    const seatNumber =
      seat.number;

    const seatId =
      getSeatId(seatNumber);

    const occupant =
      initialOccupiedSeats[
        seatId
      ];

    const selectedPassenger =
      getPassengerAtSeat(
        seatNumber
      );

    const recommended =
      !occupant &&
      !selectedPassenger &&
      activePassenger &&
      isSafeSeatMatch(
        seatNumber,
        activePassenger.preference
      );

    const activeSeat =
      selectedPassenger?.id ===
      activePassengerId;

    return (
      <button
        key={seatNumber}
        type="button"
        className={`${getSeatClass(
          seatNumber
        )} berth-${seat.type.toLowerCase()} ${
          recommended
            ? "recommended-seat"
            : ""
        }`}
        onClick={() =>
          handleSeatClick(
            seatNumber
          )
        }
        disabled={
          Boolean(occupant) ||
          Boolean(
            selectedPassenger &&
              !activeSeat
          )
        }
        title={
          occupant
            ? occupant ===
              "men"
              ? "Occupied by a man"
              : "Occupied by a woman"
            : recommended
            ? "SafeSeat recommended berth"
            : "Available berth"
        }
      >
        <span className="berth-type">
          {seat.type}
        </span>

        <span className="berth-number">
          {selectedPassenger
            ? `P${selectedPassenger.id}`
            : seatNumber}
        </span>
      </button>
    );
  };

  /* ===================================================
     RENDER CHAIR
  =================================================== */

  const renderChair = (
    seat
  ) => {
    const seatNumber =
      seat.number;

    const occupant =
      initialOccupiedSeats[
        getSeatId(seatNumber)
      ];

    const selectedPassenger =
      getPassengerAtSeat(
        seatNumber
      );

    const recommended =
      !occupant &&
      !selectedPassenger &&
      activePassenger &&
      isSafeSeatMatch(
        seatNumber,
        activePassenger.preference
      );

    const activeSeat =
      selectedPassenger?.id ===
      activePassengerId;

    return (
      <button
        key={seatNumber}
        type="button"
        className={`${getSeatClass(
          seatNumber
        )} chair-seat ${
          recommended
            ? "recommended-seat"
            : ""
        }`}
        onClick={() =>
          handleSeatClick(
            seatNumber
          )
        }
        disabled={
          Boolean(occupant) ||
          Boolean(
            selectedPassenger &&
              !activeSeat
          )
        }
        title={
          occupant
            ? occupant ===
              "men"
              ? "Occupied by a man"
              : "Occupied by a woman"
            : recommended
            ? "SafeSeat recommended seat"
            : "Available seat"
        }
      >
        <span className="chair-seat-number">
          {selectedPassenger
            ? `P${selectedPassenger.id}`
            : seatNumber}
        </span>
      </button>
    );
  };

  /* ===================================================
     RENDER BERTH BAY
  =================================================== */

  const renderBerthBay = (
    bay
  ) => {
    const baySeats =
      seatLayout.filter(
        (seat) =>
          seat.bay === bay
      );

    const mainSeats =
      baySeats.filter(
        (seat) =>
          seat.side === "main"
      );

    const sideSeats =
      baySeats.filter(
        (seat) =>
          seat.side === "side"
      );

    return (
      <div
        className="real-train-bay"
        key={bay}
      >
        <div className="bay-number">
          BAY {bay}
        </div>

        <div className="bay-content">

          {/* MAIN BERTHS */}

          <div className="main-berth-area">
            {mainSeats
              .filter(
                (seat) =>
                  seat.type ===
                  "UB"
              )
              .map(
                renderBerth
              )}

            {mainSeats
              .filter(
                (seat) =>
                  seat.type ===
                  "MB"
              )
              .map(
                renderBerth
              )}

            {mainSeats
              .filter(
                (seat) =>
                  seat.type ===
                  "LB"
              )
              .map(
                renderBerth
              )}
          </div>

          {/* PASSAGE */}

          <div className="berth-aisle">
            <span>
              PASSAGE
            </span>
          </div>

          {/* SIDE BERTHS */}

          <div className="side-berth-area">
            {sideSeats
              .filter(
                (seat) =>
                  seat.type ===
                  "SU"
              )
              .map(
                renderBerth
              )}

            {sideSeats
              .filter(
                (seat) =>
                  seat.type ===
                  "SL"
              )
              .map(
                renderBerth
              )}
          </div>
        </div>
      </div>
    );
  };

  /* ===================================================
     RENDER CHAIR COACH
  =================================================== */

  const renderChairCoach = () => {
    return (
      <div className="chair-coach-layout">
        {Array.from(
          {
            length:
              currentCoach.rows,
          },
          (_, index) => {
            const row =
              index + 1;

            const rowSeats =
              seatLayout.filter(
                (seat) =>
                  seat.row === row
              );

            return (
              <div
                className="chair-row"
                key={row}
              >
                <div className="chair-group">
                  {rowSeats
                    .slice(0, 3)
                    .map(
                      renderChair
                    )}
                </div>

                <div className="chair-aisle">
                  {row}
                </div>

                <div className="chair-group">
                  {rowSeats
                    .slice(3, 6)
                    .map(
                      renderChair
                    )}
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  };

  /* ===================================================
     PASSENGER VALIDATION
  =================================================== */

  const allPassengersSelected =
    passengers.every(
      (passenger) =>
        passenger.seat !==
        null
    );

  const totalFare =
    Number(currentCoach.price) *
    passengers.length;

  /* ===================================================
     CONTINUE
  =================================================== */

  const handleContinue = () => {
    if (!allPassengersSelected) {
      alert(
        "Please select a seat for every passenger."
      );
      return;
    }

    const missingGender =
      passengers.some(
        (passenger) =>
          !passenger.gender
      );

    if (missingGender) {
      alert(
        "Please select gender for every passenger."
      );
      return;
    }

    const bookingData = {
      mode: "train",
      transportMode: "train",
      type: "train",

      train,
      trainId,

      selectedClass,

      coach:
        currentCoach.prefix,

      passengers,

      passengerCount:
        passengers.length,

      from,
      to,

      date: travelDate,
      travelDate,

      formattedDate,

      selectedSeats:
        passengers.map(
          (passenger) =>
            passenger.seat
        ),

      fare:
        currentCoach.price,

      totalAmount:
        totalFare,
    };

    sessionStorage.setItem(
      "safeSeatBooking",
      JSON.stringify(
        bookingData
      )
    );

    navigate(
      "/train-passenger-details",
      {
        state: bookingData,
      }
    );
  };

  /* ===================================================
     TRAIN NOT FOUND
  =================================================== */

  if (!train) {
    return (
      <div className="train-seat-error">
        <div className="train-seat-error-card">

          <div className="error-icon">
            !
          </div>

          <h2>
            Train details not found
          </h2>

          <p>
            Your train information
            could not be loaded.
            Please select a train
            again.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/train-results",
                {
                  state: {
                    from,
                    to,
                    date:
                      travelDate,
                    passengers:
                      passengerCount,
                  },
                }
              )
            }
          >
            ← Back to Trains
          </button>

        </div>
      </div>
    );
  }

  /* ===================================================
     UI
  =================================================== */

  return (
    <div className="train-seat-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="train-seat-navbar">

        <div
          className="train-seat-brand"
          onClick={() =>
            navigate("/home")
          }
        >
          <div className="train-seat-logo">
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

        <div className="train-seat-route">
          <strong>
            {from} → {to}
          </strong>

          <span>
            {formattedDate} ·{" "}
            {passengers.length}{" "}
            Passenger
            {passengers.length >
            1
              ? "s"
              : ""}
          </span>
        </div>

        <button
          type="button"
          className="train-back-button"
          onClick={() =>
            navigate(
              "/train-results",
              {
                state: {
                  from,
                  to,
                  date:
                    travelDate,
                  passengers:
                    passengerCount,
                },
              }
            )
          }
        >
          ← Back to trains
        </button>

      </header>

      <main className="train-seat-container">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="train-seat-heading">

          <div>
            <span>
              SAFESEAT SELECTION
            </span>

            <h1>
              Choose your seats
            </h1>

            <p>
              Select a preference for
              every passenger. SafeSeat
              will identify compatible
              surrounding seats.
            </p>
          </div>

          <div className="train-summary-box">

            <strong>
              {train.name}
            </strong>

            <span>
              Train {train.number}
            </span>

            <small>
              {train.departure} →{" "}
              {train.arrival}
            </small>

          </div>

        </div>

        {/* =================================================
            CLASS
        ================================================= */}

        <section className="train-class-card">

          <div className="train-class-header">

            <div>
              <span>
                TRAVEL CLASS
              </span>

              <h2>
                Choose your class
              </h2>
            </div>

            <div className="coach-number">
              Coach{" "}
              {currentCoach.prefix}
            </div>

          </div>

          <div className="train-class-options">

            {Object.entries(
              coachData
            ).map(
              ([className, data]) => (
                <button
                  key={className}
                  type="button"
                  className={
                    selectedClass ===
                    className
                      ? "train-class-option active"
                      : "train-class-option"
                  }
                  onClick={() =>
                    handleClassChange(
                      className
                    )
                  }
                >
                  <strong>
                    {className}
                  </strong>

                  <span>
                    ₹
                    {data.price.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <small>
                    per passenger
                  </small>
                </button>
              )
            )}

          </div>
        </section>

        {/* =================================================
            SAFESEAT PREFERENCES
        ================================================= */}

        <section className="train-passenger-preference-card">

          <div className="train-preference-header">

            <div className="train-preference-icon">
              ✦
            </div>

            <div>
              <strong>
                SafeSeat preferences
              </strong>

              <span>
                Select the gender preference
                for every passenger.
              </span>
            </div>

          </div>

          <div className="train-passenger-list">

            {passengers.map(
              (passenger) => (
                <div
                  key={passenger.id}
                  className={`train-passenger-preference ${
                    activePassengerId ===
                    passenger.id
                      ? "train-passenger-active"
                      : ""
                  }`}
                >

                  <div className="train-passenger-info">

                    <div className="train-passenger-number">
                      {passenger.id}
                    </div>

                    <div>
                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.seat
                          ? `Seat ${currentCoach.prefix}-${passenger.seat} selected`
                          : "Choose a seat"}
                      </span>
                    </div>

                  </div>

                  <div className="train-passenger-options">

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
                    className="train-choose-seat-button"
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

        {/* =================================================
            SEAT MAP + SUMMARY
        ================================================= */}

        <div className="train-seat-layout">

          {/* =================================================
              SEAT MAP
          ================================================= */}

          <section className="train-seat-map-card">

            <div className="train-map-header">

              <div>
                <span>
                  COACH{" "}
                  {currentCoach.prefix}
                </span>

                <h2>
                  {selectedClass}
                </h2>
              </div>

              <div className="train-seat-count">
                {
                  passengers.filter(
                    (passenger) =>
                      passenger.seat !==
                      null
                  ).length
                }
                /
                {passengers.length}{" "}
                selected
              </div>

            </div>

            {/* ACTIVE PASSENGER */}

            {activePassenger && (
              <div className="active-train-passenger">

                <div className="active-train-passenger-circle">
                  P
                  {activePassenger.id}
                </div>

                <div>

                  <strong>
                    Selecting for{" "}
                    {activePassenger.name}
                  </strong>

                  <span>
                    Gender:{" "}
                    {activePassenger.gender ===
                    "men"
                      ? "Male"
                      : activePassenger.gender ===
                        "women"
                      ? "Female"
                      : "Not selected"}

                    {" · "}

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

                <div className="train-recommended-count">
                  {
                    recommendedSeats.length
                  }{" "}
                  recommended
                </div>

              </div>
            )}

            {/* COACH FRONT */}

            <div className="train-coach-front">

              <div className="train-front-icon">
                🚆
              </div>

              <span>
                COACH FRONT
              </span>

            </div>

            {/* BERTH TYPE LEGEND */}

            {currentCoach.type ===
              "berth" && (
              <div className="berth-type-legend">

                <span>
                  <b>LB</b> Lower
                </span>

                {selectedClass !==
                  "2A" && (
                  <span>
                    <b>MB</b> Middle
                  </span>
                )}

                <span>
                  <b>UB</b> Upper
                </span>

                <span>
                  <b>SL</b> Side Lower
                </span>

                <span>
                  <b>SU</b> Side Upper
                </span>

              </div>
            )}

            {/* ACTUAL COACH */}

            <div className="real-train-coach">

              {currentCoach.type ===
              "berth"
                ? Array.from(
                    {
                      length:
                        currentCoach.rows,
                    },
                    (_, index) =>
                      renderBerthBay(
                        index + 1
                      )
                  )
                : renderChairCoach()}

            </div>

            {/* COACH BACK */}

            <div className="train-coach-back">
              COACH BACK
            </div>

            {/* LEGEND */}

            <div className="train-seat-legend">

              <div>
                <span className="train-legend available"></span>
                Available
              </div>

              <div>
                <span className="train-legend selected"></span>
                Selected
              </div>

              <div>
                <span className="train-legend women"></span>
                Woman
              </div>

              <div>
                <span className="train-legend men"></span>
                Man
              </div>

              <div>
                <span className="train-legend safe"></span>
                SafeSeat match
              </div>

            </div>

          </section>

          {/* =================================================
              BOOKING SUMMARY
          ================================================= */}

          <aside className="train-booking-summary">

            <div className="train-summary-top">

              <span>
                BOOKING SUMMARY
              </span>

              <strong>
                {passengers.length}{" "}
                passenger
                {passengers.length >
                1
                  ? "s"
                  : ""}
              </strong>

            </div>

            <div className="train-summary-passengers">

              {passengers.map(
                (passenger) => (
                  <div
                    key={passenger.id}
                    className={`train-summary-passenger ${
                      activePassengerId ===
                      passenger.id
                        ? "train-summary-passenger-active"
                        : ""
                    }`}
                    onClick={() =>
                      setActivePassengerId(
                        passenger.id
                      )
                    }
                  >

                    <div className="train-summary-passenger-number">
                      P
                      {passenger.id}
                    </div>

                    <div className="train-summary-passenger-info">

                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.gender ===
                        "men"
                          ? "Male"
                          : passenger.gender ===
                            "women"
                          ? "Female"
                          : "Gender not selected"}
                      </span>

                    </div>

                    <div className="train-summary-passenger-seat">

                      {passenger.seat ? (
                        <>
                          <strong>
                            {
                              currentCoach.prefix
                            }
                            -
                            {
                              getSeat(
                                passenger.seat
                              )?.type
                            }{" "}
                            {
                              passenger.seat
                            }
                          </strong>

                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              setPassengers(
                                (
                                  current
                                ) =>
                                  current.map(
                                    (
                                      item
                                    ) =>
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

            <div className="train-summary-divider"></div>

            {/* ROUTE */}

            <div className="train-summary-route">

              <div>
                <strong>
                  {train.departure}
                </strong>

                <span>
                  {from}
                </span>
              </div>

              <div className="train-summary-arrow">
                →
              </div>

              <div>
                <strong>
                  {train.arrival}
                </strong>

                <span>
                  {to}
                </span>
              </div>

            </div>

            {/* DATE */}

            <div className="train-summary-date">

              <span>
                Travel date
              </span>

              <strong>
                {formattedDate}
              </strong>

            </div>

            {/* CLASS */}

            <div className="train-summary-class">

              <span>
                Class
              </span>

              <strong>
                {selectedClass}
              </strong>

            </div>

            {/* PRICE */}

            <div className="train-summary-price">

              <span>
                Total fare
              </span>

              <strong>
                ₹
                {totalFare.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            {/* CONTINUE */}

            <button
              type="button"
              className="train-continue-button"
              disabled={
                !allPassengersSelected
              }
              onClick={
                handleContinue
              }
            >
              {allPassengersSelected
                ? "Continue to passenger details"
                : "Select all passenger seats"}

              <span>
                →
              </span>

            </button>

            <p className="train-booking-note">
              SafeSeat recommendations
              are based on currently
              available surrounding
              passenger information.
            </p>

          </aside>

        </div>

      </main>

      <Footer />

    </div>
  );
}

export default TrainSeatSelection;