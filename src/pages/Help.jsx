import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Help.css";
import Footer from "../components/Footer";
function Help() {
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question:
        "How do I book a bus ticket?",
      answer:
        "Enter your source, destination, travel date and passenger count on the SafeSeat home page. Select a bus, choose seats, enter passenger details and complete the payment.",
    },
    {
      question:
        "How does SafeSeat seat protection work?",
      answer:
        "SafeSeat allows passengers to choose their preferred surrounding passengers. You can select women, men or no preference before choosing your seat.",
    },
    {
      question:
        "Where can I find my booking?",
      answer:
        "After successful payment, your confirmed booking is saved under My Trips. You can view your bus, route, passengers, seats and booking ID there.",
    },
    {
      question:
        "What payment methods are supported?",
      answer:
        "SafeSeat currently supports UPI, credit/debit cards and net banking in the payment interface.",
    },
    {
      question:
        "Can I change my selected seat?",
      answer:
        "Yes. Before completing the booking, you can return to the seat selection page and change your selected seat.",
    },
    {
      question:
        "What should I do if payment fails?",
      answer:
        "Check your payment details and try again. If the issue continues, contact SafeSeat support with your booking information.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(
      openFaq === index ? null : index
    );
  };

  return (
    <div className="help-page">

      <header className="help-navbar">

        <div
          className="help-brand"
          onClick={() => navigate("/")}
        >
          <div className="help-logo">S</div>

          <div>
            <strong>SafeSeat</strong>
            <span>Travel smarter</span>
          </div>
        </div>

        <div className="help-nav-title">
          <strong>Help Center</strong>
          <span>We're here to help</span>
        </div>

        <button
          className="help-back-button"
          onClick={() => navigate("/home")}
        >
          ← Home
        </button>

      </header>

      <main className="help-container">

        <section className="help-hero">

          <div>

            <span>SAFESEAT SUPPORT</span>

            <h1>
              How can we
              <strong> help?</strong>
            </h1>

            <p>
              Find quick answers to common questions
              about booking, seats, payments and
              trips.
            </p>

          </div>

          <div className="help-hero-icon">
            ?
          </div>

        </section>

        <div className="help-section-heading">

          <div>
            <span>FREQUENTLY ASKED QUESTIONS</span>

            <h2>
              Common questions
            </h2>
          </div>

        </div>

        <section className="faq-list">

          {faqs.map((faq, index) => (
            <div
              className={`faq-item ${
                openFaq === index
                  ? "faq-open"
                  : ""
              }`}
              key={index}
            >

              <button
                type="button"
                onClick={() =>
                  toggleFaq(index)
                }
              >
                <span>
                  {faq.question}
                </span>

                <strong>
                  {openFaq === index
                    ? "−"
                    : "+"}
                </strong>
              </button>

              {openFaq === index && (
                <div className="faq-answer">
                  <p>
                    {faq.answer}
                  </p>
                </div>
              )}

            </div>
          ))}

        </section>

        <section className="help-contact">

          <div className="help-contact-icon">
            ✦
          </div>

          <div>

            <span>
              STILL NEED HELP?
            </span>

            <h2>
              Talk to SafeSeat support
            </h2>

            <p>
              Our support team can help with
              booking, payment and trip-related
              questions.
            </p>

          </div>

          <button
            onClick={() =>
              alert(
                "SafeSeat support: support@safeseat.com"
              )
            }
          >
            Contact support
            <span>→</span>
          </button>

        </section>

      </main>
      <Footer />
    </div>
  );
}

export default Help;