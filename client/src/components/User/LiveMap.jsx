import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { 
  FiNavigation, FiAlertCircle, FiPackage, FiCrosshair 
} from "react-icons/fi";

import '../styles/LiveMap.css';

// --- FIX LEAFLET MARKER PATHS ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- CUSTOM MARKERS ---
const createColoredIcon = (colorUrl) => {
  return new L.Icon({
    iconUrl: colorUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Red Marker for SOS
const sosIcon = createColoredIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');

// Orange Marker for Supplies
const resourceIcon = createColoredIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png');

// Blue Pulse Dot for User
const userIcon = new L.DivIcon({
  className: 'user-pulse-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- HELPER TO FLY TO LOCATION ---
function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

function LiveMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [sosData, setSosData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [filter, setFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);

  // 1. Get User Location & Data
  useEffect(() => {
    // Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          fetchData();
        },
        () => {
          toast.error("Location Access Denied. Using Default Map.");
          setUserLocation([20.5937, 78.9629]); // India Center
          fetchData();
        }
      );
    } else {
        setUserLocation([20.5937, 78.9629]); 
        fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch SOS and Resources in parallel
      const [sosRes, resRes] = await Promise.all([
        axiosInstance.get('/sos', config),
        axiosInstance.get('/resources', config)
      ]);

      console.log("SOS Data:", sosRes.data); // Debug
      console.log("Resource Data:", resRes.data); // Debug

      setSosData(sosRes.data);
      setResourceData(resRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load live data");
    } finally {
      setLoading(false);
    }
  };

  const openNavigation = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
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

      <button className="recenter-btn" onClick={() => userLocation && window.location.reload()} title="Refresh GPS">
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
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <FlyToLocation center={userLocation} />}

        {/* USER LOCATION (Blue Pulse) */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* --- SOS MARKERS (RED) --- */}
        {(filter === 'all' || filter === 'sos') && sosData.map(sos => (
          <Marker 
            key={sos._id} 
            position={[sos.location.coordinates[1], sos.location.coordinates[0]]} 
            icon={sosIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <span className="badge red">{sos.type} Emergency</span>
                <h4>{sos.description ? sos.description.substring(0,40)+'...' : 'Emergency Request'}</h4>
                <p>Status: <strong>{sos.status.toUpperCase()}</strong></p>
                <button className="nav-btn" onClick={() => openNavigation(sos.location.coordinates[1], sos.location.coordinates[0])}>
                  <FiNavigation /> Navigate
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* --- RESOURCE MARKERS (ORANGE) --- */}
        {(filter === 'all' || filter === 'resources') && resourceData.map(res => (
          <Marker 
            key={res._id} 
            position={[res.location.coordinates[1], res.location.coordinates[0]]} 
            icon={resourceIcon}
          >
            <Popup className="custom-popup">
              <div className="popup-content">
                <span className="badge orange">Supply Request</span>
                {/* Check if items exist before mapping */}
                {res.items && res.items.length > 0 ? (
                   <h4>{res.items[0].itemCategory} + {res.items.length - 1} more</h4>
                ) : (
                   <h4>General Supplies</h4>
                )}
                
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