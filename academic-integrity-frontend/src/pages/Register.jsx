import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield } from "react-icons/fi";

/* Inline SVG — sign-up themed */
const Illustration = () => (
  <svg viewBox="0 0 400 300" className="auth-illustration" xmlns="http://www.w3.org/2000/svg">
    <circle cx="200" cy="150" r="120" fill="rgba(255,255,255,0.1)" />
    <circle cx="200" cy="150" r="90" fill="rgba(255,255,255,0.07)" />
    {/* Clipboard */}
    <rect x="140" y="70" width="120" height="150" rx="10" fill="rgba(255,255,255,0.85)" />
    <rect x="175" y="58" width="50" height="20" rx="6" fill="rgba(255,255,255,0.7)" />
    {/* Lines on clipboard */}
    <rect x="158" y="100" width="84" height="6" rx="3" fill="#e91e8c" />
    <rect x="158" y="116" width="64" height="4" rx="2" fill="#ccc" />
    <rect x="158" y="130" width="74" height="4" rx="2" fill="#ccc" />
    <rect x="158" y="144" width="54" height="4" rx="2" fill="#ccc" />
    {/* Checkbox rows */}
    <rect x="158" y="162" width="12" height="12" rx="3" fill="#e91e8c" />
    <rect x="178" y="164" width="50" height="4" rx="2" fill="#ccc" />
    <rect x="158" y="182" width="12" height="12" rx="3" fill="rgba(233,30,140,0.3)" />
    <rect x="178" y="184" width="40" height="4" rx="2" fill="#ccc" />
    {/* Person */}
    <circle cx="310" cy="120" r="24" fill="rgba(255,255,255,0.9)" />
    <line x1="310" y1="144" x2="310" y2="185" stroke="rgba(255,255,255,0.75)" strokeWidth="6" strokeLinecap="round" />
    <line x1="310" y1="160" x2="290" y2="178" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round" />
    <line x1="310" y1="160" x2="330" y2="175" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round" />
    <line x1="310" y1="185" x2="298" y2="210" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round" />
    <line x1="310" y1="185" x2="322" y2="210" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round" />
    {/* Star / sparkles */}
    <circle cx="100" cy="100" r="8" fill="rgba(255,255,255,0.5)" />
    <circle cx="340" cy="200" r="6" fill="rgba(255,255,255,0.4)" />
    <circle cx="80" cy="200" r="5" fill="rgba(255,255,255,0.3)" />
    <circle cx="350" cy="90" r="9" fill="rgba(255,255,255,0.35)" />
  </svg>
);

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setName(""); setEmail(""); setPassword(""); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password) return setError("All fields are required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password, role });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── LEFT ── */}
      <div className="auth-left">
        <h2 className="auth-left-title">Create Your<br />Account</h2>
        <p className="auth-left-sub">Join the Academic Integrity Portal</p>
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

          <h1 className="auth-card-title">Sign up</h1>
          <p className="auth-card-sub">Fill in the details below to get started</p>

          {error && (
            <div className="auth-error">
              <FiAlertCircle size={16} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiUser size={16} /></span>
                <input className="auth-input" type="text" placeholder="Jane Doe"
                  value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" required />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiMail size={16} /></span>
                <input className="auth-input" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiLock size={16} /></span>
                <input className="auth-input" type={showPass ? "text" : "password"} placeholder="Min 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Account Role</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FiShield size={16} /></span>
                <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value)}
                  style={{ paddingLeft: 42 }}>
                  <option value="student">Student</option>
                  <option value="admin">Teacher / Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?
            <Link to="/" className="auth-link">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
