import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiMenu, FiBook, FiTool, FiBookOpen, FiHome, FiBell, FiPower } from "react-icons/fi";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{
      background: "#fff",
      height: "60px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      borderBottom: "1px solid #e0e0e0",
      flexShrink: 0
    }}>
      {/* LEFT - LOGO & TITLE */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <FiMenu size={24} color="#333" style={{ cursor: "pointer", marginRight: "10px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
           {/* small colored logo block */}
           <div style={{ width: "22px", height: "22px", background: "linear-gradient(135deg, #0f62b2, #d7285c, #f6a117)", borderRadius: "4px" }} />
           <span style={{ fontSize: "18px", fontWeight: "700", color: "#333", letterSpacing: "1px", marginLeft: "2px" }}>LMS</span>
        </div>
        <span style={{ color: "#e0e0e0", fontSize: "20px", margin: "0 5px" }}>|</span>
        <span style={{ fontSize: "16px", color: "var(--upes-blue)", fontWeight: "600" }}>Academic Integrity Portal</span>
      </div>

      {/* RIGHT - MENU ITEMS */}
      <div style={{ display: "flex", alignItems: "center", gap: "25px", color: "#333", fontSize: "14px", fontWeight: "500" }}>
        <Link to="/submissions" style={{...styles.navItem, textDecoration: "none", color: "inherit"}}>
          <FiBook size={16} /> Submissions
        </Link>
        <Link to="/reports" style={{...styles.navItem, textDecoration: "none", color: "inherit"}}>
          <FiTool size={16} /> Analysis Tools
        </Link>
        <div style={styles.navItem}>
          <FiBookOpen size={16} /> Library
        </div>
        
        <div style={styles.actionIconsWrapper}>
          <div style={styles.iconBtn}>
            <FiHome size={18} color="#fff" />
          </div>
          <div style={{...styles.iconBtn, position: 'relative'}}>
            <FiBell size={18} color="#fff" />
            <div style={styles.badge}>3</div>
          </div>
          <button onClick={handleLogout} style={{...styles.iconBtn, background: '#666', border: 'none'}} title="Logout">
            <FiPower size={18} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
  },
  actionIconsWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginLeft: "10px"
  },
  iconBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "var(--upes-blue)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    background: "var(--upes-purple)",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "bold",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

export default Navbar;