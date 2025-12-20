import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { FiMapPin, FiClock, FiCheckCircle, FiShield, FiAlertCircle } from "react-icons/fi";

// Fix Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import '../styles/AvailableTasks.css';

function AvailableTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Open Tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axiosInstance.get('/sos', config);
      
      // Only show PENDING and UNASSIGNED tasks
      const openTasks = res.data.filter(t => t.status === 'pending' && !t.assignedVolunteer);
      setTasks(openTasks);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // Accept Task
  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/sos/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Mission Accepted! Moved to Mission Control.");
      fetchTasks(); // Refresh list
    } catch (error) {
      toast.error("Failed to accept task");
    }
  };

  if (loading) return <div className="at-loader"><div className="spinner"></div></div>;

  return (
    <div className="at-wrapper">
      
      <header className="at-header">
        <h1>Available Missions</h1>
        <p>Select a distress signal to respond immediately.</p>
        <div className="at-count-badge">{tasks.length} Open Alerts</div>
      </header>

      <div className="at-grid">
        {tasks.length === 0 ? (
          <div className="at-empty">
            <FiCheckCircle />
            <h3>All Clear</h3>
            <p>No pending emergency signals in your sector.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="at-card">
              
              {/* MAP PREVIEW */}
              <div className="at-map-preview">
                <MapContainer 
                  center={[task.location.coordinates[1], task.location.coordinates[0]]} 
                  zoom={13} 
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={false} // Static map
                  className="static-map"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[task.location.coordinates[1], task.location.coordinates[0]]} />
                </MapContainer>
                <div className="at-severity-tag">
                  <FiAlertCircle /> {task.type}
                </div>
              </div>

              {/* DETAILS */}
              <div className="at-content">
                <div className="at-top-row">
                  <span className="at-time"><FiClock /> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <span className="at-dist"><FiMapPin /> GPS Locked</span>
                </div>

                <h4>{task.description || "Emergency Assistance Required"}</h4>
                
                <div className="at-meta">
                  <p>Requester: <strong>{task.userId?.fullName || "Anonymous"}</strong></p>
                  {task.linkedResources && task.linkedResources.length > 0 && (
                    <span className="at-res-tag">Needs {task.linkedResources.length} Items</span>
                  )}
                </div>

                <button className="at-accept-btn" onClick={() => handleAccept(task._id)}>
                  <FiShield /> Accept Mission
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default AvailableTasks;