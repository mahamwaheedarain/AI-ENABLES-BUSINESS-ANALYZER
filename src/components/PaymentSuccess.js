import React, { useEffect } from "react";
import Confetti from "react-confetti";

function PaymentSuccess({ plan, onContinue }) {
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="payment-success-container">
      {/* Confetti Animation */}
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={400}
      />

      {/* Success Card */}
      <div className="success-card">
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-subtitle">
          You are now subscribed to the <strong>{plan.name}</strong> Plan
        </p>

        {/* Plan Details */}
        <div className="plan-box">
          <h2>{plan.name} Plan</h2>
          <p className="plan-price">{plan.price}</p>
          <ul>
            {plan.features.map((f, i) => (
              <li key={i}>✔ {f}</li>
            ))}
          </ul>
        </div>

        <button className="continue-btn" onClick={onContinue}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;