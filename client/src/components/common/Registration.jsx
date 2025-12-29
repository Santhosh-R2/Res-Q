import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/baseUrl';
import { ToastContainer, toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  FiMapPin, FiCheck, FiUser, FiMail, FiPhone, FiLock, FiGlobe, FiEye, FiEyeOff 
} from "react-icons/fi";
import { BiRadar } from "react-icons/bi";

import '../styles/Registration.css'; 
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) { setPosition(e.latlng); },
  });
  return position ? <Marker position={position} /> : null;
}

function Registration() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState(null);
  
  const [formData, setFormData] = useState({ 
    fullName: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '', 
    role: 'victim' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'fullName') {
      const regex = /^[a-zA-Z\s]*$/;
      if (!regex.test(value)) return; 
    }

    if (name === 'phone') {
      const regex = /^[0-9]*$/;
      if (!regex.test(value) || value.length > 10) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const selectRole = (role) => setFormData({ ...formData, role: role });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success("GPS Locked");
        },
        () => toast.error("GPS Failed. Use Map.")
      );
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (formData.fullName.trim().length < 3) {
      toast.error("Enter a valid full name");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!location) {
      toast.warn("Please set your location (GPS or Map)");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const payload = { ...submitData, location }; 
      const response = await axiosInstance.post("auth/register", payload);
      
      if(response.status === 201) {
        toast.success("Welcome Aboard!");
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userInfo', JSON.stringify(response.data));
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reg-pro-wrapper">
      <ToastContainer position="top-right" theme="colored" />
      <div className="mesh-gradient"></div>

      <div className="reg-pro-card">
        <div className="reg-pro-sidebar">
          <div className="brand-logo">
            <BiRadar className="logo-icon" /> ResQ-Link
          </div>
          <h1>Join the Global <br/>Response Network.</h1>
          <p>Connecting victims, volunteers, and donors in real-time crisis management.</p>
          
          <div className="stats-mini">
            <div className="stat"><span>10k+</span> Volunteers</div>
            <div className="stat"><span>500+</span> Missions</div>
          </div>
        </div>

        <div className="reg-pro-form-container">
          <div className="form-header">
            <h2>Create Account</h2>
            <span>Already a member? <Link to="/login">Sign In</Link></span>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="section-label">I am joining as:</label>
            <div className="role-pills">
              {['victim', 'volunteer', 'donor'].map((r) => (
                <div 
                  key={r} 
                  className={`role-pill ${formData.role === r ? 'active' : ''}`}
                  onClick={() => selectRole(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </div>
              ))}
            </div>

            <div className="input-grid">
              <div className="input-box">
                <FiUser className="icon" />
                <input type="text" name="fullName" value={formData.fullName} placeholder="Full Name" onChange={handleChange} required />
              </div>
              <div className="input-box">
                <FiPhone className="icon" />
                <input type="text" name="phone" value={formData.phone} placeholder="10-Digit Phone" onChange={handleChange} required />
              </div>
            </div>

            <div className="input-box full">
              <FiMail className="icon" />
              <input type="email" name="email" value={formData.email} placeholder="Email Address" onChange={handleChange} required />
            </div>

            <div className="location-card-pro">
              <div className="loc-info">
                <span className="loc-title">Location </span>
                {location ? <span className="loc-status ok"><FiCheck/> Locked</span> : <span className="loc-status">Not Set</span>}
              </div>
              <div className="loc-actions">
                <button type="button" onClick={getCurrentLocation}><FiMapPin/> GPS</button>
                <button type="button" onClick={() => setShowMap(true)}><FiGlobe/> Map</button>
              </div>
            </div>

            <div className="input-grid">
              <div className="input-box">
                <FiLock className="icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={formData.password}
                  placeholder="Password" 
                  onChange={handleChange} 
                  required 
                />
                <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
              <div className="input-box">
                <FiLock className="icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  placeholder="Confirm" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="submit-btn-pro" disabled={isLoading}>
              {isLoading ? "Processing..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>

      {showMap && (
        <div className="map-overlay-pro">
          <div className="map-box-pro">
            <h3>Pin Your Location</h3>
            <div className="map-frame">
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={location} setPosition={setLocation} />
              </MapContainer>
            </div>
            <div className="map-actions">
              <button onClick={() => setShowMap(false)} className="cancel">Cancel</button>
              <button onClick={() => setShowMap(false)} className="confirm">Confirm Location</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registration;