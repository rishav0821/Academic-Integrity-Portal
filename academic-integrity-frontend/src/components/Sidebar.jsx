import { Link, useLocation } from "react-router-dom";
import { FiCalendar, FiUser, FiTool, FiFlag, FiCheckSquare, FiFileText, FiAlertCircle } from "react-icons/fi";

const Sidebar = () => {
  const location = useLocation();

  const getStyle = (path) => ({
    padding: "14px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "18px",
    textDecoration: "none",
    color: location.pathname === path ? "#e91e8c" : "#4a5a7a",
    borderLeft: location.pathname === path ? "3px solid #e91e8c" : "3px solid transparent",
    background: location.pathname === path ? "rgba(233,30,140,0.1)" : "transparent",
    transition: "all 0.2s",
  });

  return (
    <div style={{
      width: "58px",
      background: "#0d1117",
      display: "flex",
      flexDirection: "column",
      paddingTop: "16px",
      flexShrink: 0,
      borderRight: "1px solid #2a3a58"
    }}>
      <Link to="/dashboard"    style={getStyle("/dashboard")}    title="Dashboard"><FiCalendar /></Link>
      <Link to="/profile"      style={getStyle("/profile")}      title="Profile"><FiUser /></Link>
      <Link to="/tools"        style={getStyle("/tools")}        title="Requests"><FiTool /></Link>
      <Link to="/intelligence" style={getStyle("/intelligence")} title="Intelligence Engine"><FiFlag /></Link>
      <Link to="/courses"      style={getStyle("/courses")}      title="Courses"><FiCheckSquare /></Link>
      <Link to="/reports"      style={getStyle("/reports")}      title="Reports"><FiFileText /></Link>

      <div style={{ flex: 1 }} />

      <div style={{ padding: "14px 0", display: "flex", justifyContent: "center", color: "#4a5a7a", fontSize: "18px", cursor: "pointer", marginBottom: "16px" }}>
        <FiAlertCircle />
      </div>
    </div>
  );
};

export default Sidebar;