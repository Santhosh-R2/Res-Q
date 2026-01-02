import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { 
  FiHome, FiActivity, FiMapPin, FiBox, 
  FiUser, FiLogOut, FiMoon, FiSun, FiMenu,
  FiShield, FiGift, FiDatabase, FiUsers, FiAlertCircle, 
  FiClipboard, FiX, FiTruck, FiList,
} from "react-icons/fi";
import { BiError } from "react-icons/bi"; 
import { FaRegMessage } from "react-icons/fa6";
import '../styles/UserLayout.css';

function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [userRole, setUserRole] = useState('victim');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.setAttribute('data-theme', 'dark');
    }

    try {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserRole(parsedUser.role || 'victim');
        setUserName(parsedUser.fullName || 'User');
      }
    } catch (error) { console.error(error); }

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
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

  const victimMenu = [
    { name: "My Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Incident Log", icon: <FiAlertCircle />, path: "/my-requests" },
    { name: "Safety Protocols", icon: <FiShield />, path: "/safety-tips" },
    { name: "My Profile", icon: <FiUser />, path: "/profile" },
  ];

  const volunteerMenu = [
    { name: "My Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Open Alerts", icon: <FiList />, path: "/mission-controller" },
    { name: "Live Map", icon: <FiMapPin />, path: "/map" },
    { name: "Global Inventory", icon: <FiDatabase />, path: "/inventory" },
    { name: "Logistics & Delivery", icon: <FiTruck />, path: "/logistics" },
    { name: "Mission History", icon: <FiActivity />, path: "/history" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
  ];

  const donorMenu = [
    { name: "My Dashboard", icon: <FiHome />, path: "/dashboard" }, 
    { name: "Aid Marketplace", icon: <FiGift />, path: "/donate" },
    { name: "Track Contributions", icon: <FiBox />, path: "/track-donations" },
    { name: "Profile", icon: <FiUser />, path: "/profile" },
  ];

  const adminMenu = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Dispatch Command", icon: <FiClipboard />, path: "/available-tasks" },
    { name: "User Database", icon: <FiUsers />, path: "/manage-users" },
    { name: "Global Inventory", icon: <FiDatabase />, path: "/inventory" },
    { name: "Inventory History", icon: <FiActivity />, path: "/inventory-history" },
    { name: "Enquiries", icon: <FaRegMessage />, path: "/enquiries" },

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
    <div className="sidemenu-layout-container">
      <div 
        className={`sidemenu-layout-sidebar-overlay ${isSidebarOpen ? 'sidemenu-layout-active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside className={`sidemenu-layout-sidebar ${isSidebarOpen ? 'sidemenu-layout-open' : ''}`}>
        <div className="sidemenu-layout-sidebar-header">
          <div className="sidemenu-layout-brand-wrapper">
            <div className="sidemenu-layout-logo-icon">R</div>
            <div className="sidemenu-layout-logo-details">
              <span className="sidemenu-layout-logo-text">ResQ-Link</span>
              <span className="sidemenu-layout-role-badge">{userRole.toUpperCase()}</span>
            </div>
          </div>
          <button className="sidemenu-layout-close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}><FiX /></button>
        </div>

        {userRole !== 'admin' && userRole !== 'donor' && (
          <div className="sidemenu-layout-sos-wrapper">
            <button className="sidemenu-layout-sos-btn-sidebar" onClick={() => navigate('/sos')}>
              <BiError className="sidemenu-layout-sos-icon" /> <span className="sidemenu-layout-sos-text">EMERGENCY SOS</span>
            </button>
          </div>
        )}

        <nav className="sidemenu-layout-sidebar-nav">
          {currentMenu.map((item) => (
            <NavLink 
              to={item.path} 
              key={item.name}
              className={({ isActive }) => isActive ? "sidemenu-layout-nav-item sidemenu-layout-active" : "sidemenu-layout-nav-item"}
            >
              {item.icon} <span className="sidemenu-layout-nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidemenu-layout-sidebar-footer">
          <div className="sidemenu-layout-divider"></div>
          <div className="sidemenu-layout-footer-item" onClick={toggleTheme}>
            {isDarkMode ? <FiSun /> : <FiMoon />} <span className="sidemenu-layout-nav-text">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <div className="sidemenu-layout-footer-item sidemenu-layout-logout" onClick={handleLogout}>
            <FiLogOut /> <span className="sidemenu-layout-nav-text">Logout</span>
          </div>
        </div>
      </aside>

      <main className={`sidemenu-layout-main-content ${isSidebarOpen ? 'sidemenu-layout-shifted' : ''}`}>
        <header className="sidemenu-layout-mobile-header">
          <div className="sidemenu-layout-mobile-left">
            <button className="sidemenu-layout-menu-toggle" onClick={() => setIsSidebarOpen(true)}><FiMenu /></button>
            <h3 className="sidemenu-layout-mobile-logo">ResQ-Link</h3>
          </div>
          <div className="sidemenu-layout-user-avatar">{userName.charAt(0).toUpperCase()}</div>
        </header>
        <div className="sidemenu-layout-page-content"><Outlet /></div>
      </main>
    </div>
  );
}

export default UserLayout;