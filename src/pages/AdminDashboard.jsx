import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBusAlt,
  FaTrain,
  FaTicketAlt,
  FaChair,
  FaRupeeSign,
  FaBell,
  FaThLarge,
  FaRoute,
} from "react-icons/fa";
import "./AdminDashboard.css";
import Footer from "../components/Footer";
const API_BASE = "https://safeseat-1.onrender.com";

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSeatsBooked: 0,
    totalRevenue: 0,
    totalBuses: 0,
    totalBusSeats: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showBusForm, setShowBusForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [busForm, setBusForm] = useState({
    bus_name: "",
    bus_number: "",
    operator: "",
    bus_type: "",
    from_city: "",
    to_city: "",
    departure_time: "",
    arrival_time: "",
    total_seats: 40,
    price: 0,
  });

  /* =====================================================
     LOAD ALL ADMIN DATA
     ===================================================== */

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [busResponse, bookingResponse, statsResponse] =
        await Promise.all([
          fetch(`${API_BASE}/api/buses`),
          fetch(`${API_BASE}/api/bookings`),
          fetch(`${API_BASE}/api/bookings/stats`),
        ]);

      if (!busResponse.ok) {
        throw new Error("Failed to load buses");
      }

      if (!bookingResponse.ok) {
        throw new Error("Failed to load bookings");
      }

      if (!statsResponse.ok) {
        throw new Error("Failed to load statistics");
      }

      const busData = await busResponse.json();
      const bookingData = await bookingResponse.json();
      const statsData = await statsResponse.json();

      setBuses(busData.buses || []);
      setBookings(bookingData.bookings || []);
      setStats(
        statsData.stats || {
          totalBookings: 0,
          totalSeatsBooked: 0,
          totalRevenue: 0,
          totalBuses: 0,
          totalBusSeats: 0,
        }
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(
        err.message ||
          "Unable to connect to SafeSeat backend"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  /* =====================================================
     TRAIN DATA
     
     No separate trains table.
     Trains are obtained from the SAME bookings table.
     ===================================================== */

  const trains = useMemo(() => {
    const trainMap = new Map();

    bookings
      .filter(
        (booking) =>
          String(
            booking.transport_type || ""
          ).toLowerCase() === "train" ||
          booking.train_id ||
          booking.train_name ||
          booking.train_number
      )
      .forEach((booking) => {
        const key =
          booking.train_id ||
          booking.train_number ||
          booking.train_name;

        if (!key) return;

        if (!trainMap.has(String(key))) {
          trainMap.set(String(key), {
            id:
              booking.train_id ||
              booking.train_number ||
              key,

            name:
              booking.train_name ||
              "Train",

            number:
              booking.train_number ||
              "N/A",

            type:
              booking.train_type ||
              "Train",

            class:
              booking.train_class ||
              "N/A",

            seats: 0,
            booked: 0,

            from:
              booking.from_city ||
              booking.from ||
              booking.bus_from ||
              "—",

            to:
              booking.to_city ||
              booking.to ||
              booking.bus_to ||
              "—",

            departure:
              booking.departure_time ||
              booking.departureTime ||
              booking.bus_departure ||
              "—",

            status: "Active",
          });
        }

        const train = trainMap.get(String(key));

        train.booked += Number(
          booking.booking_status === "Confirmed"
            ? booking.seats || 0
            : 0
        );

        train.seats = Math.max(
          train.seats,
          train.booked
        );
      });

    return Array.from(trainMap.values());
  }, [bookings]);

  const totalBuses = buses.length;
  const totalTrains = trains.length;

  /* =====================================================
     NOTIFICATIONS
     ===================================================== */

  const notifications = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      )
      .slice(0, 5)
      .map((booking) => {
        const isTrain =
          String(booking.transport_type || "").toLowerCase() === "train" ||
          booking.train_id ||
          booking.train_name;

        return {
          id: booking.booking_id || booking.id,
          icon: isTrain ? "🚆" : "🚌",
          title: "New booking received",
          message: `${booking.booking_id || "Booking"} • ${
            booking.passenger_name || "Passenger"
          }`,
          time: booking.created_at
            ? new Date(booking.created_at).toLocaleString("en-IN")
            : "Recently",
        };
      });
  }, [bookings]);

  /* =====================================================
     TOTAL SEATS
     ===================================================== */

  const totalBusSeats = buses.reduce(
    (sum, bus) =>
      sum + Number(bus.total_seats || 0),
    0
  );

  /*
    Train capacity is not stored in the current database
    schema. Therefore only actual booked train seats are
    represented here.
  */

  const totalSeats =
    totalBusSeats +
    trains.reduce(
      (sum, train) =>
        sum + Number(train.seats || 0),
      0
    );

  const totalSeatsBooked =
    Number(stats.totalSeatsBooked || 0);

  const availableSeats = Math.max(
    totalSeats - totalSeatsBooked,
    0
  );

  const occupancy =
    totalSeats > 0
      ? Math.min(
          Math.round(
            (totalSeatsBooked / totalSeats) * 100
          ),
          100
        )
      : 0;

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      "safeSeatAdminLoggedIn"
    );

    localStorage.removeItem(
      "safeSeatAdminEmail"
    );

    navigate("/admin-login");
  };

  /* =====================================================
     BUS FORM
     ===================================================== */

  const resetBusForm = () => {
    setBusForm({
      bus_name: "",
      bus_number: "",
      operator: "",
      bus_type: "",
      from_city: "",
      to_city: "",
      departure_time: "",
      arrival_time: "",
      total_seats: 40,
      price: 0,
    });
  };

  const handleBusInput = (event) => {
    const { name, value } = event.target;

    setBusForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =====================================================
     ADD / UPDATE BUS
     ===================================================== */

  const handleBusSubmit = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const url = editingBus
        ? `${API_BASE}/api/buses/${editingBus.id}`
        : `${API_BASE}/api/buses`;

      const method = editingBus
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...busForm,
          total_seats: Number(
            busForm.total_seats
          ),
          price: Number(busForm.price),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Bus operation failed"
        );
      }

      alert(
        editingBus
          ? "Bus updated successfully"
          : "Bus added successfully"
      );

      setShowBusForm(false);
      setEditingBus(null);
      resetBusForm();

      await loadDashboardData();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save bus"
      );
    }
  };

  /* =====================================================
     EDIT BUS
     ===================================================== */

  const handleEditBus = (bus) => {
    setEditingBus(bus);

    setBusForm({
      bus_name: bus.bus_name || "",
      bus_number: bus.bus_number || "",
      operator: bus.operator || "",
      bus_type: bus.bus_type || "",
      from_city: bus.from_city || "",
      to_city: bus.to_city || "",
      departure_time:
        bus.departure_time || "",
      arrival_time:
        bus.arrival_time || "",
      total_seats:
        bus.total_seats || 40,
      price:
        bus.price || 0,
    });

    setShowBusForm(true);
  };

  /* =====================================================
     DELETE BUS
     ===================================================== */

  const handleDeleteBus = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this bus?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/buses/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete bus"
        );
      }

      alert("Bus removed successfully");

      await loadDashboardData();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to remove bus"
      );
    }
  };

  /* =====================================================
     CANCEL BOOKING
     ===================================================== */

  const handleCancelBooking = async (
    bookingId
  ) => {
    const confirmCancel = window.confirm(
      `Cancel booking ${bookingId}?`
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to cancel booking"
        );
      }

      alert(
        "Booking cancelled successfully"
      );

      await loadDashboardData();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to cancel booking"
      );
    }
  };

  /* =====================================================
     PAGE TITLE
     ===================================================== */

  const getPageTitle = () => {
    switch (activeSection) {
      case "buses":
        return "Bus Management";

      case "trains":
        return "Train Management";

      case "bookings":
        return "Booking Management";

      case "routes":
        return "Route Management";

      default:
        return "Dashboard";
    }
  };

  /* =====================================================
     PAGE DESCRIPTION
     ===================================================== */

  const getPageDescription = () => {
    switch (activeSection) {
      case "buses":
        return "Manage buses operating through SafeSeat";

      case "trains":
        return "View train services from SafeSeat bookings";

      case "bookings":
        return "Monitor passenger reservations and payments";

      case "routes":
        return "Check routes, services and seat availability";

      default:
        return "Manage your SafeSeat transportation platform";
    }
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="admin-layout">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          Loading SafeSeat Admin Dashboard...
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
     ===================================================== */

  return (
    <div className="admin-layout">

      {/* =================================================
          TOPBAR
          ================================================= */}

      <header className="admin-topbar">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            SS
          </div>

          <div className="admin-brand-text">
            <h2>SafeSeat</h2>
            <span>Admin Panel</span>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="admin-top-nav">

          <button
            type="button"
            className={
              activeSection === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("dashboard")
            }
          >
            <span>
              <FaThLarge />
            </span>
            Dashboard
          </button>


          <button
            type="button"
            className={
              activeSection === "buses"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("buses")
            }
          >
            <span>
              <FaBusAlt />
            </span>
            Buses
          </button>


          <button
            type="button"
            className={
              activeSection === "trains"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("trains")
            }
          >
            <span>
              <FaTrain />
            </span>
            Trains
          </button>


          <button
            type="button"
            className={
              activeSection === "bookings"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("bookings")
            }
          >
            <span>
              <FaTicketAlt />
            </span>
            Bookings
          </button>


          <button
            type="button"
            className={
              activeSection === "routes"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveSection("routes")
            }
          >
            <span>
              <FaRoute />
            </span>
            Routes
          </button>

        </nav>


        {/* RIGHT SIDE */}

        <div className="admin-top-actions">

          <div
            className="notification-wrapper"
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="admin-notification"
              onClick={() =>
                setShowNotifications((current) => !current)
              }
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <FaBell />

              {bookings.length > 0 && (
                <span className="notification-badge">
                  {bookings.length > 99 ? "99+" : bookings.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="notification-dropdown"
                style={{
                  position: "absolute",
                  top: "52px",
                  right: "0",
                  width: "350px",
                  maxWidth: "calc(100vw - 30px)",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 18px 45px rgba(36, 20, 60, 0.18)",
                  border: "1px solid #eee7f2",
                  zIndex: 1000,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 18px",
                    borderBottom: "1px solid #eee7f2",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "16px",
                        color: "#24143c",
                      }}
                    >
                      Notifications
                    </strong>
                    <small style={{ color: "#777" }}>
                      Recent SafeSeat bookings
                    </small>
                  </div>

                  <span
                    style={{
                      minWidth: "26px",
                      height: "26px",
                      padding: "0 7px",
                      borderRadius: "50px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f1e6ff",
                      color: "#7c2dcc",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                  >
                    {notifications.length}
                  </span>
                </div>

                <div style={{ maxHeight: "360px", overflowY: "auto" }}>
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          setShowNotifications(false);
                          setActiveSection("bookings");
                        }}
                        style={{
                          width: "100%",
                          border: "0",
                          background: "#fff",
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          textAlign: "left",
                          cursor: "pointer",
                          borderBottom: "1px solid #f3eef6",
                        }}
                      >
                        <span
                          style={{
                            width: "38px",
                            height: "38px",
                            minWidth: "38px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#f7efff",
                            fontSize: "19px",
                          }}
                        >
                          {notification.icon}
                        </span>

                        <span style={{ minWidth: 0 }}>
                          <strong
                            style={{
                              display: "block",
                              color: "#24143c",
                              fontSize: "14px",
                              marginBottom: "4px",
                            }}
                          >
                            {notification.title}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              color: "#555",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notification.message}
                          </span>

                          <small
                            style={{
                              display: "block",
                              color: "#999",
                              marginTop: "5px",
                              fontSize: "11px",
                            }}
                          >
                            {notification.time}
                          </small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "35px 20px",
                        textAlign: "center",
                        color: "#777",
                      }}
                    >
                      <FaBell
                        style={{
                          fontSize: "28px",
                          marginBottom: "10px",
                          opacity: 0.5,
                        }}
                      />

                      <strong
                        style={{
                          display: "block",
                          color: "#555",
                          marginBottom: "5px",
                        }}
                      >
                        No notifications
                      </strong>

                      <small>
                        New bookings will appear here.
                      </small>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveSection("bookings");
                    }}
                    style={{
                      width: "100%",
                      border: "0",
                      borderTop: "1px solid #eee7f2",
                      background: "#faf7ff",
                      color: "#7c2dcc",
                      padding: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    View All Bookings →
                  </button>
                )}
              </div>
            )}
          </div>


          <div className="header-admin">

            <div className="header-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>

          </div>


          <button
            type="button"
            className="topbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
          ================================================= */}

      <main className="admin-main">

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#ffe8e8",
              color: "#c62828",
              padding: "12px 18px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}


        {/* PAGE HEADER */}

        <div className="admin-header">

          <div>

            <h1>
              {getPageTitle()}
            </h1>

            <p>
              {getPageDescription()}
            </p>

          </div>

        </div>


        {/* =================================================
            DASHBOARD
            ================================================= */}

        {activeSection === "dashboard" && (

          <section className="dashboard-content">

            <div className="stats-grid">

              {/* BUSES */}

              <div className="stat-card">

                <div className="stat-icon bus-icon">
                  <FaBusAlt />
                </div>

                <div>

                  <span>
                    Total Buses
                  </span>

                  <h2>
                    {totalBuses}
                  </h2>

                  <small>
                    Currently active
                  </small>

                </div>

              </div>


              {/* TRAINS */}

              <div className="stat-card">

                <div className="stat-icon train-icon">
                  <FaTrain />
                </div>

                <div>

                  <span>
                    Total Trains
                  </span>

                  <h2>
                    {totalTrains}
                  </h2>

                  <small>
                    From booking records
                  </small>

                </div>

              </div>


              {/* BOOKINGS */}

              <div className="stat-card">

                <div className="stat-icon booking-icon">
                  <FaTicketAlt />
                </div>

                <div>

                  <span>
                    Total Bookings
                  </span>

                  <h2>
                    {Number(
                      stats.totalBookings || 0
                    )}
                  </h2>

                  <small>
                    All time bookings
                  </small>

                </div>

              </div>


              {/* SEATS */}

              <div className="stat-card">

                <div className="stat-icon seat-icon">
                  <FaChair />
                </div>

                <div>

                  <span>
                    Seats Booked
                  </span>

                  <h2>
                    {totalSeatsBooked}
                  </h2>

                  <small>
                    Bus + Train
                  </small>

                </div>

              </div>


              {/* REVENUE */}

              <div className="stat-card">

                <div className="stat-icon revenue-icon">
                  <FaRupeeSign />
                </div>

                <div>

                  <span>
                    Total Revenue
                  </span>

                  <h2>
                    ₹
                    {Number(
                      stats.totalRevenue || 0
                    ).toLocaleString("en-IN")}
                  </h2>

                  <small>
                    Confirmed booking revenue
                  </small>

                </div>

              </div>

            </div>


            {/* QUICK ACTIONS + OCCUPANCY */}

            <div className="dashboard-row">

              <div className="dashboard-panel quick-panel">

                <div className="panel-heading">

                  <div>

                    <h2>
                      Quick Actions
                    </h2>

                    <p>
                      Manage transportation services
                    </p>

                  </div>

                </div>


                <div className="quick-actions">

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("buses")
                    }
                  >
                    <span>
                      <FaBusAlt />
                    </span>

                    <div>

                      <strong>
                        Manage Buses
                      </strong>

                      <small>
                        Add, edit or remove buses
                      </small>

                    </div>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("trains")
                    }
                  >
                    <span>
                      <FaTrain />
                    </span>

                    <div>

                      <strong>
                        View Trains
                      </strong>

                      <small>
                        View train booking services
                      </small>

                    </div>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("bookings")
                    }
                  >
                    <span>
                      <FaTicketAlt />
                    </span>

                    <div>

                      <strong>
                        View Bookings
                      </strong>

                      <small>
                        Check bus and train bookings
                      </small>

                    </div>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection("routes")
                    }
                  >
                    <span>
                      <FaRoute />
                    </span>

                    <div>

                      <strong>
                        View Routes
                      </strong>

                      <small>
                        Check active routes
                      </small>

                    </div>

                  </button>

                </div>

              </div>


              {/* OCCUPANCY */}

              <div className="dashboard-panel occupancy-panel">

                <div className="panel-heading">

                  <div>

                    <h2>
                      Seat Occupancy
                    </h2>

                    <p>
                      Current booking status
                    </p>

                  </div>

                </div>


                <div
                  className="occupancy-circle"
                  style={{
                    background: `conic-gradient(
                      #9239e8 0deg ${
                        occupancy * 3.6
                      }deg,
                      #eee7f2 ${
                        occupancy * 3.6
                      }deg 360deg
                    )`,
                  }}
                >

                  <div className="circle-inner">

                    <strong>
                      {occupancy}%
                    </strong>

                    <span>
                      Occupied
                    </span>

                  </div>

                </div>


                <div className="occupancy-info">

                  <div>

                    <span className="dot booked-dot"></span>

                    Booked

                    <strong>
                      {totalSeatsBooked}
                    </strong>

                  </div>


                  <div>

                    <span className="dot available-dot"></span>

                    Available

                    <strong>
                      {availableSeats}
                    </strong>

                  </div>

                </div>

              </div>

            </div>


            {/* RECENT BOOKINGS */}

            <div className="dashboard-panel recent-panel">

              <div className="panel-heading">

                <div>

                  <h2>
                    Recent Bookings
                  </h2>

                  <p>
                    Latest SafeSeat reservations
                  </p>

                </div>


                <button
                  type="button"
                  className="view-all-button"
                  onClick={() =>
                    setActiveSection("bookings")
                  }
                >
                  View All →
                </button>

              </div>


              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Booking ID
                      </th>

                      <th>
                        Passenger
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Service
                      </th>

                      <th>
                        Route
                      </th>

                      <th>
                        Seats
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {bookings
                      .slice(0, 5)
                      .map((booking) => {

                        const isTrain =
                          String(
                            booking.transport_type ||
                              ""
                          ).toLowerCase() ===
                            "train" ||
                          booking.train_id ||
                          booking.train_name;

                        const service =
                          isTrain
                            ? booking.train_name ||
                              `Train ${
                                booking.train_number ||
                                ""
                              }`
                            : booking.bus_name ||
                              booking.operator ||
                              "Bus";

                        const route = isTrain
                          ? `${booking.from || "—"} → ${
                              booking.to || "—"
                            }`
                          : `${booking.bus_from || "—"} → ${
                              booking.bus_to || "—"
                            }`;

                        return (

                          <tr
                            key={
                              booking.booking_id
                            }
                          >

                            <td>

                              <strong className="booking-id">
                                {booking.booking_id}
                              </strong>

                            </td>


                            <td>
                              {booking.passenger_name ||
                                "—"}
                            </td>


                            <td>

                              <span
                                className={
                                  isTrain
                                    ? "type-train"
                                    : "type-bus"
                                }
                              >
                                {isTrain
                                  ? "Train"
                                  : "Bus"}
                              </span>

                            </td>


                            <td>
                              {service}
                            </td>


                            <td>
                              {route}
                            </td>


                            <td>
                              {booking.seats}
                            </td>


                            <td>

                              <strong>
                                ₹
                                {Number(
                                  booking.amount || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                            </td>


                            <td>

                              <span
                                className={
                                  String(
                                    booking.booking_status
                                  ).toLowerCase() ===
                                  "confirmed"
                                    ? "status-confirmed"
                                    : "status-cancelled"
                                }
                              >
                                ●{" "}
                                {booking.booking_status ||
                                  "Unknown"}
                              </span>

                            </td>

                          </tr>

                        );
                      })}


                    {bookings.length === 0 && (

                      <tr>

                        <td
                          colSpan="8"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          No bookings found
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            BUS MANAGEMENT
            ================================================= */}

        {activeSection === "buses" && (

          <section className="management-section">

            <div className="management-top">

              <div>

                <h2>
                  Bus Management
                </h2>

                <p>
                  Manage all buses operating on SafeSeat
                </p>

              </div>


              <button
                type="button"
                className="primary-admin-button"
                onClick={() => {
                  setEditingBus(null);
                  resetBusForm();
                  setShowBusForm(true);
                }}
              >
                + Add New Bus
              </button>

            </div>


            {/* BUS FORM */}

            {showBusForm && (

              <div
                className="dashboard-panel"
                style={{
                  marginBottom: "25px",
                  padding: "25px",
                }}
              >

                <div className="panel-heading">

                  <div>

                    <h2>
                      {editingBus
                        ? "Edit Bus"
                        : "Add New Bus"}
                    </h2>

                    <p>
                      Enter bus service details
                    </p>

                  </div>

                </div>


                <form
                  onSubmit={handleBusSubmit}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "15px",
                  }}
                >

                  <input
                    name="bus_name"
                    placeholder="Bus Name"
                    value={busForm.bus_name}
                    onChange={handleBusInput}
                    required
                  />

                  <input
                    name="bus_number"
                    placeholder="Bus Number"
                    value={busForm.bus_number}
                    onChange={handleBusInput}
                    required
                  />

                  <input
                    name="operator"
                    placeholder="Operator"
                    value={busForm.operator}
                    onChange={handleBusInput}
                    required
                  />

                  <input
                    name="bus_type"
                    placeholder="Bus Type"
                    value={busForm.bus_type}
                    onChange={handleBusInput}
                  />

                  <input
                    name="from_city"
                    placeholder="From City"
                    value={busForm.from_city}
                    onChange={handleBusInput}
                    required
                  />

                  <input
                    name="to_city"
                    placeholder="To City"
                    value={busForm.to_city}
                    onChange={handleBusInput}
                    required
                  />

                  <input
                    name="departure_time"
                    placeholder="Departure Time"
                    value={busForm.departure_time}
                    onChange={handleBusInput}
                  />

                  <input
                    name="arrival_time"
                    placeholder="Arrival Time"
                    value={busForm.arrival_time}
                    onChange={handleBusInput}
                  />

                  <input
                    name="total_seats"
                    type="number"
                    min="1"
                    placeholder="Total Seats"
                    value={busForm.total_seats}
                    onChange={handleBusInput}
                    required
                  />

                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price"
                    value={busForm.price}
                    onChange={handleBusInput}
                    required
                  />


                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      gap: "12px",
                    }}
                  >

                    <button
                      type="submit"
                      className="primary-admin-button"
                    >
                      {editingBus
                        ? "Update Bus"
                        : "Add Bus"}
                    </button>


                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => {
                        setShowBusForm(false);
                        setEditingBus(null);
                        resetBusForm();
                      }}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>

            )}


            <div className="management-grid">

              {buses.map((bus) => {

                const seats =
                  Number(
                    bus.total_seats || 0
                  );

                const booked =
                  Number(
                    bus.booked_seats || 0
                  );

                const available =
                  Math.max(
                    seats - booked,
                    0
                  );

                const percentage =
                  seats > 0
                    ? Math.min(
                        Math.round(
                          (booked / seats) *
                            100
                        ),
                        100
                      )
                    : 0;

                return (

                  <div
                    className="vehicle-card"
                    key={bus.id}
                  >

                    <div className="vehicle-card-top">

                      <div className="vehicle-icon">
                        <FaBusAlt />
                      </div>

                      <span className="active-badge">
                        ● Active
                      </span>

                    </div>


                    <h3>
                      {bus.bus_name}
                    </h3>


                    <p className="vehicle-number">
                      {bus.bus_number}
                    </p>


                    <div className="route-display">

                      <div>

                        <strong>
                          {bus.from_city}
                        </strong>

                        <small>
                          Departure
                        </small>

                      </div>


                      <span>
                        →
                      </span>


                      <div>

                        <strong>
                          {bus.to_city}
                        </strong>

                        <small>
                          Arrival
                        </small>

                      </div>

                    </div>


                    <div className="vehicle-info">

                      <div>

                        <span>
                          Departure
                        </span>

                        <strong>
                          {bus.departure_time ||
                            "—"}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Total Seats
                        </span>

                        <strong>
                          {seats}
                        </strong>

                      </div>

                    </div>


                    <div className="seat-progress">

                      <div className="progress-label">

                        <span>
                          Seat occupancy
                        </span>

                        <strong>
                          {booked}/{seats}
                        </strong>

                      </div>


                      <div className="progress-bar">

                        <div
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>

                      </div>


                      <small>
                        {available} seats available
                      </small>

                    </div>


                    <div className="vehicle-actions">

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEditBus(bus)
                        }
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteBus(bus.id)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                );
              })}


              {buses.length === 0 && (

                <div
                  className="dashboard-panel"
                  style={{
                    padding: "35px",
                    textAlign: "center",
                  }}
                >
                  No buses found in database.
                </div>

              )}

            </div>

          </section>

        )}


        {/* =================================================
            TRAIN MANAGEMENT
            ================================================= */}

        {activeSection === "trains" && (

          <section className="management-section">

            <div className="management-top">

              <div>

                <h2>
                  Train Management
                </h2>

                <p>
                  Train services stored through the common
                  bookings table
                </p>

              </div>

            </div>


            <div className="management-grid">

              {trains.map((train) => {

                const booked =
                  Number(train.booked || 0);

                const seats =
                  Number(train.seats || 0);

                return (

                  <div
                    className="vehicle-card"
                    key={train.id}
                  >

                    <div className="vehicle-card-top">

                      <div className="vehicle-icon train">
                        <FaTrain />
                      </div>

                      <span className="active-badge">
                        ● Active
                      </span>

                    </div>


                    <h3>
                      {train.name}
                    </h3>


                    <p className="vehicle-number">
                      Train No. {train.number}
                    </p>


                    <div className="route-display">

                      <div>

                        <strong>
                          {train.from}
                        </strong>

                        <small>
                          Departure
                        </small>

                      </div>


                      <span>
                        →
                      </span>


                      <div>

                        <strong>
                          {train.to}
                        </strong>

                        <small>
                          Arrival
                        </small>

                      </div>

                    </div>


                    <div className="vehicle-info">

                      <div>

                        <span>
                          Train Type
                        </span>

                        <strong>
                          {train.type}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Class
                        </span>

                        <strong>
                          {train.class}
                        </strong>

                      </div>

                    </div>


                    <div className="seat-progress">

                      <div className="progress-label">

                        <span>
                          Booked seats
                        </span>

                        <strong>
                          {booked}
                        </strong>

                      </div>


                      <div className="progress-bar">

                        <div
                          style={{
                            width:
                              booked > 0
                                ? "100%"
                                : "0%",
                          }}
                        ></div>

                      </div>


                      <small>
                        Based on confirmed train
                        bookings
                      </small>

                    </div>

                  </div>

                );
              })}


              {trains.length === 0 && (

                <div
                  className="dashboard-panel"
                  style={{
                    padding: "35px",
                    textAlign: "center",
                  }}
                >

                  <FaTrain
                    style={{
                      fontSize: "35px",
                      marginBottom: "10px",
                    }}
                  />

                  <h3>
                    No train bookings yet
                  </h3>

                  <p>
                    Train services will appear here
                    after a train booking is stored.
                  </p>

                </div>

              )}

            </div>

          </section>

        )}


        {/* =================================================
            BOOKINGS
            ================================================= */}

        {activeSection === "bookings" && (

          <section className="management-section">

            <div className="management-top">

              <div>

                <h2>
                  Booking Management
                </h2>

                <p>
                  View bus and train bookings from
                  the same bookings table
                </p>

              </div>


              <div className="booking-count">
                {bookings.length} Total Bookings
              </div>

            </div>


            <div className="dashboard-panel booking-table-panel">

              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Booking ID
                      </th>

                      <th>
                        Passenger
                      </th>

                      <th>
                        Transport
                      </th>

                      <th>
                        Service
                      </th>

                      <th>
                        Route
                      </th>

                      <th>
                        Seats
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {bookings.map((booking) => {

                      const isTrain =
                        String(
                          booking.transport_type ||
                            ""
                        ).toLowerCase() ===
                          "train" ||
                        booking.train_id ||
                        booking.train_name;

                      const service =
                        isTrain
                          ? booking.train_name ||
                            `Train ${
                              booking.train_number ||
                              ""
                            }`
                          : booking.bus_name ||
                            booking.operator ||
                            "Bus";

                      const route = isTrain
                        ? `${booking.from || "—"} → ${
                            booking.to || "—"
                          }`
                        : `${booking.bus_from || "—"} → ${
                            booking.bus_to || "—"
                          }`;

                      const isCancelled =
                        String(
                          booking.booking_status ||
                            ""
                        ).toLowerCase() ===
                        "cancelled";

                      return (

                        <tr
                          key={
                            booking.booking_id
                          }
                        >

                          <td>

                            <strong className="booking-id">
                              {booking.booking_id}
                            </strong>

                          </td>


                          <td>
                            {booking.passenger_name ||
                              "—"}
                          </td>


                          <td>

                            <span
                              className={
                                isTrain
                                  ? "type-train"
                                  : "type-bus"
                              }
                            >
                              {isTrain
                                ? "Train"
                                : "Bus"}
                            </span>

                          </td>


                          <td>
                            {service}
                          </td>


                          <td>
                            {route}
                          </td>


                          <td>
                            {booking.seats}
                          </td>


                          <td>

                            <strong>
                              ₹
                              {Number(
                                booking.amount ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                          </td>


                          <td>

                            <span
                              className={
                                isCancelled
                                  ? "status-cancelled"
                                  : "status-confirmed"
                              }
                            >
                              ●{" "}
                              {booking.booking_status ||
                                "Unknown"}
                            </span>

                          </td>


                          <td>

                            {!isCancelled && (

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  handleCancelBooking(
                                    booking.booking_id
                                  )
                                }
                              >
                                Cancel
                              </button>

                            )}

                          </td>

                        </tr>

                      );
                    })}


                    {bookings.length === 0 && (

                      <tr>

                        <td
                          colSpan="9"
                          style={{
                            textAlign: "center",
                            padding: "30px",
                          }}
                        >
                          No bookings found
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            ROUTES
            ================================================= */}

        {activeSection === "routes" && (

          <section className="management-section">

            <div className="management-top">

              <div>

                <h2>
                  Route Management
                </h2>

                <p>
                  Check transportation routes and
                  availability
                </p>

              </div>

            </div>


            <div className="routes-grid">

              {/* BUS ROUTES */}

              {buses.map((bus) => {

                const booked =
                  Number(
                    bus.booked_seats || 0
                  );

                const available =
                  Math.max(
                    Number(
                      bus.total_seats || 0
                    ) - booked,
                    0
                  );

                return (

                  <div
                    className="route-card"
                    key={`Bus-${bus.id}`}
                  >

                    <div className="route-card-header">

                      <span className="route-type">
                        <FaBusAlt /> Bus
                      </span>

                      <span className="active-badge">
                        ● Active
                      </span>

                    </div>


                    <h3>
                      {bus.bus_name}
                    </h3>


                    <div className="route-line">

                      <div className="route-point">

                        <span></span>

                        <strong>
                          {bus.from_city}
                        </strong>

                      </div>


                      <div className="route-arrow">
                        ↓
                      </div>


                      <div className="route-point">

                        <span></span>

                        <strong>
                          {bus.to_city}
                        </strong>

                      </div>

                    </div>


                    <div className="route-details">

                      <div>

                        <small>
                          Departure
                        </small>

                        <strong>
                          {bus.departure_time ||
                            "—"}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Booked
                        </small>

                        <strong>
                          {booked}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Available
                        </small>

                        <strong className="available-text">
                          {available}
                        </strong>

                      </div>

                    </div>

                  </div>

                );
              })}


              {/* TRAIN ROUTES */}

              {trains.map((train) => (

                <div
                  className="route-card"
                  key={`Train-${train.id}`}
                >

                  <div className="route-card-header">

                    <span className="route-type">
                      <FaTrain /> Train
                    </span>

                    <span className="active-badge">
                      ● Active
                    </span>

                  </div>


                  <h3>
                    {train.name}
                  </h3>


                  <div className="route-line">

                    <div className="route-point">

                      <span></span>

                      <strong>
                        {train.from}
                      </strong>

                    </div>


                    <div className="route-arrow">
                      ↓
                    </div>


                    <div className="route-point">

                      <span></span>

                      <strong>
                        {train.to}
                      </strong>

                    </div>

                  </div>


                  <div className="route-details">

                    <div>

                      <small>
                        Train No.
                      </small>

                      <strong>
                        {train.number}
                      </strong>

                    </div>


                    <div>

                      <small>
                        Booked
                      </small>

                      <strong>
                        {train.booked}
                      </strong>

                    </div>


                    <div>

                      <small>
                        Class
                      </small>

                      <strong className="available-text">
                        {train.class}
                      </strong>

                    </div>

                  </div>

                </div>

              ))}


              {buses.length === 0 &&
                trains.length === 0 && (

                  <div
                    className="dashboard-panel"
                    style={{
                      padding: "35px",
                      textAlign: "center",
                    }}
                  >
                    No routes found.
                  </div>

                )}

            </div>

          </section>

        )}

      </main>
<Footer />
    </div>
  );
}

export default AdminDashboard;