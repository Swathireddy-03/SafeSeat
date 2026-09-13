import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =====================================================
// PAGES
// =====================================================

import Home from "./pages/Home";
import BusResults from "./pages/BusResults";
import PassengerDetails from "./pages/PassengerDetails";
import SeatSelection from "./pages/SeatSelection";
import Explore from "./pages/Explore";
import BookingSummary from "./pages/BookingSummary";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyTrips from "./pages/MyTrips";
import Offers from "./pages/Offers";
import Help from "./pages/Help";
import TrainResults from "./pages/TrainResults";
import TrainSeatSelection from "./pages/TrainSeatSelection";
import TrainPassengerDetails from "./pages/TrainPassengerDetails";
import TrainPayment from "./pages/TrainPayment";
import TrackTicket from "./pages/TrackTicket";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import LoginSelection from "./pages/LoginSelection";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

// =====================================================
// CSS
// =====================================================

import "./App.css";


// =====================================================
// APP CONTENT
// =====================================================

function AppContent() {
  return (
    <>
      <Routes>

        {/* =================================================
            LANDING PAGE
        ================================================= */}

        <Route
          path="/"
          element={<Landing />}
        />


        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/home"
          element={<Home />}
        />


        {/* =================================================
            LOGIN / SIGNUP
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/login-selection"
          element={<LoginSelection />}
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />


        {/* =================================================
            TRACK TICKET
        ================================================= */}

        <Route
          path="/track-ticket"
          element={<TrackTicket />}
        />


        {/* =================================================
            BUS RESULTS
        ================================================= */}

        <Route
          path="/results"
          element={<BusResults />}
        />

        <Route
          path="/bus-results"
          element={<BusResults />}
        />


        {/* =================================================
            BUS SEAT SELECTION
        ================================================= */}

        <Route
          path="/seats/:busId"
          element={<SeatSelection />}
        />


        {/* =================================================
            PASSENGER DETAILS
        ================================================= */}

        <Route
          path="/passenger-details"
          element={<PassengerDetails />}
        />


        {/* =================================================
            BOOKING SUMMARY
        ================================================= */}

        <Route
          path="/booking-summary"
          element={<BookingSummary />}
        />


        {/* =================================================
            BUS PAYMENT
        ================================================= */}

        <Route
          path="/payment"
          element={<Payment />}
        />


        {/* =================================================
            BUS BOOKING CONFIRMATION
        ================================================= */}

        <Route
          path="/booking-confirmation"
          element={<BookingConfirmation />}
        />


        {/* =================================================
            EXPLORE
        ================================================= */}

        <Route
          path="/explore"
          element={<Explore />}
        />


        {/* =================================================
            MY TRIPS
        ================================================= */}

        <Route
          path="/my-trips"
          element={<MyTrips />}
        />


        {/* =================================================
            OFFERS
        ================================================= */}

        <Route
          path="/offers"
          element={<Offers />}
        />


        {/* =================================================
            HELP
        ================================================= */}

        <Route
          path="/help"
          element={<Help />}
        />


        {/* =================================================
            TRAIN RESULTS
        ================================================= */}

        <Route
          path="/train-results"
          element={<TrainResults />}
        />


        {/* =================================================
            TRAIN SEAT SELECTION
        ================================================= */}

        <Route
          path="/train-seats/:id"
          element={<TrainSeatSelection />}
        />


        {/* =================================================
            TRAIN PASSENGER DETAILS
        ================================================= */}

        <Route
          path="/train-passenger-details"
          element={<TrainPassengerDetails />}
        />


        {/* =================================================
            TRAIN PAYMENT
        ================================================= */}

        <Route
          path="/train-payment"
          element={<TrainPayment />}
        />

      </Routes>
    </>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default App;