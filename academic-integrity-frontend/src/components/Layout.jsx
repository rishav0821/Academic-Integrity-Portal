import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--upes-bg-light)", overflow: "hidden" }}>
        <Navbar />
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;