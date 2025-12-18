import React, { useState, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { auth, googleProvider } from '../../firebase'; 
import { signInWithPopup } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

// Images & Styles
import googleLogo from '../../assets/LandingImg/google.png';
import '../styles/Login.css';
import axiosInstance from '../api/baseUrl';

const rescueImg = "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2670&auto=format&fit=crop";

function Login() {
  const navigate = useNavigate();
  const comp = useRef(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    role: 'victim' // Default role
  });

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".login-left", { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "power4.out" });
      gsap.fromTo(".login-content > *", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.4, ease: "power3.out" });
    }, comp);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- GOOGLE LOGIN ---
  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome ${result.user.displayName}!`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      toast.error("Google Sign-In Failed");
    }
  };

  // --- EMAIL LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.warn("Please enter email and password.");
      return;
    }

    setIsLoading(true);
    const route = isAdmin ? 'auth/admin-login' : 'auth/login';

    try {
      // DEBUG LOG
      console.log("Sending Login Request:", formData);

      const response = await axiosInstance.post(route, formData);
      const data = response.data;
      
      // Store Token & User Info
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));

      toast.success(`Login Successful! Entered as: ${data.role.toUpperCase()}`);

      // Redirect logic
      setTimeout(() => {
        if(data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          // Force page reload to ensure Sidebar/Context updates with new role
          window.location.href = '/dashboard'; 
        }
      }, 1500);

    } catch (error) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Invalid Credentials";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" ref={comp}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* LEFT PANEL */}
      <div className="login-left">
        <div className="bg-overlay"></div>
        <img src={rescueImg} alt="Disaster Relief" className="bg-image" />
        <div className="left-content">
          <div className="glass-card">
            <div className="logo-badge">ResQ-Link AI</div>
            <h1>Bridging Distress & Response.</h1>
            <p>A decentralized ecosystem connecting victims, volunteers, and NGOs in real-time.</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="login-right">
        <div className="login-content">
          
          <div className="form-header">
            <h2>{isAdmin ? "Command Center" : "Welcome Back"}</h2>
            <p>{isAdmin ? "Restricted access for Coordinators." : "Sign in to access your dashboard."}</p>
          </div>

          <div className="role-toggle">
            <div className={`toggle-option ${!isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(false)}>
              General User
            </div>
            <div className={`toggle-option ${isAdmin ? 'active' : ''}`} onClick={() => setIsAdmin(true)}>
              Admin / NGO
            </div>
            <div className={`slider ${isAdmin ? 'slide-right' : ''}`}></div>
          </div>

          <form onSubmit={handleLogin} className="modern-form">
            
            {/* --- ROLE DROPDOWN --- */}
            {!isAdmin && (
              <div className="input-group">
                <label>I want to login as:</label>
                <div className="input-wrapper">
                  <span className="icon">🎭</span>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className="custom-select"
                    style={{ fontWeight: '600', color: '#d32f2f' }}
                  >
                    <option value="victim">Victim (Get Help)</option>
                    <option value="volunteer">Volunteer (Give Help)</option>
                    <option value="donor">Donor (Give Items)</option>
                  </select>
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="icon">✉️</span>
                <input 
                  type="email" name="email" 
                  value={formData.email} onChange={handleChange} 
                  required placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="icon">🔒</span>
                <input 
                  type="password" name="password" 
                  value={formData.password} onChange={handleChange} 
                  required placeholder="••••••••"
                />
              </div>
            </div>

            <div className="form-extras">
              <label className="checkbox"><input type="checkbox" /> Remember me</label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className={`login-btn ${isAdmin ? 'btn-admin' : ''}`} disabled={isLoading}>
              {isLoading ? "Authenticating..." : (isAdmin ? "Access Dashboard" : "Sign In")}
            </button>
          </form>

          {!isAdmin && (
            <>
              <div className="divider"><span>OR</span></div>
              <button className="google-btn" onClick={handleGoogle}>
                <img src={googleLogo} alt="G" /> Sign in with Google
              </button>
              <div className="register-link">Don't have an account? <Link to="/register">Create free account</Link></div>
            </>
          )}
          
          {isAdmin && <div className="security-notice"><span>🔒 256-bit Secure Connection</span></div>}
        </div>
      </div>
    </div>
  );
}

export default Login;