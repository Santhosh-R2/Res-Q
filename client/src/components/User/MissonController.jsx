import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  FiTarget, FiMapPin, FiCheckSquare, FiClock, FiActivity, FiUserCheck, FiPackage, FiAlertTriangle, FiPhone, FiBox
} from "react-icons/fi";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import '../styles/MissionController.css';

function MissionController() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

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

  const fetchMissions = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axiosInstance.get('/sos', config); 
      
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

  useEffect(() => {
    if(currentUserId) fetchMissions();
  }, [currentUserId]);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/sos/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Mission Status: ${newStatus.toUpperCase()}`);
      fetchMissions();
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  const filteredMissions = missions.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  if (loading) return <div className="mission-controll-loader"><div className="mission-controll-spinner"></div></div>;

  return (
    <div className="mission-controll-wrapper">
      
      <header className="mission-controll-header">
        <div>
          <h1>Mission Control</h1>
          <p>Tactical response interface for active incidents.</p>
        </div>
        <div className="mission-controll-stats">
          <div className="mission-controll-stat-pill mission-controll-red">
            <FiAlertTriangle /> {missions.filter(m => m.status === 'pending').length} Pending
          </div>
          <div className="mission-controll-stat-pill mission-controll-blue">
            <FiActivity /> {missions.filter(m => m.status === 'accepted').length} Active
          </div>
        </div>
      </header>

      <div className="mission-controll-grid">
        
        <aside className="mission-controll-sidebar-list">
          <div className="mission-controll-filter-bar">
            <button className={filter === 'all' ? 'mission-controll-active' : ''} onClick={() => setFilter('all')}>All</button>
            <button className={filter === 'pending' ? 'mission-controll-active' : ''} onClick={() => setFilter('pending')}>Pending</button>
            <button className={filter === 'accepted' ? 'mission-controll-active' : ''} onClick={() => setFilter('accepted')}>Active</button>
          </div>

          <div className="mission-controll-list-container">
            {filteredMissions.length === 0 ? <p className="mission-controll-empty">No missions found.</p> :
              filteredMissions.map((mission) => (
                <div 
                  key={mission._id} 
                  className={`mission-controll-card ${selectedMission?._id === mission._id ? 'mission-controll-selected' : ''}`}
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="mission-controll-card-top">
                    <span className={`mission-controll-type-badge mission-controll-${mission.type?.toLowerCase() || 'other'}`}>{mission.type}</span>
                    <span className={`mission-controll-status-dot mission-controll-${mission.status}`}></span>
                  </div>
                  <h4>{mission.description ? mission.description.substring(0, 40) + "..." : "Emergency Request"}</h4>
                  
                  {/* FIXED: Using requiredItems.length to show correct count (3 in your case) */}
                  {mission.requiredItems && mission.requiredItems.length > 0 && (
                    <div className="mission-controll-resource-badge">
                      <FiPackage /> {mission.requiredItems.length} Items Requested
                    </div>
                  )}

                  <div className="mission-controll-card-meta">
                    <span><FiClock /> {new Date(mission.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span><FiMapPin /> {Math.round(mission.location?.accuracy || 0)}m Acc</span>
                  </div>
                </div>
              ))
            }
          </div>
        </aside>

        <main className="mission-controll-main-view">
          {selectedMission ? (
            <>
              <div className="mission-controll-mission-header">
                <div className="mission-controll-mission-title">
                  <h2>Mission #{selectedMission._id.slice(-6).toUpperCase()}</h2>
                  <span className={`mission-controll-status-tag mission-controll-${selectedMission.status}`}>{selectedMission.status}</span>
                </div>
                <div className="mission-controll-mission-actions">
                  {selectedMission.status === 'pending' && (
                    <button className="mission-controll-btn-accept" onClick={() => updateStatus(selectedMission._id, 'accepted')}>
                      <FiCheckSquare /> Accept Mission
                    </button>
                  )}
                  {selectedMission.status === 'accepted' && (
                    <button className="mission-controll-btn-resolve" onClick={() => updateStatus(selectedMission._id, 'resolved')}>
                      <FiUserCheck /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="mission-controll-details-grid">
                
                <div className="mission-controll-left-col">
                  <div className="mission-controll-map-box">
                    <MapContainer 
                      key={selectedMission._id} 
                      center={[selectedMission.location.coordinates[1], selectedMission.location.coordinates[0]]} 
                      zoom={15} scrollWheelZoom={false} className="mission-controll-leaflet-container"
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedMission.location.coordinates[1], selectedMission.location.coordinates[0]]}>
                        <Popup>Target Location</Popup>
                      </Marker>
                    </MapContainer>
                  </div>

                  <div className="mission-controll-contact-card">
                    <h4>Contact Requester</h4>
                    <div className="mission-controll-contact-row">
                      <div className="mission-controll-c-avatar">{selectedMission.userId?.fullName?.charAt(0) || "U"}</div>
                      <div>
                        <h5>{selectedMission.userId?.fullName || "Unknown"}</h5>
                        <p>{selectedMission.userId?.phone || "No Phone"}</p>
                      </div>
                      <a href={`tel:${selectedMission.userId?.phone}`} className="mission-controll-call-btn"><FiPhone /> Call</a>
                    </div>
                  </div>
                </div>

                <div className="mission-controll-info-box">
                  <div className="mission-controll-info-group">
                    <label>Incident Report</label>
                    <p className="mission-controll-desc-text">{selectedMission.description || "No details provided."}</p>
                  </div>

                  <div className="mission-controll-info-group">
                    <label>Supplies Tracking</label>
                    
                    {/* CASE 1: Linked Resources (Donations already on the way) */}
                    {selectedMission.linkedResources && selectedMission.linkedResources.length > 0 ? (
                      <div className="mission-controll-supplies-list">
                        <span className="info-sub-label">Active Donations:</span>
                        {selectedMission.linkedResources.map((res, idx) => (
                          <div key={idx} className="mission-controll-supply-item">
                            <div className="mission-controll-supply-left">
                              <span className={`mission-controll-supply-urgency mission-controll-${res.urgency?.toLowerCase() || 'medium'}`}>{res.urgency}</span>
                              <div className="mission-controll-supply-details">
                                {res.items.map((item, i) => (
                                  <span key={i}><strong>  {item.quantity} </strong>  {item.itemCategory}</span>
                                ))}
                              </div>
                            </div>
                            {/* <span className="mission-controll-supply-status">{res.status}</span> */}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* CASE 2: Required Items (The initial items requested by victim) */}
                    {selectedMission.requiredItems && selectedMission.requiredItems.length > 0 ? (
                      <div className="mission-controll-requirement-box" style={{marginTop: '10px'}}>
                        <span className="info-sub-label">Initial Request Items:</span>
                        <div className="mission-controll-tag-container">
                          {selectedMission.requiredItems.map((item, idx) => (
                            <span key={idx} className="mission-controll-req-tag">
                              <FiBox /> {item.item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                       !selectedMission.linkedResources?.length && <p className="mission-controll-no-supplies-text">No items requested.</p>
                    )}
                  </div>

                  <div className="mission-controll-info-group">
                    <label>Evidence</label>
                    {selectedMission.image ? (
                      <img src={selectedMission.image} alt="Evidence" className="mission-controll-evidence-img" />
                    ) : (
                      <div className="mission-controll-no-img">No Image Data Available</div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div className="mission-controll-placeholder">
              <FiTarget />
              <h3>Select a Mission</h3>
              <p>Choose an incident from the left panel to begin coordination.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default MissionController;