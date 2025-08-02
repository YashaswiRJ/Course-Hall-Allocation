import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../Styles/Layout.css";

const Layout = ({ children, onLogout }) => {
  // State to manage whether the sidebar is collapsed
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to toggle the sidebar state
  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    // Add a class to the container when the sidebar is collapsed
    <div
      className={`layout-container ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <Sidebar
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <main className="main-content-area">{children}</main>
    </div>
  );
};

export default Layout;
