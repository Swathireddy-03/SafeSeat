import { useNavigate } from "react-router-dom";
import {
  FaBusAlt,
  FaTrain,
  FaTicketAlt,
  FaChair,
  FaArrowRight,
} from "react-icons/fa";

import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  const goToLoginSelection = () => {
    navigate("/login-selection");
  };

  return (
    <div className="landing-page" onClick={goToLoginSelection}>
      <div className="landing-background">
        <div className="landing-circle circle-one"></div>
        <div className="landing-circle circle-two"></div>
        <div className="landing-circle circle-three"></div>
      </div>

      <div className="landing-content">
        <div className="landing-logo">
          <span>Safe</span>Seat
        </div>

        <p className="landing-tagline">Travel smarter.</p>

        <div className="landing-main">
          <div className="landing-text">
            <p className="landing-small-title">
              YOUR JOURNEY STARTS HERE
            </p>

            <h1>
              Travel easy.
              <br />
              <span>Travel safe.</span>
            </h1>

            <p className="landing-description">
              Book bus and train journeys, choose your preferred seat,
              and manage your trips — all in one place.
            </p>

            <button
              className="landing-button"
              onClick={(e) => {
                e.stopPropagation();
                goToLoginSelection();
              }}
            >
              Get Started
              <FaArrowRight />
            </button>
          </div>

          <div className="landing-visual">
            {/* BUS */}
            <div className="travel-card bus-card">
              <div className="travel-icon bus-icon">
                <FaBusAlt />
              </div>

              <div>
                <strong>Bus Travel</strong>
                <small>Comfortable journeys</small>
              </div>
            </div>

            {/* TRAIN */}
            <div className="travel-card train-card">
              <div className="travel-icon train-icon">
                <FaTrain />
              </div>

              <div>
                <strong>Train Travel</strong>
                <small>Explore more destinations</small>
              </div>
            </div>

            {/* SEAT */}
            <div className="seat-card">
              <div className="seat-icon">
                <FaChair />
              </div>

              <div>
                <strong>Choose your seat</strong>
                <small>Travel your way</small>
              </div>
            </div>

            <div className="visual-circle">
              <span>SS</span>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="landing-features">
          <div className="feature-item">
            <span className="feature-icon feature-bus">
              <FaBusAlt />
            </span>
            <p>Bus Booking</p>
          </div>

          <div className="feature-divider"></div>

          <div className="feature-item">
            <span className="feature-icon feature-train">
              <FaTrain />
            </span>
            <p>Train Booking</p>
          </div>

          <div className="feature-divider"></div>

          <div className="feature-item">
            <span className="feature-icon feature-seat">
              <FaChair />
            </span>
            <p>Smart Seat Selection</p>
          </div>

          <div className="feature-divider"></div>

          <div className="feature-item">
            <span className="feature-icon feature-ticket">
              <FaTicketAlt />
            </span>
            <p>Easy Booking</p>
          </div>
        </div>

        <p className="landing-hint">
          Click anywhere to continue
        </p>
      </div>
    </div>
  );
}

export default Landing;