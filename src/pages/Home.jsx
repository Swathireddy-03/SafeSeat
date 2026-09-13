import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import NotificationBell from "./NotificationBell";
import Footer from "../components/Footer";

const travelModes = [
  {
    id: "bus",
    icon: "🚌",
    label: "Bus",
  },
  {
    id: "train",
    icon: "🚆",
    label: "Train",
  },
];

const cities = [
  "Hyderabad",
  "Bengaluru",
  "Chennai",
  "Vijayawada",
  "Mumbai",
  "Pune",
  "Delhi",
  "Kochi",
];

function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatSelectedDate(dateValue) {
  if (!dateValue) {
    return "Select date";
  }

  const dateObject = new Date(`${dateValue}T00:00:00`);

  return dateObject.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSelectedDay(dateValue) {
  if (!dateValue) {
    return "Select travel date";
  }

  const dateObject = new Date(`${dateValue}T00:00:00`);

  return dateObject.toLocaleDateString("en-IN", {
    weekday: "long",
  });
}

function Home() {
  const navigate = useNavigate();

  /* =====================================================
     USER
  ====================================================== */

  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("safeSeatUser");

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error(
          "Unable to read logged-in user:",
          error
        );

        setUser(null);
      }
    }
  }, []);

  /* =====================================================
     SEARCH STATES
  ====================================================== */

  const [mode, setMode] = useState("bus");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [locationType, setLocationType] = useState(null);

  const [preference, setPreference] = useState("none");

  const [date, setDate] = useState(getTodayDate());

  const [passengers, setPassengers] = useState(1);

  const [locationSearch, setLocationSearch] = useState("");

  /* =====================================================
     MODE DATA
  ====================================================== */

  const modeData = {
    bus: {
      title: "Search buses",
      subtitle: "Comfortable bus journeys across cities",
      fromLabel: "Boarding from",
      toLabel: "Going to",
      dateLabel: "Departure",
      passengerLabel: "Passengers",
      button: "Search Buses",
    },

    train: {
      title: "Search trains",
      subtitle: "Find the right train for your journey",
      fromLabel: "From",
      toLabel: "To",
      dateLabel: "Travel date",
      passengerLabel: "Passengers",
      button: "Search Trains",
    },
  };

  const currentMode = modeData[mode];

  /* =====================================================
     FILTER LOCATIONS
  ====================================================== */

  const filteredCities = cities.filter((city) =>
    city
      .toLowerCase()
      .includes(locationSearch.toLowerCase())
  );

  /* =====================================================
     SELECT CITY
  ====================================================== */

  const selectCity = (city) => {
    if (locationType === "from") {
      setFrom(city);
    }

    if (locationType === "to") {
      setTo(city);
    }

    setLocationType(null);
    setLocationSearch("");
  };

  /* =====================================================
     SWAP LOCATIONS
  ====================================================== */

  const swapLocations = () => {
    const oldFrom = from;

    setFrom(to);
    setTo(oldFrom);
  };

  /* =====================================================
     SEARCH
  ====================================================== */

  const handleSearch = () => {
    if (!from || !to) {
      alert("Please select both locations.");
      return;
    }

    if (!date) {
      alert("Please select a travel date.");
      return;
    }

    if (mode === "bus") {
      navigate("/bus-results", {
        state: {
          mode,
          from,
          to,
          date,
          passengers,
          preference,
        },
      });
    }

    if (mode === "train") {
      navigate("/train-results", {
        state: {
          mode,
          from,
          to,
          date,
          passengers,
          preference,
        },
      });
    }
  };

  /* =====================================================
     CURRENT LOCATION
  ====================================================== */

  const handleCurrentLocation = () => {
    setFrom("Hyderabad");

    setLocationType(null);

    setLocationSearch("");
  };

  /* =====================================================
     LOGOUT
  ====================================================== */

  const handleLogout = () => {
    localStorage.removeItem("safeSeatUser");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("safeSeatUserId");

    localStorage.removeItem("safeSeatUserName");
    localStorage.removeItem("safeSeatUserEmail");

    localStorage.removeItem("busmateLoggedIn");
    localStorage.removeItem("busmateUser");
    localStorage.removeItem("busmateUserId");

    setUser(null);

    navigate("/login", {
      replace: true,
    });
  };

  /* =====================================================
     USER DISPLAY NAME
  ====================================================== */

  const displayName =
    user?.name ||
    user?.username ||
    user?.full_name ||
    user?.fullName ||
    user?.email ||
    "User";

  return (
    <div className="safe-home">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="modern-navbar">

        {/* LOGO */}

        <div
          className="modern-logo"
          onClick={() => navigate("/home")}
        >
          <div className="modern-logo-icon">
            S
          </div>

          <div className="modern-logo-text">
            <strong>
              SafeSeat
            </strong>

            <span>
              Travel smarter
            </span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="modern-navigation">

          <button
            type="button"
            className="modern-nav-link active"
            onClick={() => navigate("/home")}
          >
            Home
          </button>

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/explore")}
          >
            Explore
          </button>

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/my-trips")}
          >
            My Trips
          </button>

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/offers")}
          >
            Offers
          </button>

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/help")}
          >
            <span className="nav-safety-dot"></span>
            Help
          </button>

        </nav>

        {/* RIGHT SIDE */}

        <div className="modern-navbar-actions">

          <NotificationBell />

          {user && (
            <div className="navbar-user">

              {/* USER AVATAR */}

              <div className="navbar-user-avatar">
                {displayName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {/* USERNAME */}

              <div className="navbar-user-details">

                <strong>
                  {displayName}
                </strong>

              </div>

              {/* LOGOUT */}

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="hero-section">

        <div className="hero-glow glow-one"></div>

        <div className="hero-glow glow-two"></div>

        <div className="hero-content">

          <div className="hero-tag">
            <span></span>
            SMARTER TRAVEL. SAFER CHOICES.
          </div>

          <h1>
            One platform.
            <br />
            <span>
              Every journey.
            </span>
          </h1>

          <p>
            Search buses and trains, choose your
            preferred surroundings and make every
            journey more comfortable with SafeSeat.
          </p>

          <div className="hero-highlights">

            <div>
              <strong>2</strong>
              <span>Travel modes</span>
            </div>

            <div>
              <strong>Safe</strong>
              <span>Seat preferences</span>
            </div>

            <div>
              <strong>Smart</strong>
              <span>Smart seat matching</span>
            </div>

          </div>

        </div>

        {/* =====================================================
            SEARCH CARD
        ====================================================== */}

        <div className="travel-search-card">

          {/* MODE SELECTOR */}

          <div className="mode-selector">

            {travelModes.map((travelMode) => (

              <button
                key={travelMode.id}
                type="button"
                className={`mode-button ${
                  mode === travelMode.id
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  setMode(travelMode.id);
                  setPreference("none");
                }}
              >

                <span className="mode-icon">
                  {travelMode.icon}
                </span>

                <span>
                  {travelMode.label}
                </span>

              </button>

            ))}

          </div>

          {/* SEARCH HEADING */}

          <div className="search-heading">

            <div>

              <span className="small-label">
                {mode.toUpperCase()} TRAVEL
              </span>

              <h2>
                {currentMode.title}
              </h2>

            </div>

            <p>
              {currentMode.subtitle}
            </p>

          </div>

          {/* LOCATION FIELDS */}

          <div className="location-fields">

            {/* FROM */}

            <button
              type="button"
              className={`location-field ${
                locationType === "from"
                  ? "focused"
                  : ""
              }`}
              onClick={() => {
                setLocationType("from");
                setLocationSearch("");
              }}
            >

              <span className="field-label">
                {currentMode.fromLabel}
              </span>

              <div className="field-value">

                <div className="location-symbol">
                  A
                </div>

                <div>

                  <strong>
                    {from || "Select location"}
                  </strong>

                  <small>
                    {from
                      ? "Selected location"
                      : "City, station or airport"}
                  </small>

                </div>

              </div>

            </button>

            {/* SWAP */}

            <button
              type="button"
              className="swap-button"
              onClick={swapLocations}
              title="Swap locations"
            >
              ⇄
            </button>

            {/* TO */}

            <button
              type="button"
              className={`location-field ${
                locationType === "to"
                  ? "focused"
                  : ""
              }`}
              onClick={() => {
                setLocationType("to");
                setLocationSearch("");
              }}
            >

              <span className="field-label">
                {currentMode.toLabel}
              </span>

              <div className="field-value">

                <div className="location-symbol destination">
                  B
                </div>

                <div>

                  <strong>
                    {to || "Select destination"}
                  </strong>

                  <small>
                    {to
                      ? "Selected destination"
                      : "City, station or station"}
                  </small>

                </div>

              </div>

            </button>

          </div>

          {/* =====================================================
              LOCATION POPUP
          ====================================================== */}

          {locationType && (

            <div className="location-popup">

              <div className="popup-header">

                <div>

                  <strong>
                    {locationType === "from"
                      ? currentMode.fromLabel
                      : currentMode.toLabel}
                  </strong>

                  <span>
                    Choose a city or travel location
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLocationType(null);
                    setLocationSearch("");
                  }}
                >
                  ×
                </button>

              </div>

              {/* SEARCH */}

              <div className="location-input">

                <span>
                  ⌕
                </span>

                <input
                  autoFocus
                  value={locationSearch}
                  onChange={(event) =>
                    setLocationSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search city, station or airport"
                />

              </div>

              {/* CURRENT LOCATION */}

              <button
                type="button"
                className="current-location"
                onClick={handleCurrentLocation}
              >

                <div className="current-icon">
                  ◎
                </div>

                <div>

                  <strong>
                    Use current location
                  </strong>

                  <span>
                    Use Hyderabad as boarding point
                  </span>

                </div>

              </button>

              <span className="popup-label">
                POPULAR LOCATIONS
              </span>

              {/* CITY LIST */}

              <div className="city-list">

                {filteredCities.length > 0 ? (

                  filteredCities.map((city) => (

                    <button
                      type="button"
                      key={city}
                      onClick={() =>
                        selectCity(city)
                      }
                    >

                      <span className="city-icon">
                        ●
                      </span>

                      {city}

                    </button>

                  ))

                ) : (

                  <div className="no-location">
                    No locations found
                  </div>

                )}

              </div>

            </div>

          )}

          {/* =====================================================
              TRAVEL DETAILS
          ====================================================== */}

          <div className="travel-details">

            {/* DATE */}

            <div className="detail-field">

              <span>
                {currentMode.dateLabel}
              </span>

              <input
                type="date"
                value={date}
                min={getTodayDate()}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />

              <div className="selected-date-display">

                <strong>
                  {formatSelectedDate(date)}
                </strong>

                <small>
                  {getSelectedDay(date)}
                </small>

              </div>

            </div>

            {/* PASSENGERS */}

            <div className="detail-field">

              <span>
                {currentMode.passengerLabel}
              </span>

              <div className="passenger-selector">

                <button
                  type="button"
                  onClick={() =>
                    setPassengers(
                      Math.max(
                        1,
                        passengers - 1
                      )
                    )
                  }
                >
                  −
                </button>

                <strong>
                  {passengers}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setPassengers(
                      Math.min(
                        10,
                        passengers + 1
                      )
                    )
                  }
                >
                  +
                </button>

              </div>

              <small className="passenger-count">
                {passengers === 1
                  ? "1 passenger"
                  : `${passengers} passengers`}
              </small>

            </div>

            {/* SEARCH */}

            <button
              type="button"
              className="search-button"
              onClick={handleSearch}
            >

              <span>
                {currentMode.button}
              </span>

              <strong>
                →
              </strong>

            </button>

          </div>

          {/* =====================================================
              SAFESEAT PREFERENCE
          ====================================================== */}

          <div className="preference-section">

            <div className="preference-heading">

              <div className="safe-icon">
                ✓
              </div>

              <div>

                <strong>
                  SafeSeat Preference
                </strong>

                <span>
                  Choose who you prefer around you
                </span>

              </div>

            </div>

            <div className="preference-options">

              {/* NO PREFERENCE */}

              <button
                type="button"
                className={`preference-option ${
                  preference === "none"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPreference("none")
                }
              >

                <div className="preference-dot neutral">
                  •
                </div>

                <div>

                  <strong>
                    No preference
                  </strong>

                  <span>
                    Any available seat
                  </span>

                </div>

              </button>

              {/* WOMEN */}

              <button
                type="button"
                className={`preference-option women ${
                  preference === "women"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPreference("women")
                }
              >

                <div className="preference-dot women-dot">
                  ♀
                </div>

                <div>

                  <strong>
                    Women surroundings
                  </strong>

                  <span>
                    Prefer women nearby
                  </span>

                </div>

              </button>

              {/* MEN */}

              <button
                type="button"
                className={`preference-option men ${
                  preference === "men"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setPreference("men")
                }
              >

                <div className="preference-dot men-dot">
                  ♂
                </div>

                <div>

                  <strong>
                    Men surroundings
                  </strong>

                  <span>
                    Prefer men nearby
                  </span>

                </div>

              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          POPULAR DESTINATIONS
      ====================================================== */}

      <section className="destination-section">

        <div className="section-heading">

          <div>

            <span>
              PLAN YOUR NEXT JOURNEY
            </span>

            <h2>
              Popular destinations
            </h2>

          </div>

          <p>
            Choose a destination and start exploring.
          </p>

        </div>

        <div className="destination-grid">

          {/* ROUTE 1 */}

          <button
            type="button"
            className="destination-card"
            onClick={() => {

              setFrom("Hyderabad");
              setTo("Bengaluru");

              window.scrollTo({
                top: 280,
                behavior: "smooth",
              });

            }}
          >

            <div className="destination-number">
              01
            </div>

            <div className="destination-route">

              <strong>
                Hyderabad
              </strong>

              <span>
                →
              </span>

              <strong>
                Bengaluru
              </strong>

            </div>

            <small>
              Popular bus & train route
            </small>

          </button>

          {/* ROUTE 2 */}

          <button
            type="button"
            className="destination-card"
            onClick={() => {

              setFrom("Hyderabad");
              setTo("Vijayawada");

              window.scrollTo({
                top: 280,
                behavior: "smooth",
              });

            }}
          >

            <div className="destination-number">
              02
            </div>

            <div className="destination-route">

              <strong>
                Hyderabad
              </strong>

              <span>
                →
              </span>

              <strong>
                Vijayawada
              </strong>

            </div>

            <small>
              Popular bus & train route
            </small>

          </button>

          {/* ROUTE 3 */}

          <button
            type="button"
            className="destination-card"
            onClick={() => {

              setFrom("Chennai");
              setTo("Bengaluru");

              window.scrollTo({
                top: 280,
                behavior: "smooth",
              });

            }}
          >

            <div className="destination-number">
              03
            </div>

            <div className="destination-route">

              <strong>
                Chennai
              </strong>

              <span>
                →
              </span>

              <strong>
                Bengaluru
              </strong>

            </div>

            <small>
              Popular bus & train route
            </small>

          </button>

        </div>

      </section>

      {/* =====================================================
          WHY SAFESEAT
      ====================================================== */}

      <section className="why-section">

        <div className="why-intro">

          <span>
            WHY SAFESEAT
          </span>

          <h2>
            Travel with
            <br />
            <em>
              more choice.
            </em>
          </h2>

          <p>
            SafeSeat combines bus and train booking
            with personalized passenger preferences,
            giving you more control over your journey.
          </p>

        </div>

        <div className="why-grid">

          {/* CARD 1 */}

          <article className="why-card">

            <div className="card-number">
              01
            </div>

            <div className="why-icon">
              🚌
            </div>

            <h3>
              Bus & train travel
            </h3>

            <p>
              Search buses and trains from one
              simple and convenient platform.
            </p>

          </article>

          {/* CARD 2 */}

          <article className="why-card">

            <div className="card-number">
              02
            </div>

            <div className="why-icon">
              ♡
            </div>

            <h3>
              Your safety preference
            </h3>

            <p>
              Choose women surroundings, men
              surroundings or no preference.
            </p>

          </article>

          {/* CARD 3 */}

          <article className="why-card">

            <div className="card-number">
              03
            </div>

            <div className="why-icon">
              ◎
            </div>

            <h3>
              Smart seat matching
            </h3>

            <p>
              Find available seats that match your
              preferred surrounding passengers.
            </p>

          </article>

        </div>

      </section>

      <Footer />

    </div>
  );
}

export default Home;