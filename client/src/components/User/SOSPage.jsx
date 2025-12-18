import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import Webcam from "react-webcam";
import axios from 'axios'; // Ensure you have axios installed: npm install axios
import { 
  FiMapPin, FiCamera, FiUpload, FiX, FiCheckCircle, FiInfo, FiRefreshCw, FiRepeat 
} from "react-icons/fi";
import { BiError } from "react-icons/bi";

import '../styles/SOSPage.css';
import axiosInstance from '../api/baseUrl';

function SOSPage() {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Fetching address..."); // New State for Address
  const [locationError, setLocationError] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [isLocating, setIsLocating] = useState(true);

  // Camera State
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  // --- 1. REVERSE GEOCODING API (Get Address from Coords) ---
  const fetchAddress = async (lat, lng) => {
    try {
      // Using OpenStreetMap (Nominatim) - Free, No Key Required
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name); // Set readable address
      } else {
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Address Error:", error);
      setAddress("Unknown Location Area");
    }
  };

  // --- 2. ROBUST AUTO GET LOCATION ---
 // ... imports remain the same

  // --- 3-LAYER ROBUST LOCATION STRATEGY ---
  const getLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setAddress("Acquiring Position...");

    // Helper: Success Handler
    const handleSuccess = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acc = position.coords.accuracy || 50; // Default accuracy if null

      setLocation({ lat, lng, accuracy: acc });
      fetchAddress(lat, lng); // Get readable address
      
      setIsLocating(false);
      
      // Different toast based on accuracy
      if(acc < 100) toast.success(`GPS Locked (Precise: ${Math.round(acc)}m)`);
      else toast.info(`Network Location Found (~${Math.round(acc)}m)`);
    };

    // Layer 3: IP Geolocation Fallback (Last Resort)
    const fetchIpLocation = async () => {
      try {
        console.warn("GPS failed. Trying IP Location...");
        const res = await axios.get("https://ipapi.co/json/"); // Free IP Geo API
        
        handleSuccess({
          coords: {
            latitude: res.data.latitude,
            longitude: res.data.longitude,
            accuracy: 5000 // Low accuracy
          }
        });
      } catch (err) {
        console.error("IP Geo Failed:", err);
        setIsLocating(false);
        setLocationError("Unable to detect location.");
        toast.error("All location services failed. Enter manually.");
      }
    };

    // Layer 2: Low Accuracy / Cached Location
    const tryLowAccuracy = () => {
      console.log("High Accuracy timed out. Switching to Low Accuracy...");
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (error) => {
          console.warn("Low Accuracy failed:", error);
          fetchIpLocation(); // Go to Layer 3
        },
        {
          enableHighAccuracy: false, // Turn off GPS
          timeout: 10000,            // Wait 10s
          maximumAge: Infinity       // Accept ANY cached location (Critical fix)
        }
      );
    };

    // Layer 1: High Accuracy GPS
    if (!("geolocation" in navigator)) {
      fetchIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (error) => {
        // If timeout (code 3) or error, try fallback
        tryLowAccuracy();
      },
      {
        enableHighAccuracy: true,
        timeout: 7000, // Wait 7s for satellite fix
        maximumAge: 0  // Force fresh reading
      }
    );
  };

  useEffect(() => { getLocation(); }, []);

  // --- CAMERA & FILE HANDLERS ---
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!location) { toast.error("GPS Required"); return; }
    if (!emergencyType) { toast.warn("Select Type"); return; }
    
    const id = toast.loading("Broadcasting Signal...");

    try {
      const payload = {
        location: location,
        emergencyType: emergencyType,
        description: description,
        image: image,
        address: address // Send the readable address too
      };

      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axiosInstance.post('/sos', payload, config);

      toast.update(id, { render: "SOS Sent Successfully!", type: "success", isLoading: false, autoClose: 3000 });
      setStep(3); 

    } catch (error) {
      console.error(error);
      toast.update(id, { 
        render: error.response?.data?.message || "Failed", 
        type: "error", 
        isLoading: false, 
        autoClose: 3000 
      });
    }
  };

  return (
    <div className="sos-page-wrapper">
      
      <header className="sos-header-pro">
        <div className="status-bar">
          <div className={`status-dot ${location ? 'online' : 'offline'}`}></div>
          <span>STATUS: {location ? 'READY' : 'SEARCHING...'}</span>
        </div>
        <h1>EMERGENCY RESPONSE</h1>
        <p>Decentralized Rescue System</p>
      </header>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="sos-step-container">
          <div className="sos-ring-wrapper">
            <div className="pulse-wave"></div>
            <div className="pulse-wave delay"></div>
            <button className="sos-activate-btn" onClick={() => setStep(2)}>
              <BiError className="sos-icon-lg" />
              <span className="sos-label">ACTIVATE SOS</span>
            </button>
          </div>
          
          <div className="system-readout">
             <div className="readout-item">
               <span className="label">GPS STATUS</span>
               {isLocating ? <span className="value blink">TRIANGULATING...</span> : 
                location ? <span className="value success">LOCKED</span> : 
                <div className="value-error-wrapper">
                  <span className="value error">FAILED</span>
                  <button className="retry-gps-btn" onClick={getLocation}><FiRefreshCw /> Retry</button>
                </div>
               }
             </div>
             
             {/* ADDRESS DISPLAY */}
             <div className="readout-item">
               <span className="label">LOCATION</span>
               <span className="value address-text">
                 {location ? address : "Waiting for GPS..."}
               </span>
             </div>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="sos-form-container animate-fade-up">
          <div className="sos-pro-card">
            <div className="card-header">
              <h3>Situation Report</h3>
              <button className="close-btn" onClick={() => setStep(1)}><FiX /></button>
            </div>

            <div className="media-area">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{display: 'none'}} />

              {image ? (
                <div className="image-preview-wrapper">
                  <img src={image} alt="Evidence" />
                  <div className="preview-overlay">
                    <button className="retake-btn" onClick={() => setImage(null)}><FiRefreshCw /> Retake</button>
                  </div>
                </div>
              ) : showCamera ? (
                <div className="webcam-wrapper">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: facingMode }}
                    className="webcam-feed"
                  />
                  <div className="cam-controls-overlay">
                    <button className="cam-action-btn switch" onClick={switchCamera}><FiRepeat /></button>
                    <button className="cam-snap-btn" onClick={capturePhoto}></button>
                    <button className="cam-action-btn close" onClick={() => setShowCamera(false)}><FiX /></button>
                  </div>
                </div>
              ) : (
                <div className="upload-options">
                  <button className="media-btn camera" onClick={() => setShowCamera(true)}>
                    <FiCamera className="btn-icon" /><span>Camera</span>
                  </button>
                  <div className="divider">OR</div>
                  <button className="media-btn upload" onClick={() => fileInputRef.current.click()}>
                    <FiUpload className="btn-icon" /><span>Upload</span>
                  </button>
                </div>
              )}
            </div>

            <label className="section-label">Nature of Emergency</label>
            <div className="type-grid">
              {['Medical', 'Fire', 'Flood', 'Collapse', 'Violence', 'Other'].map((type) => (
                <button 
                  key={type}
                  className={`type-btn ${emergencyType === type ? 'active' : ''}`}
                  onClick={() => setEmergencyType(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <label className="section-label">Details</label>
            <textarea 
              className="details-input"
              placeholder="Describe injuries, trapped people..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
            ></textarea>

            <div className="form-actions">
               <div className="location-verify">
                  {location ? (
                    <span className="loc-ok">
                      <FiMapPin/> {address.substring(0, 25)}...
                    </span>
                  ) : <span className="loc-bad"><BiError/> GPS Missing</span>}
               </div>
               <button className="broadcast-btn" onClick={handleSubmit}>BROADCAST ALERT</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="sos-success-container animate-fade-up">
          <div className="pulse-success"><FiCheckCircle /></div>
          <h2>SIGNAL SENT</h2>
          <p>ID: <strong>#SOS-{Math.floor(Math.random()*10000)}</strong></p>
          <div className="info-box">
             <FiInfo /> 
             <span>Help is on the way to: <br/><strong>{address}</strong></span>
          </div>
          <button className="return-btn" onClick={() => window.location.href='/dashboard'}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}

export default SOSPage;