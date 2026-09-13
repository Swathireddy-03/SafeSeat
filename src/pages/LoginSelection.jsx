import { useNavigate } from "react-router-dom";
import "./LoginSelection.css";

function LoginSelection() {
  const navigate = useNavigate();

  return (
    <div className="login-selection-page">

      {/* Background decoration */}
      <div className="selection-bg-circle circle-one"></div>
      <div className="selection-bg-circle circle-two"></div>

      {/* Header */}
      <div className="selection-header">
        <div className="selection-logo">
          <span>Safe</span>Seat
        </div>

        <p>Travel smarter.</p>
      </div>

      {/* Main content */}
      <div className="selection-content">

        <div className="selection-heading">
          <span>WELCOME TO SAFESEAT</span>

          <h1>
            How would you like
            <br />
            to <strong>continue?</strong>
          </h1>

          <p>
            Choose your account type to continue your journey.
          </p>
        </div>


        {/* Login cards */}
        <div className="login-options">

          {/* Passenger */}
          <div
            className="login-card passenger-card"
            onClick={() => navigate("/login")}
          >
            <div className="card-top">
              <div className="login-icon passenger-icon">
                👤
              </div>

              <div className="card-arrow">
                →
              </div>
            </div>

            <div className="card-text">
              <span className="card-label">FOR TRAVELLERS</span>

              <h2>Passenger</h2>

              <p>
                Search buses and trains, choose your seat,
                book your journey and manage your trips.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/login");
              }}
            >
              Continue as Passenger
              <span>→</span>
            </button>
          </div>


          {/* Admin */}
          <div
            className="login-card admin-card"
            onClick={() => navigate("/admin-login")}
          >
            <div className="card-top">
              <div className="login-icon admin-icon">
                🛡️
              </div>

              <div className="card-arrow">
                →
              </div>
            </div>

            <div className="card-text">
              <span className="card-label">FOR MANAGEMENT</span>

              <h2>Admin</h2>

              <p>
                Manage buses, trains, routes, bookings and
                monitor seat availability.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/admin-login");
              }}
            >
              Continue as Admin
              <span>→</span>
            </button>
          </div>

        </div>

        <p className="selection-footer">
          SafeSeat &nbsp;•&nbsp; Travel smarter &nbsp;•&nbsp; Book better
        </p>

      </div>
    </div>
  );
}

export default LoginSelection;