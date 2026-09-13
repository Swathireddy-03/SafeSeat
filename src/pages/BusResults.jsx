import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./BusResults.css";
import Footer from "../components/Footer";

function BusResults() {
  const navigate = useNavigate();
  const location = useLocation();

  // =====================================
  // SEARCH DATA
  // =====================================

  const searchData = location.state || {};

  let savedSearch = {};

  try {
    savedSearch = JSON.parse(
      sessionStorage.getItem("safeSeatSearch") || "{}"
    );
  } catch (error) {
    savedSearch = {};
  }

  const from =
    searchData.from ||
    savedSearch.from ||
    "Hyderabad";

  const to =
    searchData.to ||
    savedSearch.to ||
    "Bangalore";

  const travelDate =
    searchData.date ||
    searchData.travelDate ||
    savedSearch.date ||
    savedSearch.travelDate ||
    new Date().toISOString().split("T")[0];

  const passengers =
    Number(
      searchData.passengers ??
        searchData.passengerCount ??
        savedSearch.passengers ??
        savedSearch.passengerCount ??
        1
    ) || 1;

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatTravelDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formattedDate =
    formatTravelDate(travelDate);

  // =====================================
  // SAVE SEARCH
  // =====================================

  useEffect(() => {
    sessionStorage.setItem(
      "safeSeatSearch",
      JSON.stringify({
        from,
        to,
        date: travelDate,
        passengers,
      })
    );
  }, [
    from,
    to,
    travelDate,
    passengers,
  ]);

  // =====================================
  // STATE
  // =====================================

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTypes, setSelectedTypes] =
    useState([]);

  const [selectedDeparture, setSelectedDeparture] =
    useState([]);

  const [selectedSafety, setSelectedSafety] =
    useState([]);

  const [sortBy, setSortBy] =
    useState("recommended");

  // =====================================
  // SEARCH BUS API
  // =====================================

  useEffect(() => {
    const searchBuses = async () => {
      try {
        setLoading(true);
        setError("");

        /*
          Database contains:
          Bangalore

          Home page may send:
          Bengaluru

          Convert Bengaluru to Bangalore
          before calling backend.
        */

        const searchFrom =
          from.trim().toLowerCase() ===
          "bengaluru"
            ? "Bangalore"
            : from.trim();

        const searchTo =
          to.trim().toLowerCase() ===
          "bengaluru"
            ? "Bangalore"
            : to.trim();

        const API_URL =
          `http://localhost:5000/api/buses/search` +
          `?from=${encodeURIComponent(searchFrom)}` +
          `&to=${encodeURIComponent(searchTo)}`;

        console.log(
          "Searching buses:",
          searchFrom,
          "→",
          searchTo
        );

        console.log(
          "API URL:",
          API_URL
        );

        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "Bus API response:",
          data
        );

        if (
          data.success &&
          Array.isArray(data.buses)
        ) {
          setBuses(data.buses);
        } else {
          setBuses([]);
        }
      } catch (err) {
        console.error(
          "Bus search error:",
          err
        );

        setError(
          "Unable to load buses. Please make sure the backend server is running."
        );

        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    searchBuses();
  }, [from, to]);

  // =====================================
  // BUS TYPE
  // =====================================

  const getBusType = (bus) => {
    const type =
      bus.bus_type ||
      bus.busType ||
      "";

    return String(type).toLowerCase();
  };

  // =====================================
  // AC
  // =====================================

  const isAC = (bus) => {
    return getBusType(bus).includes("ac");
  };

  // =====================================
  // SLEEPER
  // =====================================

  const isSleeper = (bus) => {
    return getBusType(bus).includes(
      "sleeper"
    );
  };

  // =====================================
  // SEATER
  // =====================================

  const isSeater = (bus) => {
    return getBusType(bus).includes(
      "seater"
    );
  };

  // =====================================
  // AVAILABLE SEATS
  // =====================================

  const getAvailableSeats = (bus) => {
    return (
      bus.available_seats ??
      bus.availableSeats ??
      bus.total_seats ??
      bus.totalSeats ??
      0
    );
  };

  // =====================================
  // TOTAL SEATS
  // =====================================

  const getTotalSeats = (bus) => {
    return (
      bus.total_seats ??
      bus.totalSeats ??
      0
    );
  };

  // =====================================
  // DEPARTURE TIME
  // =====================================

  const getDeparture = (bus) => {
    const value =
      bus.departure_time ||
      bus.departure ||
      "";

    return String(value).substring(0, 5);
  };

  // =====================================
  // ARRIVAL TIME
  // =====================================

  const getArrival = (bus) => {
    const value =
      bus.arrival_time ||
      bus.arrival ||
      "";

    return String(value).substring(0, 5);
  };

  // =====================================
  // DURATION
  // =====================================

  const getDuration = (bus) => {
    const departure =
      getDeparture(bus);

    const arrival =
      getArrival(bus);

    if (!departure || !arrival) {
      return "—";
    }

    const [dh, dm] =
      departure.split(":").map(Number);

    const [ah, am] =
      arrival.split(":").map(Number);

    let departureMinutes =
      dh * 60 + dm;

    let arrivalMinutes =
      ah * 60 + am;

    if (
      arrivalMinutes <
      departureMinutes
    ) {
      arrivalMinutes += 24 * 60;
    }

    const difference =
      arrivalMinutes -
      departureMinutes;

    const hours =
      Math.floor(difference / 60);

    const minutes =
      difference % 60;

    return `${String(hours).padStart(
      2,
      "0"
    )}h ${String(minutes).padStart(
      2,
      "0"
    )}m`;
  };

  // =====================================
  // DEPARTURE MINUTES
  // =====================================

  const getDepartureMinutes = (bus) => {
    const time =
      getDeparture(bus);

    if (!time) {
      return 0;
    }

    const [hours, minutes] =
      time.split(":").map(Number);

    return hours * 60 + minutes;
  };

  // =====================================
  // OPERATOR
  // =====================================

  const getOperator = (bus) => {
    return (
      bus.operator ||
      bus.bus_name ||
      "Bus Operator"
    );
  };

  // =====================================
  // PRICE
  // =====================================

  const getPrice = (bus) => {
    return Number(
      bus.price || 0
    );
  };

  // =====================================
  // BUS TYPE DISPLAY
  // =====================================

  const getDisplayBusType = (bus) => {
    return (
      bus.bus_type ||
      bus.busType ||
      "Bus"
    );
  };

  // =====================================
  // FILTER TOGGLE
  // =====================================

  const toggleFilter = (
    value,
    setter,
    currentValues
  ) => {
    if (
      currentValues.includes(value)
    ) {
      setter(
        currentValues.filter(
          (item) => item !== value
        )
      );
    } else {
      setter([
        ...currentValues,
        value,
      ]);
    }
  };

  // =====================================
  // RESET FILTERS
  // =====================================

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedDeparture([]);
    setSelectedSafety([]);
    setSortBy("recommended");
  };

  // =====================================
  // FILTER + SORT
  // =====================================

  const filteredBuses = useMemo(() => {
    let result = [...buses];

    // ===================================
    // BUS TYPE FILTER
    // ===================================

    if (selectedTypes.length > 0) {
      result = result.filter((bus) =>
        selectedTypes.some((type) => {
          if (type === "AC") {
            return isAC(bus);
          }

          if (type === "Sleeper") {
            return isSleeper(bus);
          }

          if (type === "Seater") {
            return isSeater(bus);
          }

          return false;
        })
      );
    }

    // ===================================
    // DEPARTURE FILTER
    // ===================================

    if (
      selectedDeparture.length > 0
    ) {
      result = result.filter((bus) => {
        const minutes =
          getDepartureMinutes(bus);

        return selectedDeparture.some(
          (range) => {
            if (range === "before6") {
              return minutes < 18 * 60;
            }

            if (range === "6to10") {
              return (
                minutes >= 18 * 60 &&
                minutes <= 22 * 60
              );
            }

            if (range === "after10") {
              return minutes > 22 * 60;
            }

            return false;
          }
        );
      });
    }

    // ===================================
    // SAFESEAT FILTER
    // ===================================

    if (selectedSafety.length > 0) {
      result = result.filter((bus) => {
        return selectedSafety.some(
          (safety) => {
            if (safety === "women") {
              return (
                bus.safe_women === true ||
                bus.safeWomen === true ||
                bus.women_safe === true ||
                bus.womenSafe === true
              );
            }

            if (safety === "men") {
              return (
                bus.safe_men === true ||
                bus.safeMen === true ||
                bus.men_safe === true ||
                bus.menSafe === true
              );
            }

            return false;
          }
        );
      });
    }

    // ===================================
    // SORT
    // ===================================

    if (sortBy === "price") {
      result.sort(
        (a, b) =>
          getPrice(a) -
          getPrice(b)
      );
    }

    if (sortBy === "departure") {
      result.sort(
        (a, b) =>
          getDepartureMinutes(a) -
          getDepartureMinutes(b)
      );
    }

    return result;
  }, [
    buses,
    selectedTypes,
    selectedDeparture,
    selectedSafety,
    sortBy,
  ]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="results-page">

        <div className="no-results">

          <div className="no-results-icon">
            ⏳
          </div>

          <h2>
            Finding buses...
          </h2>

          <p>
            Searching available buses from{" "}
            <strong>{from}</strong>{" "}
            to{" "}
            <strong>{to}</strong>
          </p>

        </div>

      </div>
    );
  }

  // =====================================
  // ERROR
  // =====================================

  if (error) {
    return (
      <div className="results-page">

        <header className="results-navbar">

          <div
            className="results-logo"
            onClick={() =>
              navigate("/home")
            }
          >

            <div className="results-logo-box">
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

          {/* CHANGED: / → /home */}

          <button
            type="button"
            className="change-search"
            onClick={() =>
              navigate("/home")
            }
          >
            Change search
          </button>

        </header>

        <main className="results-container">

          <div className="no-results">

            <div className="no-results-icon">
              ⚠
            </div>

            <h2>
              Unable to load buses
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </main>

        <Footer />

      </div>
    );
  }

  // =====================================
  // MAIN UI
  // =====================================

  return (
    <div className="results-page">

      {/* =================================
          NAVBAR
      ================================= */}

      <header className="results-navbar">

        {/* LOGO */}

        <div
          className="results-logo"
          onClick={() =>
            navigate("/home")
          }
        >

          <div className="results-logo-box">
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

        {/* ROUTE */}

        <div className="route-heading">

          <strong>
            {from} → {to}
          </strong>

          <span>
            {formattedDate} ·{" "}
            {passengers}{" "}
            {passengers === 1
              ? "Passenger"
              : "Passengers"}
          </span>

        </div>

        {/* CHANGE SEARCH */}

        <button
          type="button"
          className="change-search"
          onClick={() =>
            navigate("/home")
          }
        >
          Change search
        </button>

      </header>

      {/* =================================
          MAIN
      ================================= */}

      <main className="results-container">

        {/* TITLE */}

        <div className="results-title">

          <div>

            <span>
              BUS RESULTS
            </span>

            <h1>
              Choose your journey
            </h1>

            <p>
              {filteredBuses.length} buses
              available for{" "}
              {formattedDate}
            </p>

          </div>

          {/* SORT */}

          <div className="sort-area">

            <label>
              Sort by
            </label>

            <select
              className="sort-select"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
            >

              <option value="recommended">
                Recommended
              </option>

              <option value="price">
                Lowest price
              </option>

              <option value="departure">
                Earliest departure
              </option>

            </select>

          </div>

        </div>

        {/* =================================
            CONTENT
        ================================= */}

        <div className="results-layout">

          {/* =================================
              FILTERS
          ================================= */}

          <aside className="filter-card">

            <div className="filter-heading">

              <h3>
                Filters
              </h3>

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                Reset
              </button>

            </div>

            {/* BUS TYPE */}

            <div className="filter-group">

              <span>
                BUS TYPE
              </span>

              <label>

                <input
                  type="checkbox"
                  checked={selectedTypes.includes(
                    "AC"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "AC",
                      setSelectedTypes,
                      selectedTypes
                    )
                  }
                />

                <span>
                  AC
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedTypes.includes(
                    "Sleeper"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "Sleeper",
                      setSelectedTypes,
                      selectedTypes
                    )
                  }
                />

                <span>
                  Sleeper
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedTypes.includes(
                    "Seater"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "Seater",
                      setSelectedTypes,
                      selectedTypes
                    )
                  }
                />

                <span>
                  Seater
                </span>

              </label>

            </div>

            {/* DEPARTURE */}

            <div className="filter-group">

              <span>
                DEPARTURE
              </span>

              <label>

                <input
                  type="checkbox"
                  checked={selectedDeparture.includes(
                    "before6"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "before6",
                      setSelectedDeparture,
                      selectedDeparture
                    )
                  }
                />

                <span>
                  Before 6 PM
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedDeparture.includes(
                    "6to10"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "6to10",
                      setSelectedDeparture,
                      selectedDeparture
                    )
                  }
                />

                <span>
                  6 PM - 10 PM
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedDeparture.includes(
                    "after10"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "after10",
                      setSelectedDeparture,
                      selectedDeparture
                    )
                  }
                />

                <span>
                  After 10 PM
                </span>

              </label>

            </div>

            {/* SAFESEAT */}

            <div className="filter-group safeseat-filter">

              <span>
                SAFESEAT
              </span>

              <label>

                <input
                  type="checkbox"
                  checked={selectedSafety.includes(
                    "women"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "women",
                      setSelectedSafety,
                      selectedSafety
                    )
                  }
                />

                <span>
                  ♀ Women surroundings
                </span>

              </label>

              <label>

                <input
                  type="checkbox"
                  checked={selectedSafety.includes(
                    "men"
                  )}
                  onChange={() =>
                    toggleFilter(
                      "men",
                      setSelectedSafety,
                      selectedSafety
                    )
                  }
                />

                <span>
                  ♂ Men surroundings
                </span>

              </label>

            </div>

          </aside>

          {/* =================================
              BUS LIST
          ================================= */}

          <section className="bus-list">

            {filteredBuses.length === 0 ? (

              <div className="no-results">

                <div className="no-results-icon">
                  ⌕
                </div>

                <h2>
                  No buses found
                </h2>

                <p>
                  No buses are available
                  for{" "}
                  <strong>
                    {from}
                  </strong>{" "}
                  →{" "}
                  <strong>
                    {to}
                  </strong>
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/home")
                  }
                >
                  Change search
                </button>

              </div>

            ) : (

              filteredBuses.map(
                (bus) => (

                  <article
                    className="bus-card"
                    key={bus.id}
                  >

                    {/* BUS MAIN */}

                    <div className="bus-main">

                      {/* COMPANY */}

                      <div className="bus-company">

                        <div className="bus-company-logo">

                          {getOperator(
                            bus
                          ).charAt(0)}

                        </div>

                        <div>

                          <h3>
                            {getOperator(
                              bus
                            )}
                          </h3>

                          <span>
                            {getDisplayBusType(
                              bus
                            )}
                          </span>

                        </div>

                      </div>

                      {/* TIME */}

                      <div className="bus-time">

                        <div>

                          <strong>
                            {getDeparture(
                              bus
                            )}
                          </strong>

                          <span>
                            {from}
                          </span>

                        </div>

                        <div className="duration">

                          <span>
                            {getDuration(
                              bus
                            )}
                          </span>

                          <i></i>

                        </div>

                        <div>

                          <strong>
                            {getArrival(
                              bus
                            )}
                          </strong>

                          <span>
                            {to}
                          </span>

                        </div>

                      </div>

                      {/* PRICE */}

                      <div className="bus-price">

                        <span>
                          Starting from
                        </span>

                        <strong>
                          ₹{getPrice(bus)}
                        </strong>

                        <small>
                          {getAvailableSeats(
                            bus
                          )} seats left
                        </small>

                      </div>

                    </div>

                    {/* FOOTER */}

                    <div className="bus-footer">

                      <div className="bus-features">

                        <span>
                          ★ 4.5
                        </span>

                        {isAC(bus) && (
                          <span>
                            AC
                          </span>
                        )}

                        {isSeater(bus) && (
                          <span>
                            Seater
                          </span>
                        )}

                        {isSleeper(bus) && (
                          <span>
                            Sleeper
                          </span>
                        )}

                        <span>
                          Charging
                        </span>

                        <span>
                          Blanket
                        </span>

                        <span className="safe-badge women-safe">
                          ♀ Women SafeSeat
                        </span>

                        <span className="safe-badge men-safe">
                          ♂ Men SafeSeat
                        </span>

                      </div>

                      {/* ACTION */}

                      <div className="bus-actions">

                        <span>
                          {getTotalSeats(
                            bus
                          )} total seats
                        </span>

                        <button
                          type="button"
                          onClick={() => {

                            sessionStorage.setItem(
                              "safeSeatSearch",
                              JSON.stringify({
                                from,
                                to,
                                date:
                                  travelDate,
                                passengers
                              })
                            );

                            navigate(
                              `/seats/${bus.id}`,
                              {
                                state: {
                                  bus,

                                  passengerCount:
                                    passengers,

                                  passengers,

                                  from,
                                  to,

                                  date:
                                    travelDate,

                                  travelDate,

                                  formattedDate
                                }
                              }
                            );

                          }}
                        >

                          View Seats

                          <span>
                            →
                          </span>

                        </button>

                      </div>

                    </div>

                  </article>

                )
              )

            )}

          </section>

        </div>

      </main>

      <Footer />

    </div>
  );
}

export default BusResults;