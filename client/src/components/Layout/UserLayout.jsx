import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

// Icons
import { 
  FiHome, FiActivity, FiMapPin, FiBox, 
  FiUser, FiLogOut, FiMoon, FiSun, FiMenu,
  FiShield, FiGift, FiDatabase, FiUsers, FiAlertCircle, FiClipboard, FiX
} from "react-icons/fi";
import { BiError } from "react-icons/bi"; 

// CSS
import '../styles/UserLayout.css';

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to detect route changes
  
  // State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [userRole, setUserRole] = useState('victim');
  const [userName, setUserName] = useState('User');

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Theme Check
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    }

    // 2. Load User
    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role || 'victim');
        setUserName(parsedUser.fullName || 'User');
      }
    } catch (error) { console.error(error); }

    // 3. Responsive Check (Open sidebar by default on Desktop)
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Run once on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- AUTO-CLOSE SIDEBAR ON MOBILE NAVIGATION ---
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.body.setAttribute('data-theme', newMode ? 'dark' : 'light');
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    toast.info("Logged out successfully");
    navigate('/login');
  };

  // --- MENUS ---
  const victimMenu = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "My Requests", icon: <FiAlertCircle />, path: "/my-requests" },
    { name: "Safety Tips", icon: <FiShield />, path: "/safety-tips" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
  ];

  const volunteerMenu = [
    { name: "Mission Control", icon: <FiHome />, path: "/mission-controller" },
    { name: "Available Tasks", icon: <FiClipboard />, path: "/missions" },
    { name: "Live Map", icon: <FiMapPin />, path: "/map" },
    { name: "History", icon: <FiActivity />, path: "/history" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
  ];

  const donorMenu = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Donate Items", icon: <FiGift />, path: "/donate" },
    { name: "Track Donations", icon: <FiBox />, path: "/donations" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
  ];

  const adminMenu = [
    { name: "Admin Panel", icon: <FiHome />, path: "/admin-dashboard" },
    { name: "Users", icon: <FiUsers />, path: "/manage-users" },
    { name: "Inventory", icon: <FiDatabase />, path: "/inventory" },
    { name: "Global Map", icon: <FiMapPin />, path: "/admin-map" },
    { name: "Settings", icon: <FiUser />, path: "/settings" },
  ];

  const getMenu = () => {
    switch (userRole) {
      case 'volunteer': return volunteerMenu;
      case 'donor': return donorMenu;
      case 'admin': return adminMenu;
      default: return victimMenu;
    }
  };

  const currentMenu = getMenu();

  return (
    <div className="layout-container">
      
      {/* --- OVERLAY (For Mobile) --- */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* --- SIDEBAR --- */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="logo-icon">R</div>
            <div className="logo-details">
              <span className="logo-text">ResQ-Link</span>
              <span className="role-badge">{userRole.toUpperCase()}</span>
            </div>
          </div>
          {/* Close Button (Mobile Only) */}
          <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        {/* SOS Button */}
        {userRole !== 'admin' && userRole !== 'donor' && (
          <div className="sos-wrapper">
            <button className="sos-btn-sidebar" onClick={() => navigate('/sos')}>
              <BiError className="sos-icon" />
              <span className="sos-text">EMERGENCY SOS</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {currentMenu.map((item) => (
            <NavLink 
              to={item.path} 
              key={item.name}
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              {item.icon}
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="divider"></div>
          
          <div className="footer-item" onClick={toggleTheme}>
            {isDarkMode ? <FiSun /> : <FiMoon />}
            <span className="nav-text">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </div>

          <div className="footer-item logout" onClick={handleLogout}>
            <FiLogOut />
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        
        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <FiMenu />
            </button>
            <h3 className="mobile-logo">ResQ-Link</h3>
          </div>
          <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}

export default UserLayout;