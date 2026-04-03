import React, { useState } from "react";
import PaymentSuccess from "./PaymentSuccess";

function PaymentPage({ plan, onSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState(null);

  const [form, setForm] = useState({
    name: "",
    business: "",
    contact: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = () => {
    setLoading(true);
    setMessage("Processing payment...");

    setTimeout(() => {
      setLoading(false);
      setMessage("Payment Successful! 🎉");
      setTimeout(() => onSuccess(plan), 1500);
    }, 2000);
  };

  // ----------------- METHOD SELECT -----------------
  if (!method) {
    return (
      <div className="payment-container">
        <div className="method-card">

          <h2>User & Business Details</h2>

          <div className="form-group">
            <input name="name" placeholder="Full Name" onChange={handleChange} />
            <input name="business" placeholder="Business Name" onChange={handleChange} />
            <input name="contact" placeholder="Contact Number" onChange={handleChange} />
            <input name="email" placeholder="Email Address" onChange={handleChange} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          </div>

          <h2 style={{ marginTop: "25px" }}>Select Payment Method</h2>

          <div className="methods">
            <button onClick={() => setMethod("Easypaisa")}>Easypaisa</button>
            <button onClick={() => setMethod("JazzCash")}>JazzCash</button>
            <button onClick={() => setMethod("Credit Card")}>Credit Card</button>
          </div>

          <button onClick={onBack} className="back-btn">← Back</button>
        </div>
      </div>
    );
  }

  // ----------------- CREDIT CARD -----------------
  if (method === "Credit Card") {
    return (
      <div className="payment-container">
        <div className="card-payment">

          <div className="left">
            <h2>{plan.name} Plan</h2>
            <h1>{plan.price}</h1>
            <ul>
              {plan.features.map((f, i) => <li key={i}>✔ {f}</li>)}
            </ul>
            <p className="secure">🔒 Secure Payment</p>
          </div>

          <div className="right">
            <h3>User & Business Details</h3>

            <div className="form-group">
              <input name="name" placeholder="Full Name" onChange={handleChange} />
              <input name="business" placeholder="Business Name" onChange={handleChange} />
              <input name="contact" placeholder="Contact Number" onChange={handleChange} />
              <input name="email" placeholder="Email Address" onChange={handleChange} />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} />
            </div>

            <h3 style={{ marginTop: "20px" }}>Card Details</h3>

            <input placeholder="Cardholder Name" />
            <input placeholder="Card Number (4242 4242 4242 4242)" />

            <div className="card-row">
              <input placeholder="MM/YY" />
              <input placeholder="CVV" />
            </div>

            <button onClick={handlePayment}>
              {loading ? "Processing..." : `Pay ${plan.price}`}
            </button>

            {message && <p className="message">{message}</p>}

            <button onClick={() => setMethod(null)} className="back-btn">
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- EASYPAISA / JAZZCASH -----------------
  return (
    <div className="payment-container">
      <div className="demo-card">

        <h2>User & Business Details</h2>

        <div className="form-group">
          <input name="name" placeholder="Full Name" onChange={handleChange} />
          <input name="business" placeholder="Business Name" onChange={handleChange} />
          <input name="contact" placeholder="Contact Number" onChange={handleChange} />
          <input name="email" placeholder="Email Address" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        </div>

        <h2 style={{ marginTop: "20px" }}>{method} Payment</h2>

        <p>Amount: {plan.price}</p>
        <p>Scan QR or simulate payment:</p>

        <div className="qr-box">📱 QR / UPI Demo</div>

        <button onClick={handlePayment}>
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {message && <p className="message">{message}</p>}

        <button onClick={() => setMethod(null)} className="back-btn">
          ← Back
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;