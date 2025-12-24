import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { FiMapPin, FiClock, FiShield, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

// Leaflet Icon Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

import '../styles/AvailableTasks.css';

function AvailableTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axiosInstance.get('/sos', config);
      
      const openTasks = res.data.filter(t => t.status === 'pending' && !t.assignedVolunteer);
      setTasks(openTasks);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/sos/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Mission Accepted! Moved to Mission Control.");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to accept task");
    }
  };

  if (loading) return (
    <div className="available-tasks-loader">
      <div className="available-tasks-spinner"></div>
    </div>
  );

  return (
    <div className="available-tasks-wrapper">
      
      <header className="available-tasks-header">
        <h1>Available Missions</h1>
        <p>Select a distress signal to respond immediately.</p>
        <div className="available-tasks-count-badge">{tasks.length} Open Alerts</div>
      </header>

      <div className="available-tasks-grid">
        {tasks.length === 0 ? (
          <div className="available-tasks-empty">
            <FiCheckCircle />
            <h3>All Clear</h3>
            <p>No pending emergency signals in your sector.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="available-tasks-card">
              
              <div className="available-tasks-map-preview">
                <MapContainer 
                  center={[task.location.coordinates[1], task.location.coordinates[0]]} 
                  zoom={13} 
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={false} 
                  className="available-tasks-static-map"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[task.location.coordinates[1], task.location.coordinates[0]]} />
                </MapContainer>
                <div className="available-tasks-severity-tag">
                  <FiAlertCircle /> {task.type}
                </div>
              </div>

              <div className="available-tasks-content">
                <div className="available-tasks-top-row">
                  <span className="available-tasks-time">
                    <FiClock /> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="available-tasks-dist">
                    <FiMapPin /> GPS Locked
                  </span>
                </div>

                <h4>{task.description || "Emergency Assistance Required"}</h4>
                
                <div className="available-tasks-meta">
                  <p>Requester: <strong>{task.userId?.fullName || "Anonymous"}</strong></p>
                  {task.linkedResources && task.linkedResources.length > 0 && (
                    <span className="available-tasks-res-tag">
                      Needs {task.linkedResources.length} Items
                    </span>
                  )}
                </div>

                <button className="available-tasks-accept-btn" onClick={() => handleAccept(task._id)}>
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