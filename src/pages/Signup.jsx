import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");

    // ==============================
    // VALIDATION
    // ==============================

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all the fields.");
      return;
    }

    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ==========================================
      // BACKEND SIGNUP
      // ==========================================

      const response = await fetch(
  "http://localhost:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Signup response:", data);

      // ==========================================
      // ERROR
      // ==========================================

      if (!response.ok || !data.success) {
        setError(
          data.message || "Unable to create account."
        );
        return;
      }

      // ==========================================
      // SAVE PHONE LOCALLY
      // ==========================================

      localStorage.setItem(
        "busmateSignupPhone",
        phone
      );

      // ==========================================
      // SUCCESS
      // ==========================================

      alert(
        "Account created successfully! Please login."
      );

      navigate("/login");

    } catch (error) {
      console.error("Signup error:", error);

      setError(
        "Unable to connect to server. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card signup-card">

        <div className="auth-logo">
        ⟡
        </div>
        <h1>BusMate</h1>

        <p className="auth-subtitle">
          Smart & Easy Travel Booking
        </p>

        <h2>Create Account</h2>

        <p className="auth-description">
          Join BusMate and start your journey
        </p>

        <form onSubmit={handleSignup}>

          {/* NAME */}

          <div className="input-group">

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

          {/* EMAIL */}

          <div className="input-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>

          {/* PHONE */}

          <div className="input-group">

            <label>Phone Number</label>

            <input
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={phone}
              maxLength={10}
              onChange={(e) =>
                setPhone(
                  e.target.value.replace(/\D/g, "")
                )
              }
            />

          </div>

          {/* PASSWORD */}

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="input-group">

            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Signup;