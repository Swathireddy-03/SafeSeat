import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API_BASE_URL = "https://safeseat-1.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    // ==============================
    // VALIDATION
    // ==============================

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      // ==============================
      // LOGIN API
      // ==============================

      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      // ==============================
      // READ RESPONSE
      // ==============================

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      // ==============================
      // LOGIN ERROR
      // ==============================

      if (!response.ok || !data.success) {
        setError(
          data.message || "Invalid email or password."
        );
        return;
      }

      // ==============================
      // CHECK USER
      // ==============================

      if (!data.user || !data.user.id) {
        setError(
          "Login successful, but user information was not received."
        );
        return;
      }

      console.log("USER FROM BACKEND:", data.user);

      // =====================================================
      // LOGIN STATUS
      // =====================================================

      localStorage.setItem(
        "busmateLoggedIn",
        "true"
      );

      // =====================================================
      // USER ID
      // =====================================================

      localStorage.setItem(
        "safeSeatUserId",
        String(data.user.id)
      );

      // =====================================================
      // SAVE COMPLETE USER
      // =====================================================

      localStorage.setItem(
        "safeSeatUser",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "currentUser",
        JSON.stringify(data.user)
      );

      // =====================================================
      // SAVE USER NAME
      // =====================================================

      const loggedInName =
        data.user.name ||
        data.user.fullName ||
        data.user.username ||
        data.user.full_name ||
        "SafeSeat User";

      localStorage.setItem(
        "safeSeatUserName",
        loggedInName
      );

      // =====================================================
      // SAVE USER EMAIL
      // =====================================================

      const loggedInEmail =
        data.user.email ||
        email.trim();

      localStorage.setItem(
        "safeSeatUserEmail",
        loggedInEmail
      );

      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "Logged-in User ID:",
        data.user.id
      );

      console.log(
        "Logged-in User Name:",
        loggedInName
      );

      console.log(
        "Logged-in User Email:",
        loggedInEmail
      );

      console.log(
        "Login Status:",
        localStorage.getItem(
          "busmateLoggedIn"
        )
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      alert("Login successful!");

      navigate("/home", {
        replace: true,
      });

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        "Unable to connect to server. Please check whether your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        className="auth-back-button"
        onClick={() => navigate("/login-selection")}
      >
        ← Back
      </button>

      <div className="auth-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="auth-logo">
          ⟡
        </div>

        <h1>
          SafeSeat
        </h1>

        <p className="auth-subtitle">
          Travel smarter
        </p>

        {/* =================================================
            PASSENGER LOGIN
        ================================================= */}

        <h2>
          Passenger Login
        </h2>

        <p className="auth-description">
          Login to continue your journey
        </p>

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="input-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              disabled={loading}
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="auth-divider">
          <span>
            OR
          </span>
        </div>

        {/* =================================================
            SIGNUP
        ================================================= */}

        <p className="auth-switch">
          Don't have an account?{" "}

          <Link to="/signup">
            Create Account
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;