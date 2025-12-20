import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  FiTarget, FiMapPin, FiCheckSquare, FiClock, FiActivity, FiFilter, FiUserCheck, FiPackage, FiAlertTriangle, FiPhone
} from "react-icons/fi";

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import '../styles/MissionController.css';

function MissionController() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, active
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // --- 1. INITIALIZE USER ---
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (user && user._id) {
        setCurrentUserId(user._id);
      }
    } catch (e) {
      console.error("Error loading user info", e);
    }
  }, []);

  // --- 2. FETCH DATA ---
  const fetchMissions = async () => {
    // Only fetch if we know who the current user is (to filter properly)
    if (!currentUserId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axiosInstance.get('/sos', config); 
      
      // FILTER: Exclude my own requests
      const validMissions = response.data.filter(mission => {
        const creatorId = mission.userId?._id || mission.userId;
        return creatorId !== currentUserId;
      });

      setMissions(validMissions);
      
      if(validMissions.length > 0) setSelectedMission(validMissions[0]);

    } catch (error) {
      toast.error("Failed to load missions");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when User ID is loaded
  useEffect(() => {
    if(currentUserId) {
      fetchMissions();
    }
  }, [currentUserId]);

  // --- ACTIONS ---
  const updateStatus = async (id, newStatus) => {
    try {
      const updatedList = missions.map(m => m._id === id ? { ...m, status: newStatus } : m);
      setMissions(updatedList);
      if(selectedMission._id === id) setSelectedMission({ ...selectedMission, status: newStatus });

      const token = localStorage.getItem('token');
      await axiosInstance.put(`/sos/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Mission Status: ${newStatus.toUpperCase()}`);
    } catch (error) {
      toast.error("Update Failed");
      fetchMissions();
    }
  };

  const filteredMissions = missions.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  if (loading) return <div className="mc-loader"><div className="spinner"></div></div>;

  return (
    <div className="mc-wrapper">
      
      <header className="mc-header">
        <div>
          <h1>Mission Control</h1>
          <p>Tactical response interface for active incidents.</p>
        </div>
        <div className="mc-stats">
          <div className="stat-pill red"><FiAlertTriangle /> {missions.filter(m => m.status === 'pending').length} Pending</div>
          <div className="stat-pill blue"><FiActivity /> {missions.filter(m => m.status === 'accepted').length} Active</div>
        </div>
      </header>

      <div className="mc-grid">
        
        {/* --- LEFT PANEL --- */}
        <aside className="mc-sidebar-list">
          <div className="mc-filter-bar">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
            <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>Active</button>
          </div>

          <div className="mc-list-container">
            {filteredMissions.length === 0 ? <p className="mc-empty">No missions found.</p> :
              filteredMissions.map((mission) => (
                <div 
                  key={mission._id} 
                  className={`mc-card ${selectedMission?._id === mission._id ? 'selected' : ''}`}
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="mc-card-top">
                    <span className={`mc-type-badge ${mission.type.toLowerCase()}`}>{mission.type}</span>
                    <span className={`mc-status-dot ${mission.status}`}></span>
                  </div>
                  <h4>{mission.description ? mission.description.substring(0, 40) + "..." : "Emergency Request"}</h4>
                  
                  {mission.linkedResources && mission.linkedResources.length > 0 && (
                    <div className="mc-resource-badge">
                      <FiPackage /> {mission.linkedResources.length} Items Requested
                    </div>
                  )}

                  <div className="mc-card-meta">
                    <span><FiClock /> {new Date(mission.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span><FiMapPin /> {Math.round(mission.location.accuracy || 50)}m Acc</span>
                  </div>
                </div>
              ))
            }
          </div>
        </aside>

        {/* --- RIGHT PANEL --- */}
        <main className="mc-main-view">
          {selectedMission ? (
            <>
              <div className="mc-mission-header">
                <div className="mission-title">
                  <h2>Mission #{selectedMission._id.slice(-6).toUpperCase()}</h2>
                  <span className={`status-tag ${selectedMission.status}`}>{selectedMission.status}</span>
                </div>
                <div className="mission-actions">
                  {selectedMission.status === 'pending' && (
                    <button className="btn-accept" onClick={() => updateStatus(selectedMission._id, 'accepted')}>
                      <FiCheckSquare /> Accept Mission
                    </button>
                  )}
                  {selectedMission.status === 'accepted' && (
                    <button className="btn-resolve" onClick={() => updateStatus(selectedMission._id, 'resolved')}>
                      <FiUserCheck /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="mc-details-grid">
                
                {/* MAP COLUMN */}
                <div className="mc-left-col">
                  <div className="mc-map-box">
                    <MapContainer 
                      key={selectedMission._id} 
                      center={[selectedMission.location.coordinates[1], selectedMission.location.coordinates[0]]} 
                      zoom={15} scrollWheelZoom={false} className="leaflet-container"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedMission.location.coordinates[1], selectedMission.location.coordinates[0]]}>
                        <Popup>Target Location</Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div className="mc-contact-card">
                    <h4>Contact Requester</h4>
                    <div className="contact-row">
                      <div className="c-avatar">{selectedMission.userId?.fullName?.charAt(0) || "U"}</div>
                      <div>
                        <h5>{selectedMission.userId?.fullName || "Unknown"}</h5>
                        <p>{selectedMission.userId?.phone || "No Phone"}</p>
                      </div>
                      <a href={`tel:${selectedMission.userId?.phone}`} className="call-btn"><FiPhone /> Call</a>
                    </div>
                  </div>
                </div>

                {/* INFO COLUMN */}
                <div className="mc-info-box">
                  <div className="info-group">
                    <label>Incident Report</label>
                    <p className="desc-text">{selectedMission.description || "No details provided."}</p>
                  </div>

                  <div className="info-group">
                    <label>Requested Supplies</label>
                    {selectedMission.linkedResources && selectedMission.linkedResources.length > 0 ? (
                      <div className="mc-supplies-list">
                        {selectedMission.linkedResources.map((res, idx) => (
                          <div key={idx} className="mc-supply-item">
                            <div className="supply-left">
                              <span className={`supply-urgency ${res.urgency.toLowerCase()}`}>{res.urgency}</span>
                              <div className="supply-details">
                                {res.items.map((item, i) => (
                                  <span key={i}><strong>{item.quantity}</strong> {item.itemCategory}</span>
                                ))}
                              </div>
                            </div>
                            <span className="supply-status">{res.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-supplies-text">No supplies requested for this mission.</p>
                    )}
                  </div>

                  <div className="info-group">
                    <label>Evidence</label>
                    {selectedMission.image ? (
                      <img src={selectedMission.image} alt="Evidence" className="mc-evidence-img" />
                    ) : (
                      <div className="mc-no-img">No Image Data</div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="mc-placeholder">
              <FiTarget /><h3>Select a Mission</h3><p>Choose an incident from the left panel.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default MissionController;