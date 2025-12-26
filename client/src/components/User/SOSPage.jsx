import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import Webcam from "react-webcam";
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  FiMapPin, FiCamera, FiUpload, FiX, FiCheckCircle, FiInfo, FiRefreshCw, FiRepeat, FiCpu, FiPlus, FiTrash2, FiActivity, FiGlobe
} from "react-icons/fi";
import { BiError, BiScan, BiRadar } from "react-icons/bi";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import '../styles/SOSPage.css';
import axiosInstance from '../api/baseUrl';

const DISASTER_KNOWLEDGE = {
  'Fire': ['Fire Extinguisher', 'Burn Kit', 'Blankets', 'Water', 'Masks'],
  'Flood': ['Life Jackets', 'Rope', 'Dry Food', 'Flashlight', 'Boats'],
  'Medical': ['First Aid Kit', 'Stretcher', 'Defibrillator', 'Oxygen', 'Bandages'],
  'Collapse': ['Helmet', 'Whistle', 'Crowbar', 'Dust Mask', 'Gloves'],
  'Violence': ['Trauma Kit', 'Safe Shelter', 'Police Assistance'],
  'Other': ['General Aid', 'Water', 'Food']
};

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function SOSPage() {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("Initializing GPS...");
  const [locationError, setLocationError] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [emergencyType, setEmergencyType] = useState('');
  const [isLocating, setIsLocating] = useState(true);
  
  const [net, setNet] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiPrediction, setAiPrediction] = useState("");
  const [requestedItems, setRequestedItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");

  const [showMapSelector, setShowMapSelector] = useState(false);
  const [manualCoords, setManualCoords] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
        await tf.ready();
        const model = await mobilenet.load();
        setNet(model);
        setIsModelLoading(false);
      } catch (error) {
        console.error("AI Error:", error);
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const mapPredictionToDisaster = (predictions) => {
    if(!predictions || predictions.length === 0) return 'Other';
    const rawText = predictions.map(p => p.className.toLowerCase()).join(" ");
    setAiPrediction(predictions[0].className);

    if (rawText.match(/fire|flame|lighter|candle|smoke|volcano|stove|heater|ash/)) return 'Fire';
    if (rawText.match(/water|lake|ocean|river|boat|canoe|dam|rain|storm|fountain|seashore|puddle/)) return 'Flood';
    if (rawText.match(/ambulance|stretcher|doctor|nurse|medicine|pill|syringe|band-aid|hospital|mask/)) return 'Medical';
    if (rawText.match(/rubble|rock|stone|concrete|ruin|prison|wall|brick|debris/)) return 'Collapse';
    if (rawText.match(/gun|pistol|rifle|holster|military|police|uniform|knife|weapon/)) return 'Violence';
    return 'Other';
  };

  const runAIAnalysis = async (imageSrc) => {
    if (!net) return;
    setIsAnalyzing(true);
    setEmergencyType('');
    const imgEl = new Image();
    imgEl.src = imageSrc;
    imgEl.crossOrigin = "anonymous";
    imgEl.onload = async () => {
      try {
        const predictions = await net.classify(imgEl);
        const detectedType = mapPredictionToDisaster(predictions);
        setEmergencyType(detectedType);
        updateSuggestedItems(detectedType);
        toast.info(`AI Detected: ${detectedType}`);
      } catch (error) { console.error("AI Error", error); } 
      finally { setIsAnalyzing(false); }
    };
  };

  const updateSuggestedItems = (type) => {
    const suggested = DISASTER_KNOWLEDGE[type] || [];
    setRequestedItems(suggested.map(i => ({ item: i, status: 'pending' })));
  };

  const fetchAddress = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await axios.get(url);
      setAddress(response.data.display_name || "Unknown Location");
    } catch (e) { setAddress("Coordinates Locked"); }
  };

  const getLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    setAddress("Triangulating Position...");

    if (!("geolocation" in navigator)) {
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({ lat: latitude, lng: longitude, accuracy });
        fetchAddress(latitude, longitude);
        setIsLocating(false);
        toast.success(`GPS Locked`);
      },
      (err) => {
        setIsLocating(false);
        setLocationError("GPS Failed");
        toast.warn("GPS Signal Weak. Try Manual Selection.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { getLocation(); }, []);

  const confirmManualLocation = () => {
    if(manualCoords) {
      setLocation({ lat: manualCoords.lat, lng: manualCoords.lng, accuracy: 10 });
      fetchAddress(manualCoords.lat, manualCoords.lng);
      setShowMapSelector(false);
      toast.success("Location Manually Set");
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
      setShowCamera(false);
      runAIAnalysis(imageSrc);
    }
  }, [webcamRef, net]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        runAIAnalysis(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTypeChange = (type) => {
    setEmergencyType(type);
    updateSuggestedItems(type);
  };

  const addCustomItem = (e) => {
    e.preventDefault();
    if(newItemName.trim()) {
      setRequestedItems([...requestedItems, { item: newItemName, status: 'pending' }]);
      setNewItemName("");
    }
  };

  const removeItem = (idx) => {
    const list = [...requestedItems];
    list.splice(idx, 1);
    setRequestedItems(list);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleSubmit = async () => {
    if (!location) { toast.error("GPS Required"); return; }
    if (!emergencyType) { toast.warn("Select Type"); return; }
    
    const id = toast.loading("Broadcasting Signal...");

    try {
      const payload = {
        location,
        emergencyType,
        description,
        image,
        requiredItems: requestedItems 
      };

      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axiosInstance.post('/sos', payload, config);

      toast.update(id, { render: "SOS Broadcasted!", type: "success", isLoading: false, autoClose: 3000 });
      setStep(3); 

    } catch (error) {
      toast.update(id, { render: "Transmission Failed", type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <div className="sos-page-wrapper">
      
      <header className="sos-header-pro">
        <div className="status-badge-container">
          <div className={`status-badge ${location ? 'online' : 'offline'}`}>
            <span className="dot"></span> {location ? 'GPS LOCKED' : 'SEARCHING'}
          </div>
          <div className="status-badge ai">
            <FiCpu /> {isModelLoading ? 'LOADING AI...' : 'AI ONLINE'}
          </div>
        </div>
        <h1>EMERGENCY COMMAND</h1>
      </header>

      {step === 1 && (
        <div className="sos-step-container">
          <div className="sos-ring-wrapper">
            <div className="pulse-wave"></div>
            <div className="pulse-wave delay"></div>
            <button className="sos-activate-btn" onClick={() => setStep(2)}>
              <BiRadar className="sos-icon-lg" />
              <span className="sos-label">INITIATE SOS</span>
            </button>
          </div>
          
          <div className="system-readout">
             <div className="readout-row">
               <span className="label">SATELLITE LINK</span>
               {isLocating ? <span className="value blink">ACQUIRING...</span> : 
                location ? <span className="value success">ESTABLISHED</span> : 
                <span className="value error">FAILED</span>}
             </div>
             <div className="readout-row">
               <span className="label">COORDINATES</span>
               <span className="value">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "--.--, --.--"}</span>
             </div>
             <div className="readout-address">
                <FiMapPin /> {address}
             </div>
             
             <div className="location-actions">
                {!location && !isLocating && (
                  <button className="retry-btn" onClick={getLocation}><FiRefreshCw /> Retry GPS</button>
                )}
                <button className="manual-map-btn" onClick={() => setShowMapSelector(true)}>
                  <FiGlobe /> Select on Map
                </button>
             </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="sos-form-container animate-fade-up">
          <div className="sos-pro-card">
            
            <div className="card-header">
              <h3>Situation Report</h3>
              <button className="close-btn" onClick={() => setStep(1)}><FiX /></button>
            </div>

            <div className={`media-area ${isAnalyzing ? 'scanning' : ''}`}>
              {isAnalyzing && (
                <div className="ai-scanner-overlay">
                  <BiScan className="scan-icon" /> <p>ANALYZING HAZARD...</p> <div className="scan-line"></div>
                </div>
              )}
              
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{display:'none'}} />

              {image ? (
                <div className="image-preview-wrapper">
                  <img src={image} alt="Evidence" id="evidence-img" />
                  <div className="preview-overlay">
                    <button className="retake-btn" onClick={() => { setImage(null); setRequestedItems([]); setEmergencyType(''); }}>
                      <FiRefreshCw /> RETAKE
                    </button>
                  </div>
                </div>
              ) : showCamera ? (
                <div className="webcam-wrapper">
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{facingMode}} className="webcam-feed" />
                  <div className="cam-controls">
                    <button onClick={capturePhoto} className="snap-btn"></button>
                    <button onClick={() => setShowCamera(false)} className="cancel-cam">Cancel</button>
                  </div>
                  <button className="switch-cam" onClick={switchCamera}><FiRepeat /></button>
                </div>
              ) : (
                <div className="upload-options">
                  <button className="media-btn" onClick={() => setShowCamera(true)}>
                    <FiCamera className="btn-icon" /> <span>CAMERA</span>
                  </button>
                  <div className="divider"></div>
                  <button className="media-btn" onClick={() => fileInputRef.current.click()}>
                    <FiUpload className="btn-icon" /> <span>UPLOAD</span>
                  </button>
                </div>
              )}
            </div>

            {aiPrediction && !isAnalyzing && image && (
              <div className="ai-confidence-bar">
                <FiActivity /> <span>AI IDENTIFIED:</span> <strong>{aiPrediction.toUpperCase()}</strong>
              </div>
            )}

            <label className="section-label">EMERGENCY TYPE</label>
            <div className="type-grid">
              {['Medical', 'Fire', 'Flood', 'Collapse', 'Violence', 'Other'].map((type) => (
                <button 
                  key={type}
                  className={`type-btn ${emergencyType === type ? 'active' : ''}`}
                  onClick={() => handleTypeChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>

          <div className="resource-box">
  <div className="ai-header">
    <FiCpu /> <span>INTELLIGENT SUPPLY ALLOCATION</span>
  </div>
  <div className="ai-tags">
    {requestedItems.length === 0 ? (
      <span className="empty-tag">Pending Analysis...</span>
    ) : (
      requestedItems.map((obj, idx) => (
        <span key={idx} className="ai-tag">
          {obj.item} <FiX className="del-tag" onClick={() => removeItem(idx)} />
        </span>
      ))
    )}
  </div>
  
  {/* UPDATED INPUT SECTION */}
  <form className="add-custom-item-container" onSubmit={addCustomItem}>
    <input 
      type="text" 
      placeholder="Request additional item..." 
      value={newItemName}
      onChange={(e) => setNewItemName(e.target.value)}
    />
    <button type="submit" className="inner-add-btn" title="Add Item">
      <FiPlus />
    </button>
  </form>
</div>

            <label className="section-label">ADDITIONAL INTEL</label>
            <textarea className="details-input" placeholder="Casualties, trapped persons, access routes..." value={description} onChange={(e) => setDescription(e.target.value)} rows="2"></textarea>

            <div className="action-center">
              <button className="broadcast-btn" onClick={handleSubmit}>
                <BiRadar className="btn-icon-small" /> BROADCAST ALERT
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="sos-success-container animate-fade-up">
          <div className="pulse-success"><FiCheckCircle /></div>
          <h2>SIGNAL TRANSMITTED</h2>
          <p>Rescue Teams Deployed to Coordinates.</p>
          <div className="success-meta">
            <span>ID: #{Math.floor(Math.random()*10000)}</span>
            <span>Est. Response: 15m</span>
          </div>
          <button className="return-btn" onClick={() => window.location.href='/dashboard'}>OPEN TRACKER</button>
        </div>
      )}

      {showMapSelector && (
        <div className="map-modal-overlay">
          <div className="map-modal-content">
            <h3>Select Precise Location</h3>
            <p>Tap on the map to place the pin.</p>
            <div className="map-wrapper-box">
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                className="selector-map"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={manualCoords} setPosition={setManualCoords} />
              </MapContainer>
            </div>
            <div className="map-modal-actions">
              <button className="cancel-map-btn" onClick={() => setShowMapSelector(false)}>Cancel</button>
              <button className="confirm-map-btn" onClick={confirmManualLocation} disabled={!manualCoords}>
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SOSPage;