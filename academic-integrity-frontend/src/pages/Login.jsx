import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

/* Inline SVG illustration — study/portal scene */
const Illustration = () => (
  <svg viewBox="0 0 400 320" className="auth-illustration" xmlns="http://www.w3.org/2000/svg">
    {/* Background circle */}
    <circle cx="200" cy="160" r="130" fill="rgba(255,255,255,0.12)" />
    <circle cx="200" cy="160" r="100" fill="rgba(255,255,255,0.08)" />
    {/* Screen / laptop */}
    <rect x="120" y="100" width="160" height="110" rx="8" fill="rgba(255,255,255,0.9)" />
    <rect x="128" y="108" width="144" height="90" rx="4" fill="#1a1a2e" />
    {/* Screen content */}
    <rect x="136" y="120" width="80" height="6" rx="3" fill="#e91e8c" />
    <rect x="136" y="132" width="60" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
    <rect x="136" y="142" width="70" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
    <rect x="136" y="152" width="50" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
    {/* Chart bars on screen */}
    <rect x="222" y="155" width="12" height="30" rx="2" fill="#e91e8c" opacity="0.8" />
    <rect x="238" y="140" width="12" height="45" rx="2" fill="#ff4fa7" opacity="0.8" />
    <rect x="254" y="148" width="12" height="37" rx="2" fill="#e91e8c" opacity="0.6" />
    {/* Laptop base */}
    <rect x="100" y="210" width="200" height="8" rx="4" fill="rgba(255,255,255,0.7)" />
    {/* Person left */}
    <circle cx="105" cy="175" r="18" fill="rgba(255,255,255,0.9)" />
    <line x1="105" y1="193" x2="105" y2="225" stroke="rgba(255,255,255,0.7)" strokeWidth="5" strokeLinecap="round" />
    <line x1="105" y1="205" x2="88" y2="220" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    <line x1="105" y1="205" x2="122" y2="215" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    <line x1="105" y1="225" x2="93" y2="245" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    <line x1="105" y1="225" x2="117" y2="245" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    {/* Person right */}
    <circle cx="295" cy="175" r="18" fill="rgba(255,255,255,0.9)" />
    <line x1="295" y1="193" x2="295" y2="225" stroke="rgba(255,255,255,0.7)" strokeWidth="5" strokeLinecap="round" />
    <line x1="295" y1="205" x2="278" y2="218" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    <line x1="295" y1="205" x2="312" y2="218" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    <line x1="295" y1="225" x2="283" y2="245" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    <line x1="295" y1="225" x2="307" y2="245" stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
    {/* Floating dots */}
    <circle cx="155" cy="75" r="8" fill="rgba(255,255,255,0.5)" />
    <circle cx="250" cy="68" r="5" fill="rgba(255,255,255,0.4)" />
    <circle cx="320" cy="110" r="10" fill="rgba(255,255,255,0.3)" />
    <circle cx="80" cy="130" r="6" fill="rgba(255,255,255,0.4)" />
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setEmail(""); setPassword(""); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT ── */}
      <div className="auth-left">
        <h2 className="auth-left-title">Welcome to<br />Integrity Portal</h2>
        <p className="auth-left-sub">Academic Integrity Intelligence System</p>
        <Illustration />
      </div>

      {/* ── RIGHT ── */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#e91e8c,#c4186e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>LMS</span>
            </div>
            <span style={{ color: "#8892a4", fontSize: 13 }}>Academic Integrity Portal</span>
          </div>

          <h1 className="auth-card-title">Login your Account</h1>
          <p className="auth-card-sub">Please enter your details</p>

          {error && (
            <div className="auth-error">
              <FiAlertCircle size={16} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiMail size={16} /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiLock size={16} /></span>
                <input
                  className="auth-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-options">
              <label className="auth-remember">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                Remember me
              </label>
              <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?
            <Link to="/register" className="auth-link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;