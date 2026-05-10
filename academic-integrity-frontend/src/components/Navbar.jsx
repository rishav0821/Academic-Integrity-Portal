import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiMenu, FiBook, FiTool, FiBookOpen, FiHome, FiBell, FiPower } from "react-icons/fi";

const Navbar = ({ onToggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{
      background: "#16213e",
      height: "60px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px",
      borderBottom: "1px solid #2a3a58",
      flexShrink: 0
    }}>
      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <FiMenu
          size={22} color="#8892a4"
          onClick={onToggleSidebar}
          style={{ cursor: "pointer", marginRight: "10px" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#e91e8c,#c4186e)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>LMS</span>
          </div>
        </div>
        <span style={{ color: "#2a3a58", fontSize: "18px", margin: "0 6px" }}>|</span>
        <span style={{ fontSize: "15px", color: "#e91e8c", fontWeight: "700", letterSpacing: "0.3px" }}>
          Academic Integrity Portal
        </span>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: "22px", fontSize: "13px", fontWeight: "500" }}>
        <Link to="/submissions" style={navItem}><FiBook size={15} /> Submissions</Link>
        <Link to="/reports" style={navItem}><FiTool size={15} /> Analysis Tools</Link>
        <div style={navItem}><FiBookOpen size={15} /> Library</div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "8px" }}>
          <div style={iconBtn}><FiHome size={16} color="#e0e6f0" /></div>
          <div style={{ ...iconBtn, position: "relative" }}>
            <FiBell size={16} color="#e0e6f0" />
            <div style={badge}>3</div>
          </div>
          <button onClick={handleLogout} style={{ ...iconBtn, background: "#2a3a58", border: "none" }} title="Logout">
            <FiPower size={16} color="#e91e8c" />
          </button>
        </div>
      </div>
    </div>
  );
};

const navItem = {
  display: "flex", alignItems: "center", gap: "6px",
  cursor: "pointer", textDecoration: "none",
  color: "#8892a4", transition: "color 0.2s"
};
const iconBtn = {
  width: "32px", height: "32px", borderRadius: "50%",
  background: "#2a3a58",
  display: "flex", justifyContent: "center", alignItems: "center",
  cursor: "pointer"
};
const badge = {
  position: "absolute", top: "-4px", right: "-4px",
  background: "#e91e8c", color: "#fff",
  fontSize: "9px", fontWeight: "bold",
  borderRadius: "50%", width: "15px", height: "15px",
  display: "flex", justifyContent: "center", alignItems: "center"
};

export default Navbar;