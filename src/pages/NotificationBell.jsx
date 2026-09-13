import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

function getDateOnly(dateValue) {
  if (!dateValue) return null;

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getToday() {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
}

/* =========================================================
   TRANSPORT DETAILS
========================================================= */

function getTransportDetails(booking) {
  const mode =
    booking.mode ||
    booking.transportMode ||
    booking.travelMode ||
    "bus";

  /* BUS */
  if (mode === "bus") {
    return {
      icon: "🚌",
      modeName: "Bus",
      departure:
        booking.bus?.departure ||
        booking.departure ||
        "--:--",
      seats:
        booking.passengers
          ?.map((passenger) => passenger.seat)
          .filter(Boolean)
          .join(", ") || "--",
    };
  }

  /* TRAIN */
  if (mode === "train") {
    return {
      icon: "🚆",
      modeName: "Train",
      departure:
        booking.train?.departure ||
        booking.departure ||
        "--:--",
      seats:
        booking.passengers
          ?.map((passenger) => passenger.seat)
          .filter(Boolean)
          .join(", ") || "--",
    };
  }

  /* FLIGHT */
  if (mode === "flight") {
    return {
      icon: "✈️",
      modeName: "Flight",
      departure:
        booking.flight?.departure ||
        booking.flight?.departureTime ||
        booking.departure ||
        "--:--",
      seats:
        booking.passengers
          ?.map((passenger) => passenger.seat)
          .filter(Boolean)
          .join(", ") || "--",
    };
  }

  /* CAB */
  if (mode === "cab") {
    return {
      icon: "🚕",
      modeName: "Cab",
      departure:
        booking.cab?.departure ||
        booking.pickupTime ||
        booking.departure ||
        "--:--",
      seats: null,
    };
  }

  /* DEFAULT */
  return {
    icon: "🚍",
    modeName: "Trip",
    departure:
      booking.departure || "--:--",
    seats:
      booking.passengers
        ?.map((passenger) => passenger.seat)
        .filter(Boolean)
        .join(", ") || "--",
  };
}

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

function getTripNotification(booking) {
  if (!booking) return null;

  const tripDateValue =
    booking.travelDate ||
    booking.date ||
    booking.formattedDate;

  const tripDate = getDateOnly(tripDateValue);

  if (!tripDate) return null;

  const today = getToday();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tripTime = tripDate.getTime();
  const todayTime = today.getTime();
  const tomorrowTime = tomorrow.getTime();

  const route = `${booking.from || "From"} → ${
    booking.to || "To"
  }`;

  const transport =
    getTransportDetails(booking);

  let details = `Departure ${transport.departure}`;

  if (transport.seats) {
    details += ` · Seat ${transport.seats}`;
  }

  /* TODAY */

  if (tripTime === todayTime) {
    return {
      id: `trip-today-${booking.bookingId || "booking"}`,

      type: "today",

      icon: transport.icon,

      title: `Your SafeSeat ${transport.modeName.toLowerCase()} trip is today!`,

      message: route,

      details,
    };
  }

  /* TOMORROW */

  if (tripTime === tomorrowTime) {
    return {
      id: `trip-tomorrow-${booking.bookingId || "booking"}`,

      type: "tomorrow",

      icon: transport.icon,

      title: `Your ${transport.modeName.toLowerCase()} trip is tomorrow`,

      message: route,

      details,
    };
  }

  return null;
}

/* =========================================================
   NOTIFICATION BELL
========================================================= */

function NotificationBell() {
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);

  const [notification, setNotification] =
    useState(null);

  const [isOpen, setIsOpen] = useState(false);

  const [isRead, setIsRead] = useState(
    sessionStorage.getItem(
      "safeSeatNotificationRead"
    ) === "true"
  );

  /* =====================================================
     LOAD BOOKING
  ===================================================== */

  useEffect(() => {
    const loadBooking = () => {
      const savedBooking =
        sessionStorage.getItem(
          "safeSeatBooking"
        );

      if (!savedBooking) {
        setBooking(null);
        setNotification(null);
        return;
      }

      try {
        const parsedBooking =
          JSON.parse(savedBooking);

        setBooking(parsedBooking);

        const tripNotification =
          getTripNotification(
            parsedBooking
          );

        setNotification(
          tripNotification
        );

        /*
          If a new booking is made,
          show notification again.
        */

        const lastBookingId =
          sessionStorage.getItem(
            "safeSeatLastNotificationBooking"
          );

        if (
          parsedBooking.bookingId &&
          parsedBooking.bookingId !==
            lastBookingId
        ) {
          setIsRead(false);

          sessionStorage.setItem(
            "safeSeatNotificationRead",
            "false"
          );

          sessionStorage.setItem(
            "safeSeatLastNotificationBooking",
            parsedBooking.bookingId
          );
        }
      } catch (error) {
        console.error(
          "Unable to read booking data:",
          error
        );

        setBooking(null);
        setNotification(null);
      }
    };

    loadBooking();

    window.addEventListener(
      "safeSeatBookingUpdated",
      loadBooking
    );

    window.addEventListener(
      "storage",
      loadBooking
    );

    return () => {
      window.removeEventListener(
        "safeSeatBookingUpdated",
        loadBooking
      );

      window.removeEventListener(
        "storage",
        loadBooking
      );
    };
  }, []);

  /* =====================================================
     OPEN NOTIFICATION
  ===================================================== */

  const handleOpen = () => {
    setIsOpen(
      (current) => !current
    );

    if (!isRead) {
      setIsRead(true);

      sessionStorage.setItem(
        "safeSeatNotificationRead",
        "true"
      );
    }
  };

  /* =====================================================
     MY TRIP
  ===================================================== */

  const handleMyTrip = () => {
    setIsOpen(false);

    navigate("/my-trips");
  };

  /* =====================================================
     CLEAR
  ===================================================== */

  const clearNotification = () => {
    sessionStorage.setItem(
      "safeSeatNotificationRead",
      "true"
    );

    setIsRead(true);
  };

  const hasNotification =
    Boolean(notification);

  const showBadge =
    hasNotification && !isRead;

  return (
    <div className="notification-wrapper">

      {/* =================================================
          BELL
      ================================================= */}

      <button
        type="button"
        className={`notification-button ${
          hasNotification
            ? "has-notification"
            : ""
        }`}
        onClick={handleOpen}
        aria-label="Notifications"
      >

        <span className="notification-bell">
          🔔
        </span>

        {showBadge && (
          <span className="notification-badge">
            1
          </span>
        )}

      </button>

      {/* =================================================
          PANEL
      ================================================= */}

      {isOpen && (
        <div className="notification-panel">

          {/* HEADER */}

          <div className="notification-panel-header">

            <div>

              <span>
                SAFESEAT
              </span>

              <h3>
                Notifications
              </h3>

            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() =>
                setIsOpen(false)
              }
            >
              ×
            </button>

          </div>

          {/* =================================================
              NO BOOKING
          ================================================= */}

          {!booking && (
            <div className="notification-empty">

              <div className="notification-empty-icon">
                🔔
              </div>

              <strong>
                No notifications
              </strong>

              <p>
                Your trip updates will appear
                here after you make a booking.
              </p>

            </div>
          )}

          {/* =================================================
              BOOKING BUT NO URGENT NOTIFICATION
          ================================================= */}

          {booking &&
            !notification && (
              <div className="notification-empty">

                <div className="notification-empty-icon">
                  ✓
                </div>

                <strong>
                  You're all caught up
                </strong>

                <p>
                  No urgent trip
                  notifications right now.
                </p>

                <button
                  type="button"
                  onClick={handleMyTrip}
                >
                  View My Trip
                  <span>→</span>
                </button>

              </div>
            )}

          {/* =================================================
              TRIP NOTIFICATION
          ================================================= */}

          {notification && (
            <div
              className={`trip-notification ${
                notification.type === "today"
                  ? "notification-today"
                  : "notification-tomorrow"
              }`}
            >

              <div className="trip-notification-icon">
                {notification.icon}
              </div>

              <div className="trip-notification-content">

                <div className="notification-top-row">

                  <span className="notification-label">

                    {notification.type ===
                    "today"
                      ? "TODAY"
                      : "TOMORROW"}

                  </span>

                  <button
                    type="button"
                    onClick={
                      clearNotification
                    }
                  >
                    ✓
                  </button>

                </div>

                <strong>
                  {notification.title}
                </strong>

                <p>
                  {notification.message}
                </p>

                <span className="notification-details">
                  {notification.details}
                </span>

                <button
                  type="button"
                  className="view-trip-button"
                  onClick={handleMyTrip}
                >
                  View My Trip
                  <span>→</span>
                </button>

              </div>

            </div>
          )}

          {/* FOOTER */}

          <div className="notification-footer">

            <span>
              🔒 SafeSeat booking updates
            </span>

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;