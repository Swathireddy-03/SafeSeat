import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // ADMIN LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // Check empty fields
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      // -------------------------------------------------
      // SEND LOGIN REQUEST TO BACKEND
      // -------------------------------------------------

      const response = await fetch(
        "https://safeseat-1.onrender.com/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Admin login response:", data);

      // -------------------------------------------------
      // LOGIN FAILED
      // -------------------------------------------------

      if (!response.ok || !data.success) {
        setError(
          data.message || "Invalid admin email or password."
        );

        setLoading(false);
        return;
      }

      // -------------------------------------------------
      // LOGIN SUCCESSFUL
      // -------------------------------------------------

      localStorage.setItem(
        "safeSeatAdminLoggedIn",
        "true"
      );

      localStorage.setItem(
        "safeSeatAdminEmail",
        data.admin.email
      );

      // Go to admin dashboard
      navigate("/admin-dashboard");

    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);

      setError(
        "Unable to connect to SafeSeat server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* Background */}
      <div className="admin-bg-circle admin-circle-one"></div>
      <div className="admin-bg-circle admin-circle-two"></div>

      {/* Back button */}
      <button
        className="admin-back-button"
        onClick={() => navigate("/login-selection")}
      >
        ← Back
      </button>

      <div className="admin-login-container">

        {/* =================================================
            LEFT SECTION
        ================================================= */}

        <div className="admin-login-info">

          <div className="admin-brand">
            <span>Safe</span>Seat
          </div>

          <p className="admin-tagline">
            Travel smarter.
          </p>

          <div className="admin-info-content">

            <div className="admin-shield">
              🛡️
            </div>

            <p className="admin-small-title">
              SAFESEAT MANAGEMENT
            </p>

            <h1>
              Manage travel.
              <br />
              <span>Manage smarter.</span>
            </h1>

            <p>
              Access the SafeSeat administration panel to
              manage buses, trains, routes, bookings and
              seat availability.
            </p>

          </div>

        </div>

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div className="admin-login-card">

          <div className="admin-card-header">

            <div className="admin-card-icon">
              🛡️
            </div>

            <div>
              <span>WELCOME BACK</span>
              <h2>Admin Login</h2>
            </div>

          </div>

          <p className="admin-card-description">
            Sign in to access the SafeSeat management dashboard.
          </p>

          <form onSubmit={handleLogin}>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="admin-input-group">

              <label htmlFor="admin-email">
                Admin Email
              </label>

              <div className="admin-input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="admin-email"
                  type="email"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="admin-input-group">

              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={loading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="admin-error">
                ⚠ {error}
              </div>
            )}

            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}

              {!loading && (
                <span>→</span>
              )}
            </button>

          </form>

          {/* =================================================
              SECURITY MESSAGE
          ================================================= */}

          <div className="admin-security">

            <span>🔒</span>

            <p>
              Authorized admin access only
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;