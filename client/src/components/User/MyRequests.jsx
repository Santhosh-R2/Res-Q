import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icons
import { 
  FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiActivity, FiChevronDown, FiChevronUp, FiImage 
} from "react-icons/fi";

// Fix Leaflet Marker Icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// CSS
import '../styles/MyRequests.css';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axiosInstance.get('/sos/my', config);
        setRequests(response.data);
      } catch (error) {
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { color: '#f59e0b', bg: '#fffbeb', icon: <FiClock /> },
      accepted: { color: '#3b82f6', bg: '#eff6ff', icon: <FiActivity /> },
      resolved: { color: '#10b981', bg: '#ecfdf5', icon: <FiCheckCircle /> },
      cancelled: { color: '#ef4444', bg: '#fef2f2', icon: <FiXCircle /> },
    };
    const s = styles[status] || styles.pending;
    
    return (
      <span className="status-badge" style={{ color: s.color, backgroundColor: s.bg }}>
        {s.icon} {status.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="loader-box"><div className="spinner"></div></div>;

  return (
    <div className="req-page-wrapper">
      
      <header className="req-header">
        <div>
          <h1>Incident Logs</h1>
          <p>Real-time tracking of your emergency broadcasts.</p>
        </div>
        <div className="count-badge">
          {requests.length} Records
        </div>
      </header>

      <div className="req-list">
        {requests.length === 0 ? (
          <div className="empty-zone">
            <h3>No Active Signals</h3>
            <p>You currently have no SOS requests in the system.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className={`req-card ${expandedId === req._id ? 'open' : ''}`}>
              
              {/* --- CARD HEADER (Always Visible) --- */}
              <div className="req-summary" onClick={() => toggleExpand(req._id)}>
                <div className="summary-left">
                  <div className={`severity-indicator ${req.type.toLowerCase()}`}></div>
                  <div className="req-meta">
                    <h4>{req.type} Alert</h4>
                    <span className="req-id">ID: #{req._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>

                <div className="summary-right">
                  <span className="req-time">{new Date(req.createdAt).toLocaleString()}</span>
                  {getStatusBadge(req.status)}
                  <div className="chevron">
                    {expandedId === req._id ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
              </div>

              {/* --- EXPANDED DETAILS (Map & Info) --- */}
              {expandedId === req._id && (
                <div className="req-details-panel">
                  
                  {/* Left: Data & Image */}
                  <div className="details-content">
                    <div className="data-group">
                      <label>Situation Report</label>
                      <p>{req.description || "No additional details provided."}</p>
                    </div>

                    <div className="data-group">
                      <label>Evidence</label>
                      {req.image ? (
                        <div className="img-evidence-box">
                          <img src={req.image} alt="Evidence" />
                        </div>
                      ) : (
                        <div className="no-img-box"><FiImage /> No Image</div>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <button className="cancel-req-btn">Revoke Signal</button>
                    )}
                  </div>

                  {/* Right: Interactive Map */}
                  <div className="details-map">
                    <div className="map-header">
                      <FiMapPin /> 
                      <span>
                        Lat: {req.location.coordinates[1].toFixed(4)}, 
                        Lng: {req.location.coordinates[0].toFixed(4)}
                      </span>
                    </div>
                    
                    <MapContainer 
                      center={[req.location.coordinates[1], req.location.coordinates[0]]} 
                      zoom={14} 
                      scrollWheelZoom={false}
                      className="leaflet-container"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[req.location.coordinates[1], req.location.coordinates[0]]}>
                        <Popup>
                          Your SOS Location <br /> Accuracy: {Math.round(req.location.accuracy || 0)}m
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyRequests;