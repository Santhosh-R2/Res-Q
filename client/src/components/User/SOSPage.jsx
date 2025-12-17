import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import Webcam from "react-webcam";
import { 
  FiMapPin, FiCamera, FiUpload, FiX, FiCheckCircle, FiInfo, FiRefreshCw, FiRepeat 
} from "react-icons/fi";
import { BiError } from "react-icons/bi";

import '../styles/SOSPage.css';

function SOSPage() {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [isLocating, setIsLocating] = useState(true);

  // Camera State
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment"); // "user" = Selfie, "environment" = Back

  // --- 1. AUTO GET LOCATION ---
  const getLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      setLocationError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLocating(false);
        toast.success(`GPS Locked (${Math.round(position.coords.accuracy)}m)`);
      },
      (error) => {
        console.error("GPS Error:", error);
        setIsLocating(false);
        setLocationError("Signal Failed");
        toast.error("GPS Failed. Enable Location.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => { getLocation(); }, []);

  // --- 2. CAMERA FUNCTIONS ---
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const switchCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  // --- 3. FILE UPLOAD ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        toast.error("File too large (Max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- 4. SUBMIT ---
  const handleSubmit = async () => {
    if (!location) { toast.error("GPS Location Required!"); return; }
    if (!emergencyType) { toast.warn("Select Emergency Type"); return; }
    
    // INFO: Send data to backend here
    console.log("SOS DATA:", { location, emergencyType, description, image });

    const id = toast.loading("Broadcasting Signal...");
    setTimeout(() => {
      toast.update(id, { render: "Signal Received", type: "success", isLoading: false, autoClose: 3000 });
      setStep(3); 
    }, 1500);
  };

  return (
    <div className="sos-page-wrapper">
      
      {/* HEADER */}
      <header className="sos-header-pro">
        <div className="status-bar">
          <div className={`status-dot ${location ? 'online' : 'offline'}`}></div>
          <span>STATUS: {location ? 'READY' : 'SEARCHING...'}</span>
        </div>
        <h1>EMERGENCY RESPONSE</h1>
        <p>Decentralized Rescue System</p>
      </header>

      {/* STEP 1: ACTIVATE */}
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
               <span className="label">GPS SIGNAL</span>
               {isLocating ? <span className="value blink">ACQUIRING...</span> : 
                location ? <span className="value success">LOCKED</span> : 
                <div className="value-error-wrapper">
                  <span className="value error">FAILED</span>
                  <button className="retry-gps-btn" onClick={getLocation}><FiRefreshCw /> Retry</button>
                </div>
               }
             </div>
          </div>
        </div>
      )}

      {/* STEP 2: DETAILS FORM */}
      {step === 2 && (
        <div className="sos-form-container animate-fade-up">
          <div className="sos-pro-card">
            <div className="card-header">
              <h3>Situation Report</h3>
              <button className="close-btn" onClick={() => setStep(1)}><FiX /></button>
            </div>

            {/* --- MEDIA AREA --- */}
            <div className="media-area">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{display: 'none'}} />

              {image ? (
                // 1. PREVIEW IMAGE
                <div className="image-preview-wrapper">
                  <img src={image} alt="Evidence" />
                  <div className="preview-overlay">
                    <button className="retake-btn" onClick={() => setImage(null)}>
                      <FiRefreshCw /> Retake
                    </button>
                  </div>
                </div>
              ) : showCamera ? (
                // 2. LIVE CAMERA
                <div className="webcam-wrapper">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: facingMode }}
                    className="webcam-feed"
                  />
                  
                  {/* Camera Controls Overlay */}
                  <div className="cam-controls-overlay">
                    <button className="cam-action-btn switch" onClick={switchCamera} title="Switch Camera">
                      <FiRepeat />
                    </button>
                    
                    <button className="cam-snap-btn" onClick={capturePhoto}></button>
                    
                    <button className="cam-action-btn close" onClick={() => setShowCamera(false)} title="Close">
                      <FiX />
                    </button>
                  </div>
                </div>
              ) : (
                // 3. SELECTION MENU
                <div className="upload-options">
                  <button className="media-btn camera" onClick={() => setShowCamera(true)}>
                    <FiCamera className="btn-icon" />
                    <span>Open Camera</span>
                  </button>
                  <div className="divider">OR</div>
                  <button className="media-btn upload" onClick={() => fileInputRef.current.click()}>
                    <FiUpload className="btn-icon" />
                    <span>Upload File</span>
                  </button>
                </div>
              )}
            </div>

            {/* EMERGENCY TYPE */}
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

            {/* DETAILS */}
            <label className="section-label">Details</label>
            <textarea 
              className="details-input"
              placeholder="Describe injuries, trapped people..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
            ></textarea>

            {/* ACTION */}
            <div className="form-actions">
               <div className="location-verify">
                  {location ? <span className="loc-ok"><FiMapPin/> GPS Attached</span> : <span className="loc-bad"><BiError/> GPS Missing</span>}
               </div>
               <button className="broadcast-btn" onClick={handleSubmit}>BROADCAST ALERT</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div className="sos-success-container animate-fade-up">
          <div className="pulse-success"><FiCheckCircle /></div>
          <h2>SIGNAL SENT</h2>
          <p>ID: <strong>#SOS-{Math.floor(Math.random()*10000)}</strong></p>
          <div className="info-box">
             <FiInfo /> 
             <span>Help is on the way. Stay calm.</span>
          </div>
          <button className="return-btn" onClick={() => window.location.href='/dashboard'}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}

export default SOSPage;