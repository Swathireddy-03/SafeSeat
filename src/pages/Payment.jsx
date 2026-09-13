
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import Footer from "../components/Footer";

// ============================================
// BACKEND URL
// ============================================

const API_BASE_URL = "https://safeseat-1.onrender.com";

// ============================================
// GST
// ============================================

const GST_RATE = 0.18;

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================
  // GET BOOKING DATA
  // ============================================

  const booking =
    location.state ||
    JSON.parse(
      sessionStorage.getItem("safeSeatBooking") || "null"
    );

  // ============================================
  // PAYMENT STATES
  // ============================================

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiApp, setUpiApp] = useState("Google Pay");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ============================================
  // REDIRECT IF BOOKING NOT FOUND
  // ============================================

  useEffect(() => {
    if (!booking) {
      navigate("/bus-results");
    }
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

  // ============================================
  // BOOKING DETAILS
  // ============================================

  const bus = booking.bus || {};

  const from = booking.from || booking.source || "";
  const to = booking.to || booking.destination || "";

  const travelDate =
    booking.travelDate ||
    booking.journeyDate ||
    booking.date ||
    "";

  const passengers = booking.passengers || [];

  const selectedSeats =
    booking.selectedSeats ||
    booking.seats ||
    [];

  // ============================================
  // BASE FARE
  // ============================================

  const baseFare = Number(
    booking.totalAmount ||
      booking.amount ||
      bus.price ||
      0
  );

  // ============================================
  // GST - 18%
  // ============================================

  const gstAmount = Number(
    (baseFare * GST_RATE).toFixed(2)
  );

  // ============================================
  // FINAL AMOUNT INCLUDING GST
  // ============================================

  const totalAmount = Number(
    (baseFare + gstAmount).toFixed(2)
  );

  // ============================================
  // FORMAT DATE
  // ============================================

  const formattedDate = travelDate
    ? new Date(travelDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not selected";

  // ============================================
  // PAYMENT VALIDATION
  // ============================================

  const validatePayment = () => {

    if (paymentMethod === "UPI") {

      if (!upiApp) {
        setError(
          "Please select Google Pay or PhonePe."
        );

        return false;
      }

      return true;
    }

    if (paymentMethod === "Card") {

      const cleanCard =
        cardNumber.replace(/\s/g, "");

      if (cleanCard.length !== 16) {

        setError(
          "Please enter a valid 16-digit card number."
        );

        return false;
      }

      if (!cardName.trim()) {

        setError(
          "Please enter the card holder name."
        );

        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {

        setError(
          "Enter expiry date in MM/YY format."
        );

        return false;
      }

      if (!/^\d{3,4}$/.test(cvv)) {

        setError(
          "Please enter a valid CVV."
        );

        return false;
      }

      return true;
    }

    if (paymentMethod === "Netbanking") {

      if (!bank) {

        setError(
          "Please select your bank."
        );

        return false;
      }

      return true;
    }

    return true;
  };

  // ============================================
  // HANDLE PAYMENT
  // ============================================

  const handlePayment = async () => {

    setError("");

    if (!bus.id) {
      setError("Bus information is missing.");
      return;
    }

    if (!travelDate) {
      setError("Travel date is missing.");
      return;
    }

    if (!passengers.length) {
      setError("Passenger details are missing.");
      return;
    }

    if (!selectedSeats.length) {
      setError("Please select at least one seat.");
      return;
    }

    if (!baseFare || baseFare <= 0) {
      setError("Invalid payment amount.");
      return;
    }

    if (!validatePayment()) {
      return;
    }

    try {

      setProcessing(true);

      // ============================================
      // GET USER ID
      // ============================================

      const savedUser =
        JSON.parse(
          localStorage.getItem("busmateUser") || "null"
        );

      const userId =
        savedUser?.id ||
        savedUser?.userId ||
        localStorage.getItem("userId") ||
        1;

      // ============================================
      // PAYMENT METHOD
      // ============================================

      const finalPaymentMethod =
        paymentMethod === "UPI"
          ? `UPI - ${upiApp}`
          : paymentMethod;

      // ============================================
      // BOOKING PAYLOAD
      // ============================================

      const bookingPayload = {

        userId: Number(userId),

        busId: Number(bus.id),

        journeyDate: travelDate,

        seats: selectedSeats,

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

        // ============================================
        // FARE
        // ============================================

        baseAmount: Number(baseFare),

        // ============================================
        // GST
        // ============================================

        gstRate: 18,

        gstAmount: Number(gstAmount),

        // ============================================
        // FINAL AMOUNT INCLUDING GST
        // ============================================

        amount: Number(totalAmount),

        totalAmount: Number(totalAmount),

        paymentMethod:
          finalPaymentMethod,
      };

      console.log(
        "Sending booking with GST:",
        bookingPayload
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

          body: JSON.stringify(bookingPayload),
        }
      );

      const result = await response.json();

      console.log(
        "Booking response:",
        result
      );

      if (!response.ok) {

        throw new Error(
          result.message ||
            "Payment/booking failed."
        );
      }

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
      // FINAL BOOKING OBJECT
      // ============================================

      const finalBooking = {

        ...booking,

        bookingId: bookingId,

        databaseId:
          result.id ||
          result.booking?.id ||
          bookingId,

        bookingResult:
          result,

        bus,

        passengers,

        seats:
          selectedSeats,

        selectedSeats,

        from,

        to,

        travelDate,

        journeyDate:
          travelDate,

        paymentMethod:
          finalPaymentMethod,

        // ============================================
        // GST DETAILS
        // ============================================

        baseAmount:
          Number(baseFare),

        gstRate: 18,

        gstAmount:
          Number(gstAmount),

        totalAmount:
          Number(totalAmount),

        paymentStatus:
          "Paid",

        bookingStatus:
          "Confirmed",

        bookedAt:
          new Date().toISOString(),
      };

      // ============================================
      // SAVE CURRENT BOOKING
      // ============================================

      sessionStorage.setItem(
        "safeSeatBooking",
        JSON.stringify(finalBooking)
      );

      // ============================================
      // SAVE TO MY BOOKINGS
      // ============================================

      const existingBookings =
        JSON.parse(
          localStorage.getItem(
            "safeSeatBookings"
          ) || "[]"
        );

      existingBookings.push(
        finalBooking
      );

      localStorage.setItem(
        "safeSeatBookings",
        JSON.stringify(
          existingBookings
        )
      );

      // ============================================
      // GO TO CONFIRMATION
      // ============================================

      navigate(
        "/booking-confirmation",
        {
          state: finalBooking,
        }
      );

    } catch (err) {

      console.error(
        "Payment error:",
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
  // UI
  // ============================================

  return (
    <>
      <div className="payment-page">

        {/* NAVBAR */}

        <nav className="payment-navbar">

          <div
            className="payment-logo"
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

        <div className="payment-header">

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Secure payment for your bus journey
          </p>

        </div>

        {/* PROGRESS */}

        <div className="payment-progress">

          <div className="progress-step completed">
            <span>✓</span>
            Seats
          </div>

          <div className="progress-line active"></div>

          <div className="progress-step completed">
            <span>✓</span>
            Passenger
          </div>

          <div className="progress-line active"></div>

          <div className="progress-step active">
            <span>3</span>
            Payment
          </div>

          <div className="progress-line"></div>

          <div className="progress-step">
            <span>4</span>
            Confirmation
          </div>

        </div>

        <div className="payment-container">

          {/* LEFT */}

          <div className="payment-main">

            <div className="payment-card">

              <h2>
                Choose Payment Method
              </h2>

              {/* PAYMENT METHODS */}

              <div className="payment-methods">

                {/* UPI */}

                <button
                  className={
                    paymentMethod === "UPI"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {

                    setPaymentMethod("UPI");
                    setError("");

                  }}
                >

                  <span className="method-icon">
                    📱
                  </span>

                  <div>

                    <strong>
                      UPI
                    </strong>

                    <small>
                      Google Pay / PhonePe
                    </small>

                  </div>

                </button>

                {/* CARD */}

                <button
                  className={
                    paymentMethod === "Card"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {

                    setPaymentMethod("Card");
                    setError("");

                  }}
                >

                  <span className="method-icon">
                    💳
                  </span>

                  <div>

                    <strong>
                      Card
                    </strong>

                    <small>
                      Credit / Debit Card
                    </small>

                  </div>

                </button>

                {/* NET BANKING */}

                <button
                  className={
                    paymentMethod === "Netbanking"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() => {

                    setPaymentMethod(
                      "Netbanking"
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

              </div>

              {/* ============================================
                  UPI
              ============================================ */}

              {paymentMethod === "UPI" && (

                <div className="payment-form">

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

                        {upiApp ===
                        "Google Pay"
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

                        setUpiApp(
                          "PhonePe"
                        );

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

                        {upiApp ===
                        "PhonePe"
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

              {paymentMethod === "Card" && (

                <div className="payment-form">

                  <div className="form-group">

                    <label>
                      Card Number
                    </label>

                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      value={cardNumber}
                      onChange={(e) => {

                        const value =
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 16);

                        const formatted =
                          value.match(
                            /.{1,4}/g
                          )?.join(" ") || "";

                        setCardNumber(
                          formatted
                        );

                      }}
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Card Holder Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter card holder name"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(
                          e.target.value
                        )
                      }
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
                        value={expiry}
                        onChange={(e) => {

                          let value =
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4);

                          if (
                            value.length > 2
                          ) {

                            value =
                              value.slice(0, 2) +
                              "/" +
                              value.slice(2);

                          }

                          setExpiry(
                            value
                          );

                        }}
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
                        value={cvv}
                        onChange={(e) =>
                          setCvv(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 4)
                          )
                        }
                      />

                    </div>

                  </div>

                </div>
              )}

              {/* ============================================
                  NET BANKING
              ============================================ */}

              {paymentMethod === "Netbanking" && (

                <div className="payment-form">

                  <div className="form-group">

                    <label>
                      Select Bank
                    </label>

                    <select
                      value={bank}
                      onChange={(e) =>
                        setBank(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        Select your bank
                      </option>

                      <option value="SBI">
                        State Bank of India
                      </option>

                      <option value="HDFC">
                        HDFC Bank
                      </option>

                      <option value="ICICI">
                        ICICI Bank
                      </option>

                      <option value="Axis">
                        Axis Bank
                      </option>

                      <option value="Kotak">
                        Kotak Mahindra Bank
                      </option>

                    </select>

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
                className="pay-button"
                onClick={handlePayment}
                disabled={processing}
              >

                {processing
                  ? "Processing..."
                  : `Pay ₹${Number(
                      totalAmount
                    ).toLocaleString("en-IN")}`}

              </button>

            </div>

          </div>

          {/* ============================================
              BOOKING SUMMARY
          ============================================ */}

          <div className="payment-summary">

            <h2>
              Booking Summary
            </h2>

            <div className="summary-bus">

              <strong>
                {bus.operator ||
                  bus.name ||
                  "Bus"}
              </strong>

              <span>
                {bus.busType ||
                  "Bus"}
              </span>

            </div>

            <div className="summary-route">

              <div>

                <strong>
                  {from}
                </strong>

                <span>
                  From
                </span>

              </div>

              <span className="route-arrow">
                →
              </span>

              <div>

                <strong>
                  {to}
                </strong>

                <span>
                  To
                </span>

              </div>

            </div>

            <div className="summary-info">

              <div>

                <span>
                  Travel Date
                </span>

                <strong>
                  {formattedDate}
                </strong>

              </div>

              <div>

                <span>
                  Seats
                </span>

                <strong>
                  {selectedSeats.join(", ")}
                </strong>

              </div>

              <div>

                <span>
                  Passengers
                </span>

                <strong>
                  {passengers.length}
                </strong>

              </div>

            </div>

            {/* ============================================
                TICKET FARE
            ============================================ */}

            <div className="summary-info">

              <div>

                <span>
                  Ticket Fare
                </span>

                <strong>
                  ₹
                  {Number(
                    baseFare
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

              <div>

                <span>
                  GST (18%)
                </span>

                <strong>
                  ₹
                  {Number(
                    gstAmount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>

            </div>

            {/* ============================================
                FINAL TOTAL
            ============================================ */}

            <div className="summary-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {Number(
                  totalAmount
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Payment;

