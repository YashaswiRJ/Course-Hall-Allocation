// src/Components/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../Styles/Sidebar.css';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isUploadMenuOpen, setUploadMenuOpen] = useState(
    location.pathname.startsWith('/upload')
  );
  // --- NEW: State to track if a result exists ---
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/upload')) {
      setUploadMenuOpen(true);
    }
    // Check for saved results when the component mounts or location changes
    const savedResult = localStorage.getItem('latestScheduleResult');
    setHasResult(!!savedResult);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* ... header and toggle button ... */}
      <div className="sidebar-header">
        <h2>Admin</h2>
      </div>
      <button onClick={onToggle} className="sidebar-toggle">
        {isCollapsed ? '→' : '←'}
      </button>

      <nav className="sidebar-nav">
        <ul>
          {/* ... other links ... */}
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard" data-tooltip="Dashboard">
              <span className="icon">📊</span>
              <span className="text">Dashboard</span>
            </Link>
          </li>
          <li className={location.pathname === '/schedule-viewer' ? 'active' : ''}>
            <Link to="/schedule-viewer" data-tooltip="Grid Viewer">
              <span className="icon">📅</span>
              <span className="text">Grid Viewer</span>
            </Link>
          </li>
          <li className={location.pathname === '/generate-schedule' ? 'active' : ''}>
              <Link to="/generate-schedule" data-tooltip="Generate Schedule">
                  <span className="icon">🚀</span>
                  <span className="text">Generate Schedule</span>
              </Link>
          </li>
          
          {/* --- NEW: View Last Result Link --- */}
          <li className={`${location.pathname === '/results' ? 'active' : ''} ${!hasResult ? 'disabled' : ''}`}>
            <Link to={hasResult ? "/results" : "#"} className={!hasResult ? 'disabled-link' : ''} data-tooltip="View Last Result">
              <span className="icon">📄</span>
              <span className="text">View Last Result</span>
            </Link>
          </li>

          <li className={location.pathname === '/lecture-halls' ? 'active' : ''}>
            <Link to="/lecture-halls" data-tooltip="Lecture Halls">
              <span className="icon">🏛️</span>
              <span className="text">Lecture Halls</span>
            </Link>
          </li>
          {/* ... collapsible menu and other links ... */}
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
          <li className={location.pathname === '/users' ? 'active' : ''}>
            <Link to="/users" data-tooltip="Users">
              <span className="icon">👥</span>
              <span className="text">Users</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button" data-tooltip="Logout">
          <span className="icon">🚪</span>
          <span className="text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;