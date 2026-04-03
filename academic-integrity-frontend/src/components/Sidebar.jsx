import { Link, useLocation } from "react-router-dom";
import { FiCalendar, FiUser, FiTool, FiFlag, FiCheckSquare, FiFileText, FiAlertCircle } from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();

  const getIconStyle = (path) => {
    return {
      padding: "15px 0",
      display: "flex",
      justifyContent: "center",
      cursor: "pointer",
      color: "white",
      fontSize: "20px",
      borderLeft: location.pathname === path ? "4px solid white" : "4px solid transparent",
      background: location.pathname === path ? "rgba(255,255,255,0.1)" : "transparent",
      textDecoration: "none"
    };
  };

  return (
    <div style={{ width: "60px", background: "var(--upes-sidebar-bg)", display: "flex", flexDirection: "column", paddingTop: "20px", flexShrink: 0 }}>
      {/* MOCK ICONS mimicking the sidebar in the image */}
      <Link to="/dashboard" style={getIconStyle("/dashboard")} title="Dashboard">
        <FiCalendar />
      </Link>
      <Link to="/profile" style={getIconStyle("/profile")} title="Profile">
        <FiUser />
      </Link>
      <Link to="/tools" style={getIconStyle("/tools")} title="Tools">
        <FiTool />
      </Link>
      <Link to="/reports" style={getIconStyle("/reports")} title="Integrity Reports">
        <FiFlag />
      </Link>
      <Link to="/courses" style={getIconStyle("/courses")} title="Courses">
        <FiCheckSquare />
      </Link>
      <div style={{ padding: "15px 0", display: "flex", justifyContent: "center", color: "white", fontSize: "20px", cursor: "pointer" }}>
        <FiFileText />
      </div>
      
      <div style={{ flex: 1 }}></div>
      
      <div style={{ padding: "15px 0", display: "flex", justifyContent: "center", color: "white", fontSize: "20px", cursor: "pointer", marginBottom: "20px" }}>
        <FiAlertCircle />
      </div>
    </div>
  );
};

export default Sidebar;