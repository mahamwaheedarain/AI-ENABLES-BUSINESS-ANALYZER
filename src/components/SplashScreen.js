import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Hide splash screen after 3 seconds
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Splash Screen JSX
  const SplashScreen = (
    <div style={styles.splashScreen}>
      <div style={styles.logoContainer}>
        <img
          src="https://via.placeholder.com/120" // Replace with your logo
          alt="Logo"
          style={styles.logo}
        />
      </div>
      <h1 style={styles.title}>Business Analyzer</h1>
      <div style={styles.spinner}></div>
    </div>
  );

  // Main App JSX
  const Home = (
    <div style={styles.home}>
      <h1>Welcome to Your Dashboard</h1>
      <p>All your business data and analysis go here.</p>
    </div>
  );

  return loading ? SplashScreen : Home;
}

// Inline Styles + Animations
const styles = {
  splashScreen: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    color: "white",
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
  },
  logoContainer: {
    animation: "bounce 2s infinite",
  },
  logo: {
    width: "120px",
    height: "120px",
  },
  title: {
    marginTop: "20px",
    fontSize: "28px",
    animation: "fadeIn 2s ease-in-out",
  },
  spinner: {
    marginTop: "30px",
    width: "40px",
    height: "40px",
    border: "5px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  home: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
};

// Add animations dynamically
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes fadeIn {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
}`, styleSheet.cssRules.length);

styleSheet.insertRule(`
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`, styleSheet.cssRules.length);

// Render App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
