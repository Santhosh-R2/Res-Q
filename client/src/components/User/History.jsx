import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { 
  FiCheckCircle, FiClock, FiMapPin, FiUser, FiActivity, FiAward 
} from "react-icons/fi";

import '../styles/History.css';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, resolved, accepted

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axiosInstance.get('/sos/history', config);
        setHistory(res.data);
        console.log(res.data);
        
      } catch (error) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status) => {
    if (status === 'resolved') return <span className="h-badge green"><FiCheckCircle /> Completed</span>;
    if (status === 'accepted') return <span className="h-badge blue"><FiActivity /> In Progress</span>;
    return <span className="h-badge gray">{status}</span>;
  };

  // Stats Calculation
  const totalMissions = history.length;
  const completedMissions = history.filter(h => h.status === 'resolved').length;

  return (
    <div className="hist-wrapper">
      
      {/* HEADER & STATS */}
      <header className="hist-header">
        <div className="hist-title">
          <h1>Mission Log</h1>
          <p>Track your contributions and impact.</p>
        </div>
        
        <div className="hist-stats-row">
          <div className="h-stat-card">
            <div className="stat-icon purple"><FiAward /></div>
            <div>
              <h3>{totalMissions}</h3>
              <span>Total Missions</span>
            </div>
          </div>
          <div className="h-stat-card">
            <div className="stat-icon green"><FiCheckCircle /></div>
            <div>
              <h3>{completedMissions}</h3>
              <span>Lives Impacted</span>
            </div>
          </div>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="hist-controls">
        <div className="h-tabs">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>Active</button>
          <button className={filter === 'resolved' ? 'active' : ''} onClick={() => setFilter('resolved')}>Resolved</button>
        </div>
      </div>

      {/* TIMELINE LIST */}
      <div className="hist-list">
        {loading ? <div className="hist-loader">Loading records...</div> : 
         filteredHistory.length === 0 ? <div className="hist-empty">No mission history found.</div> :
         
         filteredHistory.map((mission) => (
           <div key={mission._id} className="hist-card">
             
             <div className="hist-card-left">
               <div className={`hist-icon-box ${mission.type.toLowerCase()}`}>
                 {mission.type.charAt(0)}
               </div>
               <div className="hist-card-info">
                 <h4>{mission.type} Response</h4>
                 <span className="hist-id">ID: #{mission._id.slice(-6).toUpperCase()}</span>
                 <p className="hist-desc">{mission.description || "No details provided."}</p>
               </div>
             </div>

             <div className="hist-card-right">
               <div className="hist-meta">
                 <div className="meta-item"><FiUser /> {mission.userId?.fullName || "Anonymous"}</div>
                 <div className="meta-item"><FiMapPin /> GPS: {mission.location.coordinates[1].toFixed(4)}, {mission.location.coordinates[0].toFixed(4)}</div>
                 <div className="meta-item"><FiClock /> {new Date(mission.updatedAt).toLocaleDateString()}</div>
               </div>
               {getStatusBadge(mission.status)}
             </div>

           </div>
         ))
        }
      </div>

    </div>
  );
}

export default History;