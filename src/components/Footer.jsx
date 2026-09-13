import "./Footer.css";

import {
  FaBus,
  FaTrain,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaShieldAlt,
  FaHeart,
  FaArrowRight,
} from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="safe-footer">

      {/* =========================================
          MAIN FOOTER
      ========================================= */}

      <div className="safe-footer-main">

        {/* =========================================
            BRAND SECTION
        ========================================= */}

        <div className="safe-footer-brand">

          <div className="safe-footer-logo">
            <div className="safe-footer-logo-icon">
              <FaBus />
            </div>

            <div>
              <h2>SafeSeat</h2>
              <span>Travel smarter</span>
            </div>
          </div>


          <p className="safe-footer-description">
            Your smarter travel companion for comfortable
            and safer bus and train journeys. Choose your
            journey, select your seat, and travel with confidence.
          </p>


          {/* Contact */}

          <div className="safe-footer-contact">

            <div className="safe-contact-item">
              <span>
                <FaMapMarkerAlt />
              </span>

              <p>
                Safe & Smart Travel
              </p>
            </div>


            <div className="safe-contact-item">
              <span>
                <FaPhoneAlt />
              </span>

              <p>
                Travel Support Available
              </p>
            </div>


            <div className="safe-contact-item">
              <span>
                <FaEnvelope />
              </span>

              <p>
                support@safeseat.com
              </p>
            </div>

          </div>


          {/* Social */}

          <div className="safe-footer-follow">

            <h4>
              Follow Our Journey
            </h4>

            <div className="safe-social-icons">

              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>

            </div>

          </div>

        </div>


        {/* =========================================
            QUICK LINKS
        ========================================= */}

        <div className="safe-footer-column">

          <h3>
            Quick Links
          </h3>

          <a href="/">
            Home
          </a>

          <a href="/explore">
            Explore
          </a>

          <a href="/my-trips">
            My Trips
          </a>

          <a href="/offers">
            Offers
          </a>

          <a href="/track-ticket">
            Track Ticket
          </a>

          <a href="/help">
            Help Center
          </a>

        </div>


        {/* =========================================
            TRAVEL
        ========================================= */}

        <div className="safe-footer-column">

          <h3>
            Travel
          </h3>

          <a href="/">
            <FaBus />
            Bus Booking
          </a>

          <a href="/train-results">
            <FaTrain />
            Train Booking
          </a>

          <a href="/explore">
            Popular Routes
          </a>

          <a href="/offers">
            Special Offers
          </a>

          <a href="/my-trips">
            Manage Trips
          </a>

        </div>


        {/* =========================================
            SUPPORT
        ========================================= */}

        <div className="safe-footer-column safe-support-column">

          <h3>
            Support
          </h3>

          <a href="/help">
            Help Center
          </a>

          <a href="/help">
            Booking Support
          </a>

          <a href="/track-ticket">
            Track Your Ticket
          </a>

          <a href="/help">
            Safety Information
          </a>


          {/* Safety Cards */}

          <div className="safe-footer-badge">

            <div className="safe-badge-icon">
              <FaShieldAlt />
            </div>

            <div>
              <strong>
                SafeSeat Protected
              </strong>

              <span>
                Travel with confidence
              </span>
            </div>

          </div>


          <div className="safe-footer-badge second">

            <div className="safe-badge-icon">
              <FaHeart />
            </div>

            <div>
              <strong>
                Safety First
              </strong>

              <span>
                Your comfort matters
              </span>
            </div>

          </div>

        </div>

      </div>


      {/* =========================================
          BOTTOM BAR
      ========================================= */}

      <div className="safe-footer-bottom">

        <div className="safe-footer-copyright">

          <span>
            © {currentYear} SafeSeat. All rights reserved.
          </span>

          <span className="safe-footer-made">
            Made with
            <FaHeart />
            for safer journeys
          </span>

        </div>


        {/* Developers */}

        <div className="safe-footer-developers">

          <span>
            Designed & Developed by
          </span>

          <div className="developer-names">

            <strong>
              Sana Afreen
            </strong>

            <span>
              &
            </span>

            <strong>
              Swathi Reddy
            </strong>

          </div>

          <FaArrowRight className="developer-arrow" />

        </div>

      </div>

    </footer>
  );
}

export default Footer;