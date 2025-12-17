import React, { useState, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { auth, googleProvider } from '../../firebase'; 
import { signInWithPopup } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
// Images
import googleLogo from '../../assets/LandingImg/google.png';
import '../styles/Login.css';
import axiosInstance from '../api/baseUrl';

// Background Image
const rescueImg = "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2670&auto=format&fit=crop";

function Login() {
  const navigate = useNavigate();
  const comp = useRef(null);

  // State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // GSAP Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".login-left", 
        { x: -100, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
      );
      
      gsap.fromTo(".login-content > *", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.4, ease: "power3.out" }
      );
    }, comp);
    return () => ctx.revert();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- GOOGLE LOGIN ---
  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Success Notification
      toast.success(`Welcome ${result.user.displayName}!`);
      
      // Optional: Send google user data to your backend here to save in DB
      
      // Navigate after delay
      setTimeout(() => navigate('/dashboard'), 1500);
      
    } catch (error) {
      console.error(error);
      toast.error("Google Sign-In Failed");
    }
  };

  // --- EMAIL/PASSWORD LOGIN ---
// --- EMAIL/PASSWORD LOGIN ---
const handleLogin = async (e) => {
  e.preventDefault();
  
  // Basic Validation
  if (!formData.email || !formData.password) {
    toast.warn("Please fill in all fields.");
    return;
  }

  setIsLoading(true);

  // 1. Determine the route string (not the code string)
  const route = isAdmin ? 'auth/admin-login' : 'auth/login';

  try {
    // 2. Use axiosInstance directly (No fetch)
    // Axios automatically stringifies body and sets headers
    const response = await axiosInstance.post(route, formData);

    // 3. Axios returns the response body in .data
    const data = response.data;
    
    // 4. Store Token & User Data
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));

    // 5. Show Success Message
    toast.success(`Login Successful! Welcome ${data.fullName || 'User'}`);

    // 6. Redirect based on Role
    setTimeout(() => {
      if(data.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard'); 
      }
    }, 1500);

  } catch (error) {
    // 7. Axios Error Handling
    console.error("Login Error:", error);
    
    // Check if the backend sent a specific error message
    const errorMessage = error.response?.data?.message || "Invalid Credentials or Server Error";
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-container" ref={comp}>
      {/* TOAST CONTAINER (Essential for notifications to show) */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* --- LEFT PANEL (VISUALS) --- */}
      <div className="login-left">
        <div className="bg-overlay"></div>
        <img src={rescueImg} alt="Disaster Relief" className="bg-image" />
        
        <div className="left-content">
          <div className="glass-card">
            <div className="logo-badge">ResQ-Link AI</div>
            <h1>Bridging Distress & Response.</h1>
            <p>
              A decentralized ecosystem connecting victims, volunteers, and NGOs in real-time.
              Every second counts.
            </p>
            <div className="stats-row">
              <div className="stat">
                <h3>Offline</h3>
                <span>First PWA</span>
              </div>
              <div className="stat">
                <h3>Geo</h3>
                <span>Tracking</span>
              </div>
              <div className="stat">
                <h3>AI</h3>
                <span>Triage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL (FORM) --- */}
      <div className="login-right">
        <div className="login-content">
          
          <div className="form-header">
            <h2>{isAdmin ? "Command Center" : "Welcome Back"}</h2>
            <p>{isAdmin ? "Restricted access for Coordinators." : "Please enter your details to sign in."}</p>
          </div>

          {/* ROLE TOGGLE */}
          <div className="role-toggle">
            <div 
              className={`toggle-option ${!isAdmin ? 'active' : ''}`}
              onClick={() => setIsAdmin(false)}
            >
              General User
            </div>
            <div 
              className={`toggle-option ${isAdmin ? 'active' : ''}`}
              onClick={() => setIsAdmin(true)}
            >
              Admin / NGO
            </div>
            <div className={`slider ${isAdmin ? 'slide-right' : ''}`}></div>
          </div>

          <form onSubmit={handleLogin} className="modern-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="icon">✉️</span>
                <input 
                  type="email" 
                  name="email" 
                  placeholder={isAdmin ? "admin@resqlink.com" : "name@example.com"} 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="icon">🔒</span>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="••••••••" 
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-extras">
              <label className="checkbox">
                <input type="checkbox" /> Keep me signed in
              </label>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className={`login-btn ${isAdmin ? 'btn-admin' : ''}`} disabled={isLoading}>
              {isLoading ? "Authenticating..." : (isAdmin ? "Access Dashboard" : "Sign In")}
            </button>
          </form>

          {/* SOCIAL LOGIN (Only for Users) */}
          {!isAdmin && (
            <>
              <div className="divider"><span>OR</span></div>
              <button className="google-btn" onClick={handleGoogle}>
                <img src={googleLogo} alt="G" />
                Sign in with Google
              </button>
              
              <div className="register-link">
                Don't have an account? <Link to="/register">Create free account</Link>
              </div>
            </>
          )}

          {/* SECURITY BADGE FOR ADMIN */}
          {isAdmin && (
            <div className="security-notice">
              <span>🔒 256-bit Secure Connection</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;