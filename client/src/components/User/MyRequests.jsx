import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiActivity, FiChevronDown, FiChevronUp, 
  FiImage, FiPlusCircle, FiX, FiPackage, FiTrash2
} from "react-icons/fi";

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import '../styles/MyRequests.css';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedSosId, setSelectedSosId] = useState(null);

  // --- UPDATED STATE KEYS ---
  const [itemList, setItemList] = useState([]); 
  const [currentItem, setCurrentItem] = useState({ itemCategory: 'Food / Water', quantity: '' });
  const [formUrgency, setFormUrgency] = useState('High');
  const [formNotes, setFormNotes] = useState('');

  // 1. FETCH DATA
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axiosInstance.get('/sos/my', config);
      setRequests(response.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // --- MODAL FUNCTIONS ---
  const openRequestModal = (sosId) => {
    setSelectedSosId(sosId);
    setItemList([]);
    setCurrentItem({ itemCategory: 'Food / Water', quantity: '' });
    setFormNotes('');
    setShowModal(true);
  };

  const addItemToList = (e) => {
    if(e) e.preventDefault(); // Prevent form refresh
    if(!currentItem.quantity.trim()) {
      toast.warn("Please enter quantity first");
      return false;
    }
    setItemList([...itemList, currentItem]);
    setCurrentItem({ ...currentItem, quantity: '' }); // Reset input
    return true;
  };

  // --- FIXED SUBMIT LOGIC ---
  const submitSupplyRequest = async () => {
    let finalItemList = [...itemList];

    // If list is empty BUT user typed something in inputs, add it automatically
    if (finalItemList.length === 0) {
      if (currentItem.quantity.trim()) {
        finalItemList.push(currentItem);
      } else {
        toast.warn("Please add items using the (+) button or type quantity.");
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        items: finalItemList, // Use the prepared list
        urgency: formUrgency,
        notes: formNotes,
        sosId: selectedSosId 
      };

      await axiosInstance.post('/resources', payload, config); 
      
      toast.success("Request Sent Successfully!");
      setShowModal(false);
      fetchRequests(); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send");
    }
  };

  const getStatusBadge = (status) => {
    let icon = <FiClock />;
    if(status === 'accepted') icon = <FiActivity />;
    if(status === 'resolved') icon = <FiCheckCircle />;
    if(status === 'cancelled') icon = <FiXCircle />;

    return (
      <span className={`my-req-status-badge ${status}`}>
        {icon} {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="my-req-page-wrapper">
      
      <header className="my-req-header">
        <div className="my-req-header-text">
          <h1>Incident Command</h1>
          <p>Track emergencies and logistics.</p>
        </div>
        <div className="my-req-count-badge">{requests.length} Incidents</div>
      </header>

      <div className="my-req-list">
        {loading ? <div className="my-req-spinner"></div> : requests.length === 0 ? <p className="my-req-empty-text">No SOS Signals.</p> : 
          requests.map((req) => (
            <div key={req._id} className={`my-req-card ${expandedId === req._id ? 'open' : ''}`}>
              
              <div className="my-req-summary" onClick={() => toggleExpand(req._id)}>
                <div className="my-req-summary-left">
                  <div className={`my-req-severity-bar ${req.type.toLowerCase()}`}></div>
                  <div className="my-req-meta">
                    <h4>{req.type} Alert</h4>
                    <span className="my-req-id">#{req._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
                <div className="my-req-summary-right">
                  {req.linkedResources && req.linkedResources.length > 0 && (
                    <span className="my-req-resource-count"><FiPackage /> {req.linkedResources.length}</span>
                  )}
                  {getStatusBadge(req.status)}
                  <div className="my-req-chevron">{expandedId === req._id ? <FiChevronUp /> : <FiChevronDown />}</div>
                </div>
              </div>

              {expandedId === req._id && (
                <div className="my-req-details-panel">
                  <div className="my-req-col-left">
                    <div className="my-req-data-group">
                      <label>Report</label><p>{req.description || "No description."}</p>
                    </div>
                    <div className="my-req-map-box">
                      <MapContainer key={expandedId} center={[req.location.coordinates[1], req.location.coordinates[0]]} zoom={13} scrollWheelZoom={false} className="leaflet-container">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[req.location.coordinates[1], req.location.coordinates[0]]}><Popup>Location</Popup></Marker>
                      </MapContainer>
                    </div>
                  </div>

                  <div className="my-req-col-right">
                    <div className="my-req-resources-section">
                      <div className="my-req-res-header">
                        <label>Supplies</label>
                        <button className="my-req-add-btn" onClick={() => openRequestModal(req._id)}><FiPlusCircle /> Add</button>
                      </div>
                      {req.linkedResources && req.linkedResources.length > 0 ? (
                        <div className="my-req-res-grid">
                          {req.linkedResources.map((res) => (
                            <div key={res._id} className="my-req-mini-card">
                              <div className="my-req-mini-top">
                                <span className={`my-req-mini-urgency ${res.urgency.toLowerCase()}`}>{res.urgency}</span>
                                <span className="my-req-mini-status">{res.status}</span>
                              </div>
                              <div className="my-req-mini-items">
                                {res.items.map((item, idx) => (
                                  <div key={idx} className="my-req-mini-row">
                                    <FiPackage size={12}/> {item.itemCategory}: <strong>{item.quantity}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <div className="my-req-no-res"><p>No supplies requested.</p></div>}
                    </div>
                    <div className="my-req-evidence">
                      <label>Evidence</label>
                      {req.image ? <div className="my-req-evidence-wrapper"><img src={req.image} className="my-req-evidence-img" alt="Evidence" /></div> : <p className="my-req-no-img">No Image</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="my-req-modal-overlay">
          <div className="my-req-modal-content">
            <div className="my-req-modal-header">
              <h3>Request Supplies</h3>
              <button className="my-req-close-btn" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            
            <p className="my-req-modal-sub">Incident #{selectedSosId.slice(-6)}</p>

            <div className="my-req-add-box">
              <div className="my-req-inline-form">
                <select value={currentItem.itemCategory} onChange={(e) => setCurrentItem({...currentItem, itemCategory: e.target.value})}>
                  <option>Food / Water</option><option>Medical Kit</option><option>Clothing</option><option>Other</option>
                </select>
                <input type="text" placeholder="Qty" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} />
                <button onClick={addItemToList} className="my-req-plus-btn"><FiPlusCircle /></button>
              </div>
            </div>

            <div className="my-req-preview-list">
              {itemList.length === 0 ? <p style={{padding:10, fontSize:'0.85rem', color:'#888', fontStyle:'italic'}}>Items will appear here...</p> : 
                itemList.map((item, idx) => (
                  <div key={idx} className="my-req-preview-item">
                    <span>{item.itemCategory} ({item.quantity})</span>
                    <FiTrash2 className="my-req-del-btn" onClick={() => {
                      const n = [...itemList]; n.splice(idx, 1); setItemList(n);
                    }}/>
                  </div>
                ))
              }
            </div>

            <div className="my-req-footer-form">
              <label>Urgency</label>
              <select value={formUrgency} onChange={(e) => setFormUrgency(e.target.value)}><option>Medium</option><option>High</option><option>Critical</option></select>
              <button className="my-req-submit-btn" onClick={submitSupplyRequest}>Confirm Request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyRequests;