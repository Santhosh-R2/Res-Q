import React, { useState, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/baseUrl'; // Your Axios Instance
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Images
import communityImg from '../../assets/AboutImg/volunters.jpg';
import '../styles/Registration.css';

function Registration() {
  const comp = useRef(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'victim' 
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Role Selection
  const selectRole = (role) => {
    setFormData({ ...formData, role: role });
  };

  // GSAP Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".reg-img-section", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "power4.out" });
      gsap.fromTo(".reg-form-wrapper", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(".animate-field", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4 });
    }, comp);
    return () => ctx.revert();
  }, []);

  // --- SUBMIT HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-Side Validation
    if(formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if(formData.password.length < 6) {
      toast.warn("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
     
      const { confirmPassword, ...submitData } = formData;
      
      const response = await axiosInstance.post("auth/register", submitData);

      // 3. Success Handling
      if(response.status === 201 || response.status === 200) {
        toast.success("Registration Successful! Redirecting...");
        
        // Optional: Auto-login after register (save token)
        if(response.data.token) {
           localStorage.setItem('token', response.data.token);
           localStorage.setItem('userInfo', JSON.stringify(response.data));
        }

        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      // 4. Error Handling
      console.error("Register Error:", error);
      const msg = error.response?.data?.message || "Registration Failed. Try again.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reg-page-container" ref={comp}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* --- LEFT SIDE: VISUALS --- */}
      <div className="reg-img-section">
        <div className="reg-overlay"></div>
        <img src={communityImg} alt="Community" className="reg-bg-img" />
        
        <div className="reg-text-content">
          <h1>Join the Network.</h1>
          <p>Whether you need help, want to volunteer, or donate supplies — your participation strengthens the ecosystem.</p>
          <div className="reg-stat-row">
            <div><h3>10k+</h3><span>Volunteers</span></div>
            <div><h3>500+</h3><span>Active Missions</span></div>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="reg-form-section">
        <div className="reg-form-wrapper">
          
          <div className="reg-header animate-field">
            <h2>Create Account</h2>
            <p>Join ResQ-Link to make a difference.</p>
          </div>

          <form className="reg-form" onSubmit={handleSubmit}>
            
            {/* ROLE SELECTOR */}
            <label className="field-label animate-field">I am joining as a:</label>
            <div className="role-grid animate-field">
              {['victim', 'volunteer', 'donor'].map((role) => (
                <div 
                  key={role}
                  className={`role-card ${formData.role === role ? 'active' : ''}`}
                  onClick={() => selectRole(role)}
                >
                  <span className="role-icon">
                    {role === 'victim' ? '🆘' : role === 'volunteer' ? '⛑️' : '📦'}
                  </span>
                  <span>{role === 'victim' ? 'General User' : role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>
              ))}
            </div>

            {/* INPUTS */}
            <div className="input-row animate-field">
              <div className="reg-input-group">
                <label>Full Name</label>
                <input 
                  type="text" name="fullName" placeholder="John Doe" 
                  value={formData.fullName} onChange={handleChange} required 
                />
              </div>
              <div className="reg-input-group">
                <label>Phone</label>
                <input 
                  type="tel" name="phone" placeholder="+91..." 
                  value={formData.phone} onChange={handleChange} required 
                />
              </div>
            </div>

            <div className="reg-input-group animate-field">
              <label>Email Address</label>
              <input 
                type="email" name="email" placeholder="john@example.com" 
                value={formData.email} onChange={handleChange} required 
              />
            </div>

            <div className="input-row animate-field">
              <div className="reg-input-group">
                <label>Password</label>
                <input 
                  type="password" name="password" placeholder="••••••" 
                  value={formData.password} onChange={handleChange} required 
                />
              </div>
              <div className="reg-input-group">
                <label>Confirm</label>
                <input 
                  type="password" name="confirmPassword" placeholder="••••••" 
                  value={formData.confirmPassword} onChange={handleChange} required 
                />
              </div>
            </div>

            <button type="submit" className="reg-btn animate-field" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register Now"}
            </button>
          </form>

          <div className="reg-footer animate-field">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Registration;