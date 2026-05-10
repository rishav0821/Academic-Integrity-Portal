import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {sidebarOpen && <Sidebar />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--upes-bg-light)", overflow: "hidden" }}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;