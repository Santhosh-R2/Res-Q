import React, { useState, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { auth, googleProvider } from '../../firebase'; 
import { signInWithPopup } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
// Added FiEye and FiEyeOff icons
import { FiEye, FiEyeOff } from 'react-icons/fi';

import googleLogo from '../../assets/LandingImg/google.png';
import axiosInstance from '../api/baseUrl';
import '../styles/Login.css';

const rescueImg = "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=2000&auto=format&fit=crop";

function Login() {
  const navigate = useNavigate();
  const comp = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    role: 'victim' 
  });

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".login-left", 
        { x: -50, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.2, ease: "power4.out" }
      );
      gsap.fromTo(".animate-item", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: "power3.out" }
      );
    }, comp);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return toast.warn("Please enter email and password.");
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post('auth/login', formData);
      const data = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));

      toast.success(`Login Successful! Accessing as: ${data.role.toUpperCase()}`);

      setTimeout(() => {
        if(data.role === 'admin') navigate('/dashboard');
        else window.location.href = '/dashboard'; 
      }, 1500);

    } catch (error) {
      const msg = error.response?.data?.message || "Invalid Credentials";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper" ref={comp}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="login-left">
        <div className="login-overlay"></div>
        <img src={rescueImg} alt="Disaster Response" className="login-bg-img" />
        
        <div className="login-brand-content animate-item">
          <div className="brand-pill">ResQ-Link Ecosystem</div>
          <h1>Unified Response Platform.</h1>
          <p>Connecting Victims, Volunteers, and Coordinators in one secure network.</p>
          <div className="feature-tags">
            <span>🌍 Geo-Tracking</span>
            <span>🤖 AI Triage</span>
            <span>📦 Logistics</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          
          <div className="login-header animate-item">
            <h2>Welcome Back</h2>
            <p>Please sign in to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            
            <div className="input-block animate-item">
              <label>I am a...</label>
              <div className="input-wrapper">
                <span className="input-icon">🎭</span>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="custom-select"
                >
                  <option value="victim">Victim (Requesting Help)</option>
                  <option value="volunteer">Volunteer (Providing Aid)</option>
                  <option value="donor">Donor (Giving Supplies)</option>
                </select>
              </div>
            </div>

            <div className="input-block animate-item">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="input-block animate-item">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  style={{ paddingRight: '45px' }}
                />
                <div 
                  className="login-eye-icon" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>

            <div className="form-options animate-item">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <Link to="/forgotPassword">Forgot Password?</Link>
            </div>

            <button 
              type="submit" 
              className="submit-btn animate-item" 
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="signup-text animate-item">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;