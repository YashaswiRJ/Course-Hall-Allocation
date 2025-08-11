// === Sidebar.jsx (Updated) ===

import React, { useState, useEffect } from 'react';
// UPDATED: Import useNavigate for redirection and useAuth for logout
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Styles/Sidebar.css';

// UPDATED: Removed onLogout from props as the component now handles it internally
const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // NEW: Get logout function from context

  // State to manage the collapsible upload menu
  const [isUploadMenuOpen, setUploadMenuOpen] = useState(
    location.pathname.startsWith('/upload')
  );

  // Effect to open the menu when navigating to a sub-page
  useEffect(() => {
    if (location.pathname.startsWith('/upload')) {
      setUploadMenuOpen(true);
    }
  }, [location.pathname]);

  // NEW: Handler for logging out and redirecting
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>Admin</h2>
        {/* The toggle button is now positioned via CSS relative to the main layout */}
      </div>

      <button onClick={onToggle} className="sidebar-toggle">
        {isCollapsed ? '→' : '←'}
      </button>

      <nav className="sidebar-nav">
        <ul>
          {/* Dashboard Link */}
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard" data-tooltip="Dashboard">
              <span className="icon">📊</span>
              <span className="text">Dashboard</span>
            </Link>
          </li>

          {/* Schedule Viewer Link (Grid) */}
          <li className={location.pathname === '/schedule-viewer' ? 'active' : ''}>
            <Link to="/schedule-viewer" data-tooltip="Grid Viewer">
              <span className="icon">📅</span>
              <span className="text">Grid Viewer</span>
            </Link>
          </li>

          {/* Timeline Viewer Link */}
          {/* <li className={location.pathname === '/timeline-viewer' ? 'active' : ''}>
            <Link to="/timeline-viewer" data-tooltip="Timeline Viewer">
              <span className="icon">🕒</span>
              <span className="text">Timeline Viewer</span>
            </Link>
          </li> */}

          {/* Generate Schedule Link */}
          <li className={location.pathname === '/generate-schedule' ? 'active' : ''}>
              <Link to="/generate-schedule" data-tooltip="Generate Schedule">
                  <span className="icon">🚀</span>
                  <span className="text">Generate Schedule</span>
              </Link>
          </li>

          {/* Lecture Halls Link */}
          <li className={location.pathname === '/lecture-halls' ? 'active' : ''}>
            <Link to="/lecture-halls" data-tooltip="Lecture Halls">
              <span className="icon">🏛️</span>
              <span className="text">Lecture Halls</span>
            </Link>
          </li>
          
          {/* Collapsible Upload Files Menu */}
          <li className={`collapsible-menu ${location.pathname.startsWith('/upload') ? 'active-parent' : ''}`}>
            <div className="collapsible-menu-header">
                <Link to="/upload-files" className="main-link" data-tooltip="Upload Files">
                    <span className="icon">📤</span>
                    <span className="text">Upload Files</span>
                </Link>
                <span 
                    className={`arrow ${isUploadMenuOpen ? 'open' : ''}`} 
                    onClick={() => setUploadMenuOpen(!isUploadMenuOpen)}
                >
                    ›
                </span>
            </div>
            {/* UPDATED: Submenu uses a class for smooth open/close animation */}
            <ul className={`submenu ${isUploadMenuOpen ? 'open' : ''}`}>
              <li className={location.pathname === '/upload/course-schedule' ? 'active' : ''}>
                <Link to="/upload/course-schedule" data-tooltip="Course Schedule">
                  <span className="icon sub-icon">📄</span>
                  <span className="text">Course Schedule</span>
                </Link>
              </li>
              <li className={location.pathname === '/upload/constraints' ? 'active' : ''}>
                <Link to="/upload/constraints" data-tooltip="Constraints">
                  <span className="icon sub-icon">⚙️</span>
                  <span className="text">Constraints</span>
                </Link>
              </li>
              <li className={location.pathname === '/upload/forbidden-halls' ? 'active' : ''}>
                <Link to="/upload/forbidden-halls" data-tooltip="Forbidden Halls">
                  <span className="icon sub-icon">🚫</span>
                  <span className="text">Forbidden Halls</span>
                </Link>
              </li>
            </ul>
          </li>

          {/* Users Link */}
          <li className={location.pathname === '/users' ? 'active' : ''}>
            <Link to="/users" data-tooltip="Users">
              <span className="icon">👥</span>
              <span className="text">Users</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer Logout Button */}
      <div className="sidebar-footer">
        {/* UPDATED: Button now calls the internal handleLogout function */}
        <button onClick={handleLogout} className="logout-button" data-tooltip="Logout">
          <span className="icon">🚪</span>
          <span className="text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;