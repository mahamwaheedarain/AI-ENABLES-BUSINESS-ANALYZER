// src/components/Auth.js
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import  Orb from "./Orb"; // Updated to local folder import with named wrapper to prevent crashes
import BorderGlow from '../BorderGlow';
// RETAINED EXACT THEME COLORS
const theme = {
  primary: "#58a6ff",
  bg: "#0d1117",
  card: "rgba(22, 27, 34, 0.6)",
  text: "#ffffff",
  subtext: "#8b949e",
  border: "rgba(255, 255, 255, 0.08)",
  danger: "#f85149",
  warning: "#d29922",
  success: "#3fb950",
};

const styles = {
  pageWrapper: {
    display: "flex",
    minHeight: "100vh",
    background: theme.bg,
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
    position: "relative",
    perspective: "1000px",
  },
  blob: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: theme.primary,
    filter: "blur(180px)",
    borderRadius: "50%",
    opacity: 0.15,
    zIndex: 1, // Elevated above the absolute Orb background layer
  },
  // New: ambient particle canvas, same drifting-dust behavior as the
  // Veldara scroll page's #particles-canvas, layered above the blobs
  // but below the foreground copy/card (matches the site's z-index: 3).
  particlesCanvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
    pointerEvents: "none",
  },
  visualSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "120px",
    zIndex: 2, // Layered above the background
  },
  authSide: {
    width: "520px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // Removed borderLeft divider and gradient panel background so the
    // login card floats directly over the shared page background/orb
    // instead of sitting inside a separate dark blue box.
    zIndex: 2, // Layered above the background
  },
  card: {
    width: "380px",
    // Much more transparent — lets the orb/background show through so the
    // card reads as "glass" blended into the page rather than a solid panel
    background: "rgba(22, 27, 34, 0.18)",
    padding: "54px",
    borderRadius: "38px",
    backdropFilter: "blur(18px) saturate(150%)",
    webkitBackdropFilter: "blur(18px) saturate(150%)",
    // Softer, more diffuse shadow so the card doesn't look like it's
    // floating on a separate dark box
    boxShadow: `
      0 10px 40px -15px rgba(0,0,0,0.5),
      0 0 1px 1px rgba(255,255,255,0.03) inset
    `,
    border: `1px solid rgba(255,255,255,0.08)`,
  },
  input: {
    width: "100%",
    padding: "18px 22px",
    marginBottom: "18px",
    background: "rgba(0,0,0,0.4)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: "18px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  },
  // New: wrapper so the eye toggle can sit inside the password field
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    width: "100%",
    padding: "18px 48px 18px 22px", // extra right padding for the icon
    marginBottom: "8px",
    background: "rgba(0,0,0,0.4)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    borderRadius: "18px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  },
  eyeToggle: {
    position: "absolute",
    right: "16px",
    top: "18px",
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    color: theme.subtext,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // New: strength meter styles
  strengthWrapper: {
    width: "100%",
    marginBottom: "18px",
  },
  strengthTrack: {
    width: "100%",
    height: "5px",
    borderRadius: "3px",
    background: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    display: "flex",
    gap: "4px",
  },
  strengthSegment: {
    flex: 1,
    height: "100%",
    borderRadius: "3px",
    background: "rgba(255,255,255,0.08)",
    transition: "background 0.25s ease",
  },
  strengthLabel: {
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "6px",
    letterSpacing: "0.2px",
  },
  errorText: {
    fontSize: "12px",
    fontWeight: "600",
    color: theme.danger,
    marginTop: "-10px",
    marginBottom: "16px",
    letterSpacing: "0.2px",
  },
  matchHint: {
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "-2px",
    marginBottom: "16px",
    letterSpacing: "0.2px",
  },
  titleH1: {
    fontSize: "73px",
    fontWeight: "700",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#fff",
    lineHeight: "1.05",
    letterSpacing: "-2.5px",
    marginTop: "48px",
    marginBottom: "18px",
    span: {
      color: theme.primary,
      fontStyle: 'italic',
      fontWeight: '600'
    }
  }
};

