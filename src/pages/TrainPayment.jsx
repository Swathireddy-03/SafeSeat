
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TrainPayment.css";
import Footer from "../components/Footer";

// ============================================
// BACKEND URL
// ============================================

const API_BASE_URL = "https://safeseat.onrender.com";

// ============================================
// GST
// ============================================

const GST_RATE = 0.18;

function TrainPayment() {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================
  // BOOKING DATA
  // ============================================

  const booking =
    location.state ||
    JSON.parse(
      sessionStorage.getItem("safeSeatBooking") || "null"
    );

  // ============================================
  // PAYMENT STATES
  // ============================================

  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [upiApp, setUpiApp] = useState("Google Pay");

  const [processing, setProcessing] = useState(false);

  const [paymentSuccess, setPaymentSuccess] =
    useState(false);

  const [savedBooking, setSavedBooking] =
    useState(null);

  const [error, setError] = useState("");

  // ============================================
  // NO BOOKING
  // ============================================

  if (!booking) {
    return (
      <>
        <div className="train-payment-page">

          <div className="payment-error-card">

            <h2>Booking Details Not Found</h2>

            <p>
              Please select your train and seats again.
            </p>

            <button
              onClick={() => navigate("/train-results")}
            >
              Back to Train Results
            </button>

          </div>

        </div>

        <Footer />
      </>
    );
  }

  // ============================================
  // DETAILS
  // ============================================

  const passengers = booking.passengers || [];

  // Original ticket fare before GST
  const baseFare = Number(
    booking.totalAmount ||
      booking.amount ||
      0
  );

  // ============================================
  // GST CALCULATION - 18%
  // ============================================

  const gstAmount = Number(
    (baseFare * GST_RATE).toFixed(2)
  );

  const finalAmount = Number(
    (baseFare + gstAmount).toFixed(2)
  );

  const selectedSeats = passengers
    .map((passenger) => passenger.seat)
    .filter(Boolean);

  // ============================================
  // HANDLE PAYMENT
  // ============================================

  const handlePayment = async () => {

    setError("");

    if (!passengers.length) {
      setError("Passenger details are missing.");
      return;
    }

    if (!selectedSeats.length) {
      setError("Seat details are missing.");
      return;
    }

    if (!baseFare || baseFare <= 0) {
      setError("Invalid payment amount.");
      return;
    }

    try {

      setProcessing(true);

      // ============================================
      // GET USER
      // ============================================

      const savedUser = JSON.parse(
        localStorage.getItem("safeSeatUser") ||
          "null"
      );

      const storedUserId =
        localStorage.getItem("safeSeatUserId");

      const finalUserId =
        savedUser?.id ||
        savedUser?.userId ||
        storedUserId;

      if (!finalUserId) {

        alert(
          "Please login before making a payment."
        );

        navigate("/login");

        return;
      }

      // ============================================
      // PAYMENT METHOD
      // ============================================

      const finalPaymentMethod =
        paymentMethod === "upi"
          ? `UPI - ${upiApp}`
          : paymentMethod;

      // ============================================
      // BOOKING DATA
      // ============================================

      const bookingData = {

        userId: Number(finalUserId),

        transportType: "train",
        mode: "train",
        type: "train",

        trainId:
          booking.train?.id ||
          booking.trainId ||
          booking.id,

        trainName:
          booking.train?.name ||
          booking.trainName ||
          "Train",

        trainNumber:
          booking.train?.number ||
          booking.trainNumber ||
          "",

        trainType:
          booking.train?.type ||
          booking.trainType ||
          "",

        class:
          booking.class ||
          booking.trainClass ||
          "",

        journeyDate:
          booking.journeyDate ||
          booking.travelDate ||
          booking.date,

        from:
          booking.from ||
          booking.source ||
          "",

        to:
          booking.to ||
          booking.destination ||
          "",

        departure:
          booking.departure ||
          booking.train?.departure ||
          "",

        arrival:
          booking.arrival ||
          booking.train?.arrival ||
          "",

        seats: selectedSeats,

        selectedSeats: selectedSeats,

        seatNumber:
          selectedSeats.join(", "),

        passengerName:
          passengers[0]?.name ||
          passengers[0]?.passengerName ||
          "Passenger",

        passengerAge:
          passengers[0]?.age ||
          passengers[0]?.passengerAge ||
          null,

        passengerGender:
          passengers[0]?.gender ||
          passengers[0]?.passengerGender ||
          "",

        passengers: passengers,

        // ============================================
        // AMOUNT + GST
        // ============================================

        baseAmount: Number(baseFare),

        gstRate: 18,

        gstAmount: Number(gstAmount),

        // Final amount including GST
        amount: Number(finalAmount),

        totalAmount: Number(finalAmount),

        paymentMethod:
          finalPaymentMethod,
      };

      console.log(
        "Sending train booking with GST:",
        bookingData
      );

      // ============================================
      // CREATE BOOKING
      // ============================================

      const response = await fetch(
        `${API_BASE_URL}/api/bookings`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(bookingData),
        }
      );

      const result = await response.json();

      console.log(
        "Train booking response:",
        result
      );

      if (!response.ok) {

        throw new Error(
          result.message ||
            "Payment/booking failed."
        );

      }

      if (!result.success) {

        throw new Error(
          result.message ||
            "Booking was not successful."
        );

      }

      // ============================================
      // GET BOOKING ID
      // ============================================

      const bookingId =
        result.bookingId ||
        result.id ||
        result.booking?.bookingId ||
        result.booking?.id;

      if (!bookingId) {

        throw new Error(
          "Booking created but booking ID was not received."
        );

      }

      // ============================================
      // UPDATED BOOKING
      // ============================================

      const updatedBooking = {

        ...booking,

        bookingId: bookingId,

        databaseId:
          result.id ||
          result.booking?.id ||
          bookingId,

        userId: Number(finalUserId),

        transportType: "train",

        mode: "train",

        type: "train",

        trainId:
          bookingData.trainId,

        trainName:
          bookingData.trainName,

        trainNumber:
          bookingData.trainNumber,

        trainType:
          bookingData.trainType,

        class:
          bookingData.class,

        journeyDate:
          bookingData.journeyDate,

        from:
          bookingData.from,

        to:
          bookingData.to,

        departure:
          bookingData.departure,

        arrival:
          bookingData.arrival,

        bookingStatus: "Confirmed",

        paymentMethod:
          finalPaymentMethod,

        paymentStatus: "Paid",

        bookedAt:
          new Date().toISOString(),

        passengerCount:
          passengers.length,

        passengers:
          passengers,

        seats:
          selectedSeats,

        selectedSeats:
          selectedSeats,

        // ============================================
        // GST DETAILS SAVED
        // ============================================

        baseAmount:
          Number(baseFare),

        gstRate: 18,

        gstAmount:
          Number(gstAmount),

        totalAmount:
          Number(finalAmount),

        bookingResult:
          result,
      };

      // ============================================
      // SAVE CURRENT BOOKING
      // ============================================

      sessionStorage.setItem(
        "safeSeatBooking",
        JSON.stringify(updatedBooking)
      );

      // ============================================
      // SAVE TO MY TRIPS
      // ============================================

      const existingBookings =
        JSON.parse(
          localStorage.getItem(
            "safeSeatBookings"
          ) || "[]"
        );

      const updatedBookings = [
        updatedBooking,
        ...existingBookings,
      ];

      localStorage.setItem(
        "safeSeatBookings",
        JSON.stringify(
          updatedBookings
        )
      );

      // ============================================
      // SUCCESS
      // ============================================

      setSavedBooking(
        updatedBooking
      );

      setPaymentSuccess(true);

    } catch (err) {

      console.error(
        "Train payment error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while processing the payment."
      );

    } finally {

      setProcessing(false);

    }
  };

  // ============================================
  // SUCCESS SCREEN
  // ============================================

  if (paymentSuccess && savedBooking) {

    return (
      <>
        <div className="train-payment-page">

          <div className="train-payment-success">

            <div className="success-icon">
              ✓
            </div>

            <h1>
              Payment Successful!
            </h1>

            <p>
              Your train ticket has been
              booked successfully.
            </p>

            <div className="success-booking-card">

              <div>
                <span>Booking ID</span>

                <strong>
                  {savedBooking.bookingId}
                </strong>
              </div>

              <div>
                <span>Train</span>

                <strong>
                  {savedBooking.trainName}
                </strong>
              </div>

              <div>
                <span>Seats</span>

                <strong>
                  {savedBooking.seats.join(", ")}
                </strong>
              </div>

              <div>
                <span>Payment</span>

                <strong>
                  {savedBooking.paymentMethod}
                </strong>
              </div>

              {/* BASE FARE */}

              <div>
                <span>Ticket Fare</span>

                <strong>
                  ₹
                  {Number(
                    savedBooking.baseAmount
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              {/* GST */}

              <div>
                <span>GST (18%)</span>

                <strong>
                  ₹
                  {Number(
                    savedBooking.gstAmount
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              {/* TOTAL */}

              <div>
                <span>Total Amount Paid</span>

                <strong>
                  ₹
                  {Number(
                    savedBooking.totalAmount
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

            </div>

            <button
              className="my-trips-btn"
              onClick={() =>
                navigate("/my-trips")
              }
            >
              View My Trips
            </button>

          </div>

        </div>

        <Footer />
      </>
    );
  }

  // ============================================
  // PAYMENT PAGE
  // ============================================

  return (
    <>
      <div className="train-payment-page">

        {/* NAVBAR */}

        <nav className="train-payment-navbar">

          <div
            className="train-payment-logo"
            onClick={() => navigate("/")}
          >
            Safe<span>Seat</span>
          </div>

          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

        </nav>

        {/* HEADER */}

        <div className="train-payment-header">

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Secure payment for your train journey
          </p>

        </div>

        {/* CONTENT */}

        <div className="train-payment-container">

          {/* PAYMENT CARD */}

          <div className="train-payment-card">

            <h2>
              Choose Payment Method
            </h2>

            {/* PAYMENT METHODS */}

            <div className="train-payment-methods">

              {/* UPI */}

              <button
                className={
                  paymentMethod === "upi"
                    ? "train-method active"
                    : "train-method"
                }
                onClick={() => {
                  setPaymentMethod("upi");
                  setError("");
                }}
              >
                <span className="method-icon">
                  📱
                </span>

                <div>
                  <strong>UPI</strong>

                  <small>
                    Google Pay / PhonePe
                  </small>
                </div>
              </button>

              {/* CARD */}

              <button
                className={
                  paymentMethod === "card"
                    ? "train-method active"
                    : "train-method"
                }
                onClick={() => {
                  setPaymentMethod("card");
                  setError("");
                }}
              >
                <span className="method-icon">
                  💳
                </span>

                <div>
                  <strong>Card</strong>

                  <small>
                    Credit / Debit Card
                  </small>
                </div>
              </button>

              {/* NET BANKING */}

              <button
                className={
                  paymentMethod === "netbanking"
                    ? "train-method active"
                    : "train-method"
                }
                onClick={() => {
                  setPaymentMethod(
                    "netbanking"
                  );
                  setError("");
                }}
              >
                <span className="method-icon">
                  🏦
                </span>

                <div>
                  <strong>
                    Net Banking
                  </strong>

                  <small>
                    Pay using your bank
                  </small>
                </div>
              </button>

              {/* WALLET */}

              <button
                className={
                  paymentMethod === "wallet"
                    ? "train-method active"
                    : "train-method"
                }
                onClick={() => {
                  setPaymentMethod("wallet");
                  setError("");
                }}
              >
                <span className="method-icon">
                  👛
                </span>

                <div>
                  <strong>Wallet</strong>

                  <small>
                    Digital wallet
                  </small>
                </div>
              </button>

            </div>

            {/* ============================================
                UPI
            ============================================ */}

            {paymentMethod === "upi" && (

              <div className="train-payment-form">

                <h3>
                  Select UPI App
                </h3>

                <p className="payment-info">
                  Choose your preferred UPI app
                  to continue.
                </p>

                <div className="upi-apps">

                  {/* GOOGLE PAY */}

                  <button
                    type="button"
                    className={
                      upiApp === "Google Pay"
                        ? "upi-app active"
                        : "upi-app"
                    }
                    onClick={() => {
                      setUpiApp(
                        "Google Pay"
                      );
                      setError("");
                    }}
                  >

                    <div className="upi-logo gpay-logo">
                      G
                    </div>

                    <div className="upi-details">

                      <strong>
                        Google Pay
                      </strong>

                      <span>
                        Pay securely with GPay
                      </span>

                    </div>

                    <div className="upi-radio">

                      {upiApp === "Google Pay"
                        ? "✓"
                        : ""}

                    </div>

                  </button>

                  {/* PHONEPE */}

                  <button
                    type="button"
                    className={
                      upiApp === "PhonePe"
                        ? "upi-app active"
                        : "upi-app"
                    }
                    onClick={() => {
                      setUpiApp("PhonePe");
                      setError("");
                    }}
                  >

                    <div className="upi-logo phonepe-logo">
                      P
                    </div>

                    <div className="upi-details">

                      <strong>
                        PhonePe
                      </strong>

                      <span>
                        Pay securely with PhonePe
                      </span>

                    </div>

                    <div className="upi-radio">

                      {upiApp === "PhonePe"
                        ? "✓"
                        : ""}

                    </div>

                  </button>

                </div>

                <div className="secure-payment-note">
                  🔒 Your payment information is secure
                </div>

              </div>
            )}

            {/* ============================================
                CARD
            ============================================ */}

            {paymentMethod === "card" && (

              <div className="train-payment-form">

                <div className="form-group">

                  <label>
                    Card Number
                  </label>

                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Card Holder Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter card holder name"
                  />

                </div>

                <div className="form-row">

                  <div className="form-group">

                    <label>
                      Expiry
                    </label>

                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      placeholder="CVV"
                      maxLength="4"
                    />

                  </div>

                </div>

              </div>
            )}

            {/* ============================================
                NET BANKING
            ============================================ */}

            {paymentMethod === "netbanking" && (

              <div className="train-payment-form">

                <div className="form-group">

                  <label>
                    Select Bank
                  </label>

                  <select>

                    <option>
                      Select your bank
                    </option>

                    <option>
                      State Bank of India
                    </option>

                    <option>
                      HDFC Bank
                    </option>

                    <option>
                      ICICI Bank
                    </option>

                    <option>
                      Axis Bank
                    </option>

                    <option>
                      Kotak Mahindra Bank
                    </option>

                  </select>

                </div>

              </div>
            )}

            {/* ============================================
                WALLET
            ============================================ */}

            {paymentMethod === "wallet" && (

              <div className="train-payment-form">

                <div className="wallet-options">

                  <div className="wallet-option">

                    <span>👛</span>

                    <strong>
                      Paytm Wallet
                    </strong>

                  </div>

                  <div className="wallet-option">

                    <span>💰</span>

                    <strong>
                      Other Wallet
                    </strong>

                  </div>

                </div>

              </div>
            )}

            {/* ERROR */}

            {error && (

              <div className="payment-error">
                ⚠️ {error}
              </div>

            )}

            {/* PAY BUTTON */}

            <button
              className="train-pay-button"
              onClick={handlePayment}
              disabled={processing}
            >

              {processing
                ? "Processing..."
                : `Pay ₹${Number(
                    finalAmount
                  ).toLocaleString("en-IN")}`}

            </button>

          </div>

          {/* ============================================
              SUMMARY
          ============================================ */}

          <div className="train-payment-summary">

            <h2>
              Booking Summary
            </h2>

            <div className="train-summary-item">

              <span>
                Train
              </span>

              <strong>
                {booking.train?.name ||
                  booking.trainName ||
                  "Train"}
              </strong>

            </div>

            <div className="train-summary-route">

              <div>

                <strong>
                  {booking.from ||
                    booking.source ||
                    ""}
                </strong>

                <span>
                  From
                </span>

              </div>

              <span>
                →
              </span>

              <div>

                <strong>
                  {booking.to ||
                    booking.destination ||
                    ""}
                </strong>

                <span>
                  To
                </span>

              </div>

            </div>

            <div className="train-summary-item">

              <span>
                Journey Date
              </span>

              <strong>
                {booking.journeyDate ||
                  booking.travelDate ||
                  booking.date ||
                  "Not selected"}
              </strong>

            </div>

            <div className="train-summary-item">

              <span>
                Seats
              </span>

              <strong>
                {selectedSeats.join(", ")}
              </strong>

            </div>

            <div className="train-summary-item">

              <span>
                Passengers
              </span>

              <strong>
                {passengers.length}
              </strong>

            </div>

            {/* ============================================
                FARE
            ============================================ */}

            <div className="train-summary-item">

              <span>
                Ticket Fare
              </span>

              <strong>
                ₹
                {Number(
                  baseFare
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            {/* ============================================
                GST
            ============================================ */}

            <div className="train-summary-item">

              <span>
                GST (18%)
              </span>

              <strong>
                ₹
                {Number(
                  gstAmount
                ).toLocaleString("en-IN")}
              </strong>

            </div>

            {/* ============================================
                FINAL TOTAL
            ============================================ */}

            <div className="train-summary-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {Number(
                  finalAmount
                ).toLocaleString("en-IN")}
              </strong>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default TrainPayment;

