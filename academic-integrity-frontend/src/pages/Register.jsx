import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import "./Register.css";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    const form = document.querySelector("form");
    if (form) form.reset();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // simple client‑side validation
    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password, role });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (!err.response) {
        setErrorMsg("Registration failed – could not reach server.");
      } else {
        setErrorMsg(err.response.data?.message || "Registration failed.");
      }
      console.error("Register error", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join the Academic Integrity System</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {errorMsg && (
            <div className="error-message">
              <FiAlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                id="name"
                type="text"
                className="register-input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                id="email"
                type="email"
                className="register-input"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="register-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="role">Account Role</label>
            <div className="input-wrapper" style={{ paddingLeft: '15px' }}>
              <select
                id="role"
                className="register-input"
                style={{ paddingLeft: '5px', width: '100%', cursor: 'pointer', border: 'none', background: 'transparent' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="admin">Teacher (Admin)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="register-btn" disabled={isLoading}>
            <span>{isLoading ? "Creating Account..." : "Register"}</span>
          </button>
        </form>

        <div className="register-footer">
          Already have an account? 
          <Link to="/" className="register-link">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
