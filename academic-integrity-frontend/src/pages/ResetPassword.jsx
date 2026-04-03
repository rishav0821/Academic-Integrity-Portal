import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Academic Integrity System</h1>
      <div style={formContainer}>
        <h2 style={{ textAlign: "center" }}>Reset Password</h2>
        {message && <p style={{ color: "#28a745" }}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

// reuse styles
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

export default ResetPassword;