// Simple inline eye / eye-off icons so we don't need to pull in an icon library
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.62 21.62 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-3.22 4.44" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// --- Password strength helper -------------------------------------------
// Returns a score 0-4 and a label/color to describe it.
const getPasswordStrength = (password) => {
  if (!password) {
    return { score: 0, label: "", color: "transparent" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4 buckets: Weak, Fair, Good, Strong
  const capped = Math.min(score, 4);

  const map = {
    0: { label: "Too weak", color: theme.danger },
    1: { label: "Weak", color: theme.danger },
    2: { label: "Fair", color: theme.warning },
    3: { label: "Good", color: theme.primary },
    4: { label: "Strong", color: theme.success },
  };

  return { score: capped, ...map[capped] };
};

// Reusable password input with a show/hide toggle
const PasswordInput = ({ placeholder, value, onChange, style }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={styles.passwordWrapper}>
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        style={{ ...styles.passwordInput, ...style }}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        style={styles.eyeToggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

// New: visual strength meter shown under the signup password field
const PasswordStrengthMeter = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div style={styles.strengthWrapper}>
      <div style={styles.strengthTrack}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              ...styles.strengthSegment,
              background: i < score ? color : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      <div style={{ ...styles.strengthLabel, color }}>{label}</div>
    </div>
  );
};

// New: little match/no-match hint under the confirm password field
const PasswordMatchHint = ({ password, confirmPassword }) => {
  if (!confirmPassword) return null;
  const matches = password === confirmPassword;
  return (
    <div
      style={{
        ...styles.matchHint,
        color: matches ? theme.success : theme.danger,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {matches ? <CheckIcon /> : <XIcon />}
      {matches ? "Passwords match" : "Passwords do not match"}
    </div>
  );
};

// New: ambient particle field, ported 1:1 from the Veldara landing page's
// #particles-canvas logic (ctx.arc dust motes drifting + wrapping at the
// edges). Implemented as a self-contained component using refs so it drops
// in without disturbing any existing markup, state, or styles above.
const ParticleField = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const createParticles = () => {
      const particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
      particlesRef.current = particles;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      createParticles();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={styles.particlesCanvas} />;
};

// New: blur/fade reveal, ported from Veldara's #section-three-inner
// (opacity 0 -> 1, translateY(32px) -> 0, blur(8px) -> blur(0), all over
// 1s ease-out). The original triggers via IntersectionObserver on scroll;
// since the auth page has no scroll, this triggers once on mount after
// `delay`, which is the equivalent "reveal moment" for a static viewport.
const BlurReveal = ({ children, delay = 150, duration = 1000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        filter: visible ? "blur(0px)" : "blur(8px)",
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out, filter ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
};

// New: horizontal mask-sweep reveal, ported from Veldara's #fixed-cards
// logic (cardsGrid mask-image linear-gradient sweeping black -> transparent
// to "wipe in" the content). The original ties revealPct to scroll
// progress through a trigger zone; here there's no scroll to tie to, so
// progress is driven by elapsed time since mount instead — the same wipe,
// just timed rather than scrubbed.
const MaskReveal = ({ children, direction = "to right", duration = 900, delay = 0 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId;
    let start = null;

    const tick = (ts) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const pct = Math.min(1, Math.max(0, elapsed / duration));
      setProgress(pct);
      if (pct < 1) rafId = requestAnimationFrame(tick);
    };

    const timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [duration, delay]);

  const revealPct = progress * 130;
  const maskImage = `linear-gradient(${direction}, black ${revealPct}%, transparent ${revealPct + 15}%)`;

  return (
    <div style={{ maskImage, WebkitMaskImage: maskImage }}>
      {children}
    </div>
  );
};

// ─── 3D FLOATING MATTE BLOBS (NEW — purely additive) ──────────────────────
// Same glassy, faded, blue-transparent sphere illusion used elsewhere in
// the app: layered radial gradient + soft inset shadow + a wide blurred
// highlight, low opacity so they read as ambient depth rather than a
// distinct foreground object. Purely decorative, pointerEvents:none, so

const MagneticCard = ({ children, style, ...props }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  return (
    <motion.div
      style={{ ...style, rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const DynamicLogo = () => (
  <motion.div
    animate={{ scale: [1, 1.025, 1] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    style={{ fontSize: "38px",
    fontWeight: "700",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', letterSpacing: "-3.2px", color: "#fff", display: "flex", alignItems: "center", gap: "4px" }}
  >
    <span>Insight</span>
    <span style={{ color: "#fff", background: theme.primary, padding: '4px 10px', borderRadius: '12px', fontSize: '33px', boxShadow: `0 4px 15px rgba(88,166,255, 0.6)` }}>IQ</span>
  </motion.div>
);

const AuthLayout = ({ children, title }) => (
  <div style={styles.pageWrapper}>
    {/* BACKGROUND LAYER — still covers the whole page, but the orb itself is
        nudged toward the right side so the left-side headline/copy in
        .visualSide has more clear space around it */}
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: '120%',
          height: '130%',
        }}
      >
        <Orb
          hoverIntensity={2}
          rotateOnHover
          hue={0}
          forceHoverState={false}
          backgroundColor="#000000"
        />
      </div>
    </div>

    <motion.div animate={{ x: [0, 90, 0], y: [0, 70, 0] }} transition={{ duration: 25, repeat: Infinity }} style={{ ...styles.blob, top: "-15%", left: "-15%" }} />
    <motion.div animate={{ x: [0, -70, 0], y: [0, -90, 0] }} transition={{ duration: 18, repeat: Infinity }} style={{ ...styles.blob, bottom: "-15%", right: "-8%" }} />

    

    {/* New: ambient drifting particles, matching Veldara's particle layer */}
    <ParticleField />

    <div style={{ ...styles.visualSide, perspective: "1400px", transformStyle: "preserve-3d" }}>
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        <DynamicLogo />
      </div>
      <BlurReveal delay={150}>
        <motion.h1 initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} style={{ ...styles.titleH1, transform: "translateZ(36px)", transformStyle: "preserve-3d", textShadow: "0 14px 32px rgba(0,0,0,0.5)" }}>
          Data-driven <br /> <span style={styles.titleH1.span}>clarity for the</span> <br /> modern enterprise.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.35 }} 
          style={{ color: "#fff", fontSize: "20px", maxWidth: "480px", lineHeight: "1.5", transform: "translateZ(16px)", transformStyle: "preserve-3d" }}
        >
          Elevate your business insights. Transform complex logs into actionable intelligence.
        </motion.p>
      </BlurReveal>
    </div>

    <div style={{ ...styles.authSide, perspective: "1400px" }}>
      <MagneticCard initial={{ opacity: 0, scale: 0.95, rotateX: 10 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ type: "spring", stiffness: 90, damping: 20 }} style={styles.card}>
        <MaskReveal duration={900} delay={200}>
          <div style={{ transform: "translateZ(24px)", transformStyle: "preserve-3d" }}>
            <h2 style={{ fontSize: "26px", marginBottom: "34px", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', color: theme.text, letterSpacing: '-0.5px' }}>{title}</h2>
            {children}
          </div>
        </MaskReveal>
      </MagneticCard>
    </div>
  </div>
);

export const Login = ({ onLogin, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <AuthLayout title="Welcome Back">
      <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }}>
        <input placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: "18px" }} />
        <button type="submit" style={{ ...styles.input, background: theme.primary, border: "none", fontWeight: "800", cursor: "pointer", marginTop: "12px", color: "#fff", boxShadow: `0 8px 25px rgba(88,166,255, 0.4)` }}>Sign In</button>
      </form>
      <p style={{ textAlign: "center", color: theme.subtext, fontSize: "14px", marginTop: "24px", letterSpacing: '0.2px' }}>
        No account? <span style={{ color: theme.primary, cursor: "pointer", fontWeight: "700" }} onClick={switchToSignup}>Create an account</span>
      </p>
    </AuthLayout>
  );
};

export const Signup = ({ onSignup, switchToLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const MIN_STRENGTH_SCORE = 2; // require at least "Fair"

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const { score, label } = getPasswordStrength(password);

    if (score < MIN_STRENGTH_SCORE) {
      setError(
        `Password is too weak${label ? ` (${label})` : ""}. Use at least 8 characters, mixing upper/lowercase, numbers, or symbols.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    onSignup(name, email, password);
  };

  return (
    <AuthLayout title="Get Started">
      <form onSubmit={handleSubmit}>
        <input placeholder="Full Name" style={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />

        <PasswordInput
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordStrengthMeter password={password} />

        <PasswordInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <PasswordMatchHint password={password} confirmPassword={confirmPassword} />

        {error && <div style={styles.errorText}>{error}</div>}

        <button type="submit" style={{ ...styles.input, background: theme.primary, border: "none", fontWeight: "800", cursor: "pointer", marginTop: "12px", color: "#fff", boxShadow: `0 8px 25px rgba(88,166,255, 0.4)` }}>Get Started</button>
      </form>
      <p style={{ textAlign: "center", color: theme.subtext, fontSize: "14px", marginTop: "24px", letterSpacing: '0.2px' }}>
        Already a member? <span style={{ color: theme.primary, cursor: "pointer", fontWeight: "700" }} onClick={switchToLogin}>Sign in</span>
      </p>
    </AuthLayout>
  );
};