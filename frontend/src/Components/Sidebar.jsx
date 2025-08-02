import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/Sidebar.css';

const Sidebar = ({ onLogout, isCollapsed, onToggle }) => {
  const location = useLocation();
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

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>Admin</h2>
        <button onClick={onToggle} className="sidebar-toggle">
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {/* Dashboard Link */}
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard">
              <span className="icon">📊</span>
              <span className="text">Dashboard</span>
            </Link>
          </li>

          {/* Generate Schedule Link */}
          <li className={location.pathname === '/generate-schedule' ? 'active' : ''}>
              <Link to="/generate-schedule">
                  <span className="icon">🚀</span>
                  <span className="text">Generate Schedule</span>
              </Link>
          </li>

          {/* Lecture Halls Link */}
          <li className={location.pathname === '/lecture-halls' ? 'active' : ''}>
            <Link to="/lecture-halls">
              <span className="icon">🏛️</span>
              <span className="text">Lecture Halls</span>
            </Link>
          </li>
          
          {/* Collapsible Upload Files Menu */}
          <li className={`collapsible-menu ${location.pathname.startsWith('/upload') ? 'active-parent' : ''}`}>
            <div className="collapsible-menu-header">
                <Link to="/upload-files" className="main-link">
                    <span className="icon">📤</span>
                    <span className="text">Upload Files</span>
                </Link>
                {!isCollapsed && (
                    <span 
                        className={`arrow ${isUploadMenuOpen ? 'open' : ''}`} 
                        onClick={() => setUploadMenuOpen(!isUploadMenuOpen)}
                    >
                        ›
                    </span>
                )}
            </div>
            {isUploadMenuOpen && !isCollapsed && (
              <ul className="submenu">
                <li className={location.pathname === '/upload/course-schedule' ? 'active' : ''}>
                  <Link to="/upload/course-schedule">
                    <span className="icon sub-icon">📄</span>
                    <span className="text">Course Schedule</span>
                  </Link>
                </li>
                <li className={location.pathname === '/upload/constraints' ? 'active' : ''}>
                  <Link to="/upload/constraints">
                    <span className="icon sub-icon">⚙️</span>
                    <span className="text">Constraints</span>
                  </Link>
                </li>
                <li className={location.pathname === '/upload/forbidden-halls' ? 'active' : ''}>
                  <Link to="/upload/forbidden-halls">
                    <span className="icon sub-icon">🚫</span>
                    <span className="text">Forbidden Halls</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Users Link */}
          <li className={location.pathname === '/users' ? 'active' : ''}>
            <Link to="/users">
              <span className="icon">👥</span>
              <span className="text">Users</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer Logout Button */}
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-button">
          <span className="icon">🚪</span>
          <span className="text">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;