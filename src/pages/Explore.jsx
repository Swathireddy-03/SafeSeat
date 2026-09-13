import { useNavigate } from "react-router-dom";
import "./Explore.css";
import Footer from "../components/Footer";

const travelModes = [
  {
    id: "bus",
    icon: "🚌",
    title: "Bus",
    description: "Comfortable intercity and overnight journeys",
    action: "Search Buses",
  },
  {
    id: "train",
    icon: "🚆",
    title: "Train",
    description: "Discover convenient train connections",
    action: "Explore Trains",
  },
];

const popularRoutes = [
  {
    from: "Hyderabad",
    to: "Bengaluru",
    type: "Bus",
    icon: "🚌",
  },
  {
    from: "Hyderabad",
    to: "Vijayawada",
    type: "Bus",
    icon: "🚌",
  },
  {
    from: "Chennai",
    to: "Bengaluru",
    type: "Train",
    icon: "🚆",
  },
  {
    from: "Hyderabad",
    to: "Chennai",
    type: "Train",
    icon: "🚆",
  },
];

function Explore() {
  const navigate = useNavigate();

  /* =====================================================
     POPULAR ROUTE SEARCH
  ====================================================== */

  const searchRoute = (from, to, mode) => {
    navigate("/", {
      state: {
        from,
        to,
        mode,
      },
    });
  };

  return (
    <div className="explore-page">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="modern-navbar">

        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="modern-logo"
          onClick={() => navigate("/home")}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate("/home");
            }
          }}
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


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="modern-navigation">

          {/* HOME */}

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/home")}
          >
            Home
          </button>


          {/* EXPLORE */}

          <button
            type="button"
            className="modern-nav-link active"
            onClick={() => navigate("/explore")}
          >
            Explore
          </button>


          {/* MY TRIPS */}

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/my-trips")}
          >
            My Trips
          </button>


          {/* OFFERS */}

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/offers")}
          >
            Offers
          </button>


          {/* HELP */}

          <button
            type="button"
            className="modern-nav-link"
            onClick={() => navigate("/help")}
          >
            Help
          </button>

        </nav>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="modern-navbar-actions">
        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="explore-hero">

        <div className="explore-hero-glow glow-left"></div>

        <div className="explore-hero-glow glow-right"></div>


        <div className="explore-hero-content">

          <span className="explore-label">
            DISCOVER SAFESEAT
          </span>


          <h1>
            Explore every way
            <br />

            <span>
              to travel.
            </span>
          </h1>


          <p>
            From buses and trains to comfortable journeys,
            discover the right way to reach your next
            destination.
          </p>

        </div>

      </section>


      {/* =====================================================
          TRAVEL MODES
      ===================================================== */}

      <section className="travel-options-section">

        <div className="explore-section-heading">

          <div>

            <span>
              TRAVEL YOUR WAY
            </span>

            <h2>
              Choose how you want to travel
            </h2>

          </div>


          <p>
            Everything you need for your journey,
            all in one place.
          </p>

        </div>


        <div className="travel-options-grid">

          {travelModes.map((travelMode) => (

            <article
              className={`travel-option-card ${travelMode.id}`}
              key={travelMode.id}
            >

              <div className="travel-option-top">

                <div className="travel-option-icon">
                  {travelMode.icon}
                </div>


                <span className="travel-arrow">
                  →
                </span>

              </div>


              <h3>
                {travelMode.title}
              </h3>


              <p>
                {travelMode.description}
              </p>


              <button
                type="button"
                onClick={() => {

                  if (travelMode.id === "bus") {

                    navigate("/");

                  } else if (travelMode.id === "train") {

                    navigate("/train-results");

                  }

                }}
              >

                {travelMode.action}

                <span>
                  →
                </span>

              </button>

            </article>

          ))}

        </div>

      </section>


      {/* =====================================================
          SAFESEAT FEATURE
      ===================================================== */}

      <section className="explore-safety">

        <div className="safety-content">

          <span>
            THE SAFESEAT DIFFERENCE
          </span>


          <h2>

            Your journey.

            <br />

            <em>
              Your surroundings.
            </em>

          </h2>


          <p>
            SafeSeat gives you more control over your
            travel experience. For supported journeys,
            choose whether you prefer women surroundings,
            men surroundings, or no preference.
          </p>


          {/* TRY SAFESEAT */}

          <button
            type="button"
            onClick={() => navigate("/")}
          >

            Try SafeSeat

            <span>
              →
            </span>

          </button>

        </div>


        <div className="safety-visual">

          <div className="safety-card">

            <div className="safety-card-header">

              <div>

                <span>
                  SAFESEAT
                </span>

                <strong>
                  Passenger preference
                </strong>

              </div>


              <div className="safety-check">
                ✓
              </div>

            </div>


            {/* WOMEN */}

            <div className="safety-choice active">

              <div className="choice-icon women">
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


              <div className="choice-selected">
                ✓
              </div>

            </div>


            {/* MEN */}

            <div className="safety-choice">

              <div className="choice-icon men">
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

            </div>


            {/* NO PREFERENCE */}

            <div className="safety-choice">

              <div className="choice-icon none">
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

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          POPULAR ROUTES
      ===================================================== */}

      <section className="routes-section">

        <div className="explore-section-heading">

          <div>

            <span>
              POPULAR ROUTES
            </span>


            <h2>
              Where are people going?
            </h2>

          </div>


          <p>
            Explore popular journeys from your city.
          </p>

        </div>


        <div className="routes-grid">

          {popularRoutes.map((route, index) => (

            <button
              type="button"
              className="route-card"
              key={index}
              onClick={() =>
                searchRoute(
                  route.from,
                  route.to,
                  route.type.toLowerCase()
                )
              }
            >

              <div className="route-icon">
                {route.icon}
              </div>


              <div className="route-info">

                <span>
                  {route.type}
                </span>


                <div>

                  <strong>
                    {route.from}
                  </strong>


                  <b>
                    →
                  </b>


                  <strong>
                    {route.to}
                  </strong>

                </div>

              </div>


              <div className="route-arrow">
                →
              </div>

            </button>

          ))}

        </div>

      </section>


      {/* =====================================================
          WHY SAFESEAT
      ===================================================== */}

      <section className="explore-benefits">

        <div className="benefits-heading">

          <span>
            WHY CHOOSE SAFESEAT
          </span>


          <h2>

            More than just

            <br />

            booking a ticket.

          </h2>

        </div>


        <div className="benefits-grid">


          {/* =================================================
              BENEFIT 1
          ================================================= */}

          <div className="benefit">

            <div className="benefit-number">
              01
            </div>


            <div className="benefit-icon">
              ◈
            </div>


            <h3>
              Bus & Train travel
            </h3>


            <p>
              Search and discover buses and
              trains to reach your destination.
            </p>

          </div>


          {/* =================================================
              BENEFIT 2
          ================================================= */}

          <div className="benefit">

            <div className="benefit-number">
              02
            </div>


            <div className="benefit-icon">
              ♡
            </div>


            <h3>
              Safety preferences
            </h3>


            <p>
              Choose women surroundings or
              men surroundings where supported.
            </p>

          </div>


          {/* =================================================
              BENEFIT 3
          ================================================= */}

          <div className="benefit">

            <div className="benefit-number">
              03
            </div>


            <div className="benefit-icon">
              ✓
            </div>


            <h3>
              Simple booking
            </h3>


            <p>
              A clean experience from choosing
              your journey to selecting your seat.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />

    </div>
  );
}

export default Explore;