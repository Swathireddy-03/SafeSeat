import { useEffect, useState } from "react";
import "./OfflinePage.css";

function OfflinePage() {
  const [checking, setChecking] = useState(false);

  const checkConnection = () => {
    setChecking(true);

    setTimeout(() => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        setChecking(false);
      }
    }, 800);
  };

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <div className="offline-page">
      <div className="offline-card">
        <div className="offline-icon">📡</div>

        <h1>You're Offline</h1>

        <p>
          SafeSeat needs an internet connection to load your
          bookings and travel services.
        </p>

        <button onClick={checkConnection} disabled={checking}>
          {checking ? "Checking..." : "Try Again"}
        </button>

        <span className="offline-status">
          Please check your internet connection.
        </span>
      </div>
    </div>
  );
}

export default OfflinePage;