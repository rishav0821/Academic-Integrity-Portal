import { useState } from "react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Academic Integrity System</h1>
      <div style={formContainer}>
        <h2 style={{ textAlign: "center" }}>Forgot Password</h2>
        {message && <p style={{ color: "#28a745" }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Send Reset Link
          </button>
        </form>
        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <a href="/" style={{ color: "#61dafb" }}>
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  background: "#111",
  height: "100vh",
  width: "100vw",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: 0,
  margin: 0,
};

const headerStyle = { marginBottom: "20px", fontSize: "36px", fontWeight: "bold" };

const formContainer = {
  background: "#1e1e1e",
  padding: "30px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: "0 0 20px rgba(0,0,0,0.4)",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "8px 0 20px 0",
  borderRadius: "6px",
  border: "1px solid #555",
  background: "#111",
  color: "white",
};

const buttonStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "12px",
  background: "#28a745",
  fontSize: "18px",
  fontWeight: "bold",
  borderRadius: "8px",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default ForgotPassword;
