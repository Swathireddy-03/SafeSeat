import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Offers.css";
import Footer from "../components/Footer";
function Offers() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState("");

  const offers = [
    {
      id: 1,
      discount: "10% OFF",
      title: "First Ride Offer",
      description:
        "Get 10% off on your first SafeSeat booking.",
      code: "SAFE10",
      condition:
        "Maximum discount ₹150",
    },
    {
      id: 2,
      discount: "₹200 OFF",
      title: "Weekend Escape",
      description:
        "Save ₹200 on selected weekend journeys.",
      code: "WEEKEND200",
      condition:
        "Minimum booking value ₹999",
    },
    {
      id: 3,
      discount: "15% OFF",
      title: "SafeSeat Special",
      description:
        "Enjoy 15% off when booking multiple passengers.",
      code: "SAFE15",
      condition:
        "Minimum 2 passengers",
    },
    {
      id: 4,
      discount: "₹100 OFF",
      title: "Smart Traveller",
      description:
        "Special savings for your next SafeSeat trip.",
      code: "TRAVEL100",
      condition:
        "Minimum booking value ₹799",
    },
  ];

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  };

  return (
    <div className="offers-page">

      <header className="offers-navbar">

        <div
          className="offers-brand"
          onClick={() => navigate("/")}
        >
          <div className="offers-logo">S</div>

          <div>
            <strong>SafeSeat</strong>
            <span>Travel smarter</span>
          </div>
        </div>

        <div className="offers-nav-title">
          <strong>Offers</strong>
          <span>Save more on every journey</span>
        </div>

        <button
          className="offers-back-button"
          onClick={() => navigate("/home")}
        >
          ← Home
        </button>

      </header>

      <main className="offers-container">

        <section className="offers-hero">

          <div className="offers-hero-content">

            <span>SAFESEAT OFFERS</span>

            <h1>
              Travel more.
              <br />
              <strong>Spend less.</strong>
            </h1>

            <p>
              Discover exclusive discounts and
              special offers for your next bus
              journey.
            </p>

            <button
              onClick={() => navigate("/")}
            >
              Find a bus
              <span>→</span>
            </button>

          </div>

          <div className="offers-hero-art">
            <div className="offer-circle">
              %
            </div>

            <div className="floating-ticket">
              SAVE
            </div>
          </div>

        </section>

        <div className="offers-heading">

          <div>
            <span>AVAILABLE NOW</span>

            <h2>Exclusive offers</h2>
          </div>

          <p>
            Apply your coupon during booking.
          </p>

        </div>

        <section className="offers-grid">

          {offers.map((offer) => (
            <article
              className="offer-card"
              key={offer.id}
            >

              <div className="offer-card-top">

                <div className="offer-discount">
                  {offer.discount}
                </div>

                <span className="offer-tag">
                  LIMITED
                </span>

              </div>

              <h3>
                {offer.title}
              </h3>

              <p>
                {offer.description}
              </p>

              <small>
                {offer.condition}
              </small>

              <div className="offer-code">

                <strong>
                  {offer.code}
                </strong>

                <button
                  onClick={() =>
                    copyCode(offer.code)
                  }
                >
                  {copiedCode ===
                  offer.code
                    ? "Copied ✓"
                    : "Copy"}
                </button>

              </div>

            </article>
          ))}

        </section>

        <section className="offer-info">

          <div>
            <span>✦</span>

            <div>
              <strong>
                How to use an offer
              </strong>

              <p>
                Choose your bus, select your seats,
                and enter the coupon code at checkout.
              </p>
            </div>
          </div>

          <div>
            <span>🔒</span>

            <div>
              <strong>
                Safe & transparent
              </strong>

              <p>
                The applicable discount is shown
                before you complete your payment.
              </p>
            </div>
          </div>

        </section>

      </main>
      <Footer />
    </div>
  );
}

export default Offers;