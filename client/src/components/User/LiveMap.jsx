import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { 
  FiFilter, FiNavigation, FiAlertCircle, FiPackage, FiCrosshair 
} from "react-icons/fi";

import '../styles/LiveMap.css';

// --- CUSTOM MARKER ICONS ---
// We use colored SVGs for professional markers
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const sosIcon = createIcon('red');
const resourceIcon = createIcon('orange');
const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4024/4024665.png', // Blue dot style
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'user-pulse-marker' // CSS animation class
});

// --- HELPER: RECENTER MAP COMPONENT ---
function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 2 });
  }, [center, map]);
  return null;
}

function LiveMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [sosData, setSosData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [filter, setFilter] = useState('all'); // all, sos, resources
  const [loading, setLoading] = useState(true);

  // 1. Get User Location & Data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          fetchData();
        },
        () => {
          toast.error("Location Access Denied. Showing Default Map.");
          setUserLocation([20.5937, 78.9629]); // Default India
          fetchData();
        }
      );
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [sosRes, resRes] = await Promise.all([
        axiosInstance.get('/sos', config),
        axiosInstance.get('/resources', config) // Ensure this route exists in backend
      ]);

      setSosData(sosRes.data);
      setResourceData(resRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load map data");
    } finally {
      setLoading(false);
    }
  };

  // 2. Open Google Maps for Directions
  const openNavigation = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  // 3. Calculate Distance (Haversine)
  const getDistance = (lat1, lon1) => {
    if (!userLocation) return "N/A";
    const [lat2, lon2] = userLocation;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1) + " km";
  };

  if (loading) return <div className="map-loader">Initializing Satellite Link...</div>;

  return (
    <div className="live-map-wrapper">
      
      {/* FLOATING CONTROLS */}
      <div className="map-controls">
        <div className="control-header">
          <h3>Tactical Map</h3>
          <span className="live-indicator"><span className="blink-dot"></span> LIVE</span>
        </div>
        
        <div className="filter-chips">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'sos' ? 'active' : ''} onClick={() => setFilter('sos')}>
            <span className="dot red"></span> SOS
          </button>
          <button className={filter === 'resources' ? 'active' : ''} onClick={() => setFilter('resources')}>
            <span className="dot orange"></span> Supplies
          </button>
        </div>

        <div className="map-legend">
          <div className="legend-item">
            <FiAlertCircle className="icon-red" /> {sosData.length} Active SOS
          </div>
          <div className="legend-item">
            <FiPackage className="icon-orange" /> {resourceData.length} Supply Requests
          </div>
        </div>
      </div>

      {/* RE-CENTER BUTTON */}
      <button className="recenter-btn" onClick={() => setUserLocation([...userLocation])} title="My Location">
        <FiCrosshair />
      </button>

      {/* MAP */}
      <MapContainer 
        center={userLocation || [20.5937, 78.9629]} 
        zoom={13} 
        zoomControl={false}
        className="fullscreen-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* COMPONENT TO FLY TO USER */}
        {userLocation && <FlyToLocation center={userLocation} />}

        {/* USER MARKER */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* SOS MARKERS */}
        {(filter === 'all' || filter === 'sos') && sosData.map(sos => (
          <Marker 
            key={sos._id} 
            position={[sos.location.coordinates[1], sos.location.coordinates[0]]} 
            icon={sosIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <span className="badge red">{sos.type} Emergency</span>
                <h4>{sos.description ? sos.description.substring(0,30)+'...' : 'Emergency'}</h4>
                <p>Distance: <strong>{getDistance(sos.location.coordinates[1], sos.location.coordinates[0])}</strong></p>
                <button className="nav-btn" onClick={() => openNavigation(sos.location.coordinates[1], sos.location.coordinates[0])}>
                  <FiNavigation /> Navigate
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* RESOURCE MARKERS */}
        {(filter === 'all' || filter === 'resources') && resourceData.map(res => (
          <Marker 
            key={res._id} 
            position={[res.location.coordinates[1], res.location.coordinates[0]]} 
            icon={resourceIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <span className="badge orange">Supply Request</span>
                <h4>{res.items[0]?.type} + {res.items.length - 1} more</h4>
                <p>Urgency: <strong>{res.urgency}</strong></p>
                <button className="nav-btn" onClick={() => openNavigation(res.location.coordinates[1], res.location.coordinates[0])}>
                  <FiNavigation /> Navigate
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}

export default LiveMap;