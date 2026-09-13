import { useLocation, useNavigate } from "react-router-dom";
import "./TrainResults.css";
import Footer from "../components/Footer";
function TrainResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    from = "Hyderabad",
    to = "Bengaluru",
    date = "",
    passengers = 1,
  } = location.state || {};

  const trains = [
    {
      id: 1,
      name: "Vande Bharat Express",
      number: "20643",
      departure: "06:00 AM",
      arrival: "11:15 AM",
      duration: "5h 15m",
      price: 850,
      class: "AC Chair Car",
    },
    {
      id: 2,
      name: "Intercity Express",
      number: "12785",
      departure: "07:30 AM",
      arrival: "02:00 PM",
      duration: "6h 30m",
      price: 620,
      class: "AC Chair Car",
    },
    {
      id: 3,
      name: "Superfast Express",
      number: "12723",
      departure: "09:45 PM",
      arrival: "06:30 AM",
      duration: "8h 45m",
      price: 740,
      class: "3A",
    },
  ];

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Select travel date";
    }

    const selectedDate = new Date(
      `${dateValue}T00:00:00`
    );

    if (Number.isNaN(selectedDate.getTime())) {
      return dateValue;
    }

    return selectedDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSelectTrain = (train) => {
    const bookingSearchData = {
      mode: "train",
      transportMode: "train",
      from,
      to,
      date,
      travelDate: date,
      formattedDate: formatDate(date),
      passengers: Number(passengers) || 1,
      passengerCount: Number(passengers) || 1,
      train,
    };

    sessionStorage.setItem(
      "safeSeatBooking",
      JSON.stringify(bookingSearchData)
    );

    navigate(`/train-seats/${train.id}`, {
      state: bookingSearchData,
    });
  };

  return (
    <div className="train-results-page">

      <header className="results-navbar">

        <div
          className="results-logo"
          onClick={() => navigate("/home")}
        >
          <div className="results-logo-icon">
            S
          </div>

          <div>
            <strong>SafeSeat</strong>
            <span>Travel smarter</span>
          </div>
        </div>

        <button
          type="button"
          className="back-home-button"
          onClick={() => navigate("/home")}
        >
          ← Back to Home
        </button>

      </header>

      <main className="train-results-container">

        <section className="journey-summary">

          <div>
            <span className="summary-label">
              TRAIN JOURNEY
            </span>

            <h1>
              {from}
              <span> → </span>
              {to}
            </h1>

            <p>
              {formatDate(date)} · {passengers}{" "}
              {Number(passengers) === 1
                ? "Passenger"
                : "Passengers"}
            </p>
          </div>

          <button
            type="button"
            className="modify-button"
            onClick={() => navigate("/home")}
          >
            Modify Search
          </button>

        </section>

        <section className="results-heading">

          <div>
            <span>AVAILABLE TRAINS</span>

            <h2>Choose your train</h2>
          </div>

          <p>
            {trains.length} trains available
          </p>

        </section>

        <section className="train-list">

          {trains.map((train) => (

            <article
              className="train-card"
              key={train.id}
            >

              <div className="train-main">

                <div className="train-name">

                  <span className="train-icon">
                    🚆
                  </span>

                  <div>
                    <h3>
                      {train.name}
                    </h3>

                    <span>
                      Train {train.number}
                    </span>
                  </div>

                </div>

                <div className="train-timing">

                  <div>
                    <strong>
                      {train.departure}
                    </strong>

                    <span>{from}</span>
                  </div>

                  <div className="duration">

                    <span>
                      {train.duration}
                    </span>

                    <div className="duration-line">
                      <i></i>
                    </div>

                  </div>

                  <div>
                    <strong>
                      {train.arrival}
                    </strong>

                    <span>{to}</span>
                  </div>

                </div>

                <div className="train-price">

                  <span>
                    Starting from
                  </span>

                  <strong>
                    ₹{train.price}
                  </strong>

                  <small>
                    per passenger
                  </small>

                </div>

              </div>

              <div className="train-footer">

                <div className="train-features">

                  <span>
                    ✓ {train.class}
                  </span>

                  <span>
                    ✓ Comfortable seating
                  </span>

                  <span>
                    ✓ SafeSeat supported
                  </span>

                </div>

                <button
                  type="button"
                  className="select-train-button"
                  onClick={() =>
                    handleSelectTrain(train)
                  }
                >
                  Select Train →
                </button>

              </div>

            </article>

          ))}

        </section>

      </main>
<Footer />
    </div>
  );
}

export default TrainResults;