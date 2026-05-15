import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { FiMenu, FiBook, FiTool, FiBookOpen, FiHome, FiBell, FiPower, FiClipboard, FiAlertTriangle, FiInfo, FiCheckCircle } from "react-icons/fi";

const Navbar = ({ onToggleSidebar }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    fetchNotifications();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <Link to="/assignments" style={navItem}><FiClipboard size={15} /> Assignments</Link>
        <Link to="/reports" style={navItem}><FiTool size={15} /> Analysis Tools</Link>
        <div style={navItem}><FiBookOpen size={15} /> Library</div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "8px" }}>
          <div style={iconBtn} onClick={() => navigate("/dashboard")}><FiHome size={16} color="#e0e6f0" /></div>
          <div 
            style={{ ...iconBtn, position: "relative" }} 
            onClick={() => setShowDropdown(!showDropdown)}
            ref={dropdownRef}
          >
            <FiBell size={16} color="#e0e6f0" />
            {notifications.length > 0 && (
              <div style={badge}>{notifications.length}</div>
            )}
            
            {showDropdown && (
              <div style={dropdownMenu}>
                <div style={dropdownHeader}>
                  <h4 style={{ margin: 0, fontSize: "14px", color: "#16213e" }}>Notifications</h4>
                </div>
                <div style={dropdownBody}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#8892a4" }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} style={notificationItem}>
                        <div style={getIconStyle(notif.type)}>
                          {notif.type === 'danger' && <FiAlertTriangle size={14} color="#d7285c" />}
                          {notif.type === 'warning' && <FiAlertTriangle size={14} color="#f6a117" />}
                          {notif.type === 'success' && <FiCheckCircle size={14} color="#0a8a0a" />}
                          {notif.type === 'info' && <FiInfo size={14} color="#0465a3" />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "600", color: "#1a1a2e", fontSize: "13px", marginBottom: "2px" }}>{notif.title}</div>
                          <div style={{ fontSize: "12px", color: "#555", lineHeight: "1.4" }}>{notif.message}</div>
                          <div style={{ fontSize: "10px", color: "#999", marginTop: "4px" }}>
                            {new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
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

const dropdownMenu = {
  position: "absolute",
  top: "40px",
  right: "-10px",
  width: "320px",
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  zIndex: 1000,
  overflow: "hidden",
  cursor: "default"
};

const dropdownHeader = {
  padding: "12px 16px",
  background: "#f4f6fa",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const dropdownBody = {
  maxHeight: "350px",
  overflowY: "auto"
};

const notificationItem = {
  padding: "12px 16px",
  borderBottom: "1px solid #f0f0f0",
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  transition: "background 0.2s",
};

const getIconStyle = (type) => {
  let bg = "#e6f2f9";
  if (type === "danger") bg = "#fbe9ed";
  if (type === "warning") bg = "#fef5e7";
  if (type === "success") bg = "#e6f9ed";
  
  return {
    width: "28px", height: "28px", borderRadius: "50%",
    background: bg, display: "flex", justifyContent: "center", alignItems: "center",
    flexShrink: 0, marginTop: "2px"
  };
};

export default Navbar;