import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// Assuming you have a useAuth hook in your context
// import { useAuth } from '../context/AuthContext'; 

const SidebarStyles = () => (
    <style>{`
        .sidebar {
            width: 100%;
            background-color: #2c3e50;
            color: #ecf0f1;
            display: flex;
            flex-direction: column;
            padding: 20px;
            box-sizing: border-box;
            flex-shrink: 0;
            position: relative;
        }
        .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 40px;
            position: relative;
        }
        .sidebar-header h2 {
            margin: 0;
            font-size: 1.8rem;
            transition: opacity 0.3s ease, transform 0.3s ease;
            white-space: nowrap;
            transform: translateX(0);
        }
        .sidebar.collapsed .sidebar-header h2 {
            opacity: 0;
            transform: translateX(-20px);
        }
        .sidebar-toggle {
            background: #34495e;
            border: none;
            color: #ecf0f1;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 5px;
            right: -45px;
            z-index: 10;
            transition: transform 0.3s ease, background-color 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .sidebar-toggle:hover {
            background: #3498db;
            transform: scale(1.1);
        }
        .sidebar-nav {
            flex-grow: 1;
        }
        .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .sidebar-nav li a,
        .sidebar-nav .main-link {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            color: #bdc3c7;
            text-decoration: none;
            border-radius: 8px;
            overflow: hidden;
            white-space: nowrap;
            transition: all 0.2s ease;
            position: relative;
        }
        .sidebar-nav > ul > li {
            margin-bottom: 5px;
        }
        .sidebar-nav a:hover,
        .sidebar-nav .main-link:hover {
            background-color: #34495e;
            color: #ffffff;
            transform: translateX(5px);
        }
        .sidebar-nav .active > a, 
        .sidebar-nav .active > .collapsible-menu-header .main-link {
            background-color: #3498db;
            color: #ffffff;
            font-weight: 500;
        }
        .sidebar-nav .active > a::before,
        .sidebar-nav .active-parent > .collapsible-menu-header::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 60%;
            width: 4px;
            background-color: #ffffff;
            border-radius: 0 4px 4px 0;
        }
        .collapsible-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            transition: background-color 0.2s ease;
            padding: 0; 
        }
        .collapsible-menu-header .main-link {
            flex-grow: 1;
            margin: 0;
        }
        .collapsible-menu.active-parent > .collapsible-menu-header {
            background-color: #34495e;
            color: #ffffff;
        }
        .arrow {
            font-size: 1.5rem;
            transition: transform 0.3s ease;
            cursor: pointer;
            padding: 15px;
            user-select: none;
            border-radius: 5px;
        }
        .arrow:hover {
            background-color: rgba(0,0,0,0.2);
        }
        .arrow.open {
            transform: rotate(90deg);
        }
        .submenu {
            list-style: none;
            padding-left: 25px; 
            margin: -5px 0 5px 15px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out;
            border-left: 1px solid #34495e;
        }
        .submenu.open {
            max-height: 500px;
        }
        .submenu li a {
            padding: 10px 15px;
            margin-bottom: 5px;
        }
        .submenu li.active > a {
            background-color: #34495e;
            border-radius: 5px;
            font-weight: 500;
            color: #ffffff;
        }
        .icon {
            font-size: 1.2rem;
            flex-shrink: 0;
            width: 24px;
            text-align: center;
        }
        .sub-icon {
            font-size: 0.9rem !important;
        }
        .text {
            opacity: 1;
            transition: opacity 0.2s ease-in-out, transform 0.3s ease;
            transform: translateX(0);
        }
        .sidebar.collapsed .text,
        .sidebar.collapsed .arrow {
            opacity: 0;
            width: 0;
            transform: translateX(-20px);
        }
        .sidebar.collapsed .sidebar-nav a,
        .sidebar.collapsed .sidebar-nav .main-link {
            justify-content: center;
        }
        .sidebar-nav li.disabled {
            opacity: 0.5;
        }
        .sidebar-nav a.disabled-link {
            cursor: not-allowed;
            pointer-events: none;
        }
        .sidebar-nav a.disabled-link:hover {
            background-color: transparent;
            transform: none;
            color: #bdc3c7; 
        }
        .sidebar-footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #34495e;
        }
        .logout-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            width: 100%;
            padding: 15px 20px;
            background-color: #e74c3c;
            border: none;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 0.2s ease;
        }
        .logout-button:hover {
            background-color: #c0392b;
        }
        .sidebar.collapsed a[data-tooltip]::after {
            content: attr(data-tooltip);
            position: absolute;
            left: 75px;
            top: 50%;
            transform: translateY(-50%);
            background-color: #34495e;
            color: #fff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s ease;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .sidebar.collapsed a[data-tooltip]:hover::after {
            opacity: 1;
            transform: translateY(-50%) translateX(10px);
        }
    `}</style>
);


const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const { logout } = useAuth(); // Assuming useAuth provides a logout function

  const [isUploadMenuOpen, setUploadMenuOpen] = useState(
    location.pathname.startsWith('/upload')
  );
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/upload')) {
      setUploadMenuOpen(true);
    }
    const savedResult = localStorage.getItem('latestAllocationResult');
    setHasResult(!!savedResult);
  }, [location.pathname]);

  const handleLogout = () => {
    // logout(); // Call logout from your auth context
    navigate('/login');
  };

  const handleViewResultClick = (e) => {
    if (!hasResult) {
      e.preventDefault();
      return;
    }
    navigate('/results');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <SidebarStyles />
      <div className="sidebar-header">
        <h2>Admin</h2>
      </div>
      <button onClick={onToggle} className="sidebar-toggle">
        {isCollapsed ? '→' : '←'}
      </button>

      <nav className="sidebar-nav">
        <ul>
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
          
          <li className={`${location.pathname === '/results' ? 'active' : ''} ${!hasResult ? 'disabled' : ''}`}>
            <Link 
              to="/results" 
              onClick={handleViewResultClick} 
              className={!hasResult ? 'disabled-link' : ''} 
              data-tooltip="View Last Result"
            >
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
          {/* <li className={location.pathname === '/users' ? 'active' : ''}>
            <Link to="/users" data-tooltip="Users">
              <span className="icon">👥</span>
              <span className="text">Users</span>
            </Link>
          </li> */}
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

