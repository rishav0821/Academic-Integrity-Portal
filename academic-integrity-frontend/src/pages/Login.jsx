import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { FiRefreshCcw } from "react-icons/fi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    const form = document.querySelector("form");
    if (form) form.reset();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SECTION - LOGO */}
      <div style={styles.leftSection}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoMarkWrapper}>
            <div style={styles.logoMarkInner}>
              {/* Decorative shapes to mock UPES logo */}
              <div style={styles.logoBlue} />
              <div style={styles.logoOrange} />
              <div style={styles.logoRed} />
            </div>
            <h1 style={styles.logoText}>LMS</h1>
          </div>
          <div style={styles.logoSubtextContainer}>
            <span style={styles.logoSubtext}>Program-Level Academic Integrity Risk Intelligence System</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - LOGIN FORM */}
      <div style={styles.rightSection}>
        <div style={styles.loginCard}>
          <div style={styles.cardHeader}>
            <div style={styles.smallLogo}>
               {/* Small logo mock */}
               <div style={{...styles.logoMarkInner, width: '40px', height: '40px'}} />
               <span style={styles.smallLogoText}>LMS</span>
            </div>
            <p style={{ fontSize: '10px', margin: '-5px 0 15px 0', opacity: 0.8, textAlign: 'center' }}>Program-Level Academic Integrity Risk Intelligence System</p>
            <h2 style={styles.welcomeText}>Welcome to MyLMS</h2>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                style={styles.input}
              />
            </div>

            {/* MOCK RECAPTCHA */}
            <div style={styles.recaptcha}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" style={{ width: "20px", height: "20px" }} />
                <span>I'm not a robot</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FiRefreshCcw size={24} color="#1a73e8" />
                <span style={{ fontSize: "10px", marginTop: "4px" }}>reCAPTCHA</span>
                <span style={{ fontSize: "8px", opacity: 0.7 }}>Privacy - Terms</span>
              </div>
            </div>

            <div style={styles.optionsRow}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.value)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" style={styles.loginBtn}>
              LOGIN
            </button>
            
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <Link to="/register" style={styles.forgotLink}>
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "linear-gradient(135deg, #130b35 0%, #351347 100%)",
    fontFamily: "Inter, sans-serif",
    color: "#fff",
  },
  leftSection: {
    flex: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  logoMarkWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  logoMarkInner: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #0f62b2 0%, #d7285c 50%, #f6a117 100%)",
    borderRadius: "16px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 10px 20px rgba(0,0,0,0.5)",
  },
  logoText: {
    fontSize: "85px",
    fontWeight: "600",
    letterSpacing: "4px",
    margin: 0,
    textShadow: "0px 5px 15px rgba(0,0,0,0.4)",
  },
  logoSubtextContainer: {
    borderTop: "3px solid #fff",
    marginTop: "5px",
    paddingTop: "15px",
    width: "100%",
    textAlign: "center",
  },
  logoSubtext: {
    fontSize: "15px",
    letterSpacing: "3px",
    fontWeight: "500",
    textAlign: "center",
  },
  rightSection: {
    flex: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  loginCard: {
    width: "420px",
    background: "linear-gradient(150deg, #18b7f7 0%, #5d288d 100%)",
    borderRadius: "12px",
    padding: "40px",
    boxShadow: "0px 12px 30px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  smallLogo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  smallLogoText: {
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "2px",
  },
  welcomeText: {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
  },
  input: {
    padding: "12px",
    borderRadius: "4px",
    border: "none",
    background: "#f2f4f8",
    fontSize: "15px",
    color: "#333",
    outline: "none",
  },
  recaptcha: {
    background: "#f9f9f9",
    color: "#333",
    border: "1px solid #d3d3d3",
    borderRadius: "4px",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "5px",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    marginBottom: "15px",
  },
  forgotLink: {
    color: "#fff",
    fontSize: "13px",
    textDecoration: "none",
  },
  loginBtn: {
    padding: "14px",
    border: "none",
    borderRadius: "6px",
    background: "linear-gradient(to right, #1d6e9f, #23548a)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
};

export default Login;