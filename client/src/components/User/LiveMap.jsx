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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const sosIcon = createColoredIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
const resourceIcon = createColoredIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png');

const userIcon = new L.DivIcon({
  className: 'Livemap-user-pulse-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          fetchData();
        },
        () => {
          toast.error("Location Access Denied. Using Default Map.");
          setUserLocation([20.5937, 78.9629]); 
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
      const [sosRes, resRes] = await Promise.all([
        axiosInstance.get('/sos', config),
        axiosInstance.get('/resources', config)
      ]);
      setSosData(sosRes.data);
      setResourceData(resRes.data);
    } catch (error) {
      toast.error("Failed to load live data");
    } finally {
      setLoading(false);
    }
  };

  const openNavigation = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (loading) return <div className="Livemap-loader">Initializing Satellite Link...</div>;

  return (
    <div className="Livemap-wrapper">
      
      <div className="Livemap-controls">
        <div className="Livemap-control-header">
          <h3>Tactical Map</h3>
          <span className="Livemap-live-indicator"><span className="Livemap-blink-dot"></span> LIVE</span>
        </div>
        
        <div className="Livemap-filter-chips">
          <button className={filter === 'all' ? 'Livemap-active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'sos' ? 'Livemap-active' : ''} onClick={() => setFilter('sos')}>
            <span className="Livemap-dot Livemap-red"></span> SOS
          </button>
          <button className={filter === 'resources' ? 'Livemap-active' : ''} onClick={() => setFilter('resources')}>
            <span className="Livemap-dot Livemap-orange"></span> Supplies
          </button>
        </div>

        <div className="Livemap-legend">
          <div className="Livemap-legend-item">
            <FiAlertCircle className="Livemap-icon-red" /> {sosData.length} Active SOS
          </div>
          <div className="Livemap-legend-item">
            <FiPackage className="Livemap-icon-orange" /> {resourceData.length} Supply Requests
          </div>
        </div>
      </div>

      <button className="Livemap-recenter-btn" onClick={() => userLocation && window.location.reload()} title="Refresh GPS">
        <FiCrosshair />
      </button>

      <MapContainer 
        center={userLocation || [20.5937, 78.9629]} 
        zoom={13} 
        zoomControl={false}
        className="Livemap-fullscreen-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <FlyToLocation center={userLocation} />}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {(filter === 'all' || filter === 'sos') && sosData.map(sos => (
          <Marker 
            key={sos._id} 
            position={[sos.location.coordinates[1], sos.location.coordinates[0]]} 
            icon={sosIcon}
          >
            <Popup className="Livemap-custom-popup">
              <div className="Livemap-popup-content">
                <span className="Livemap-badge Livemap-badge-red">{sos.type} Emergency</span>
                <h4>{sos.description ? (sos.description.length > 40 ? sos.description.substring(0,40)+'...' : sos.description) : 'Emergency Request'}</h4>
                <p>Status: <strong>{sos.status.toUpperCase()}</strong></p>
                <button className="Livemap-nav-btn" onClick={() => openNavigation(sos.location.coordinates[1], sos.location.coordinates[0])}>
                  <FiNavigation /> Navigate
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {(filter === 'all' || filter === 'resources') && resourceData.map(res => (
          <Marker 
            key={res._id} 
            position={[res.location.coordinates[1], res.location.coordinates[0]]} 
            icon={resourceIcon}
          >
            <Popup className="Livemap-custom-popup">
              <div className="Livemap-popup-content">
                <span className="Livemap-badge Livemap-badge-orange">Supply Request</span>
                {res.items && res.items.length > 0 ? (
                   <h4>{res.items[0].itemCategory} + {res.items.length - 1} more</h4>
                ) : (
                   <h4>General Supplies</h4>
                )}
                <p>Urgency: <strong>{res.urgency}</strong></p>
                <button className="Livemap-nav-btn" onClick={() => openNavigation(res.location.coordinates[1], res.location.coordinates[0])}>
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