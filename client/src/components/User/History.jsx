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
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axiosInstance.get('/sos/history', config);
        setHistory(res.data);
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
    if (status === 'resolved') return <span className="History-badge History-green"><FiCheckCircle /> Completed</span>;
    if (status === 'accepted') return <span className="History-badge History-blue"><FiActivity /> In Progress</span>;
    return <span className="History-badge History-gray">{status}</span>;
  };

  const totalMissions = history.length;
  const completedMissions = history.filter(h => h.status === 'resolved').length;

  return (
    <div className="History-wrapper">

      <header className="History-header">
        <div className="History-title">
          <h1>Mission Log</h1>
          <p>Track your contributions and impact.</p>
        </div>

        <div className="History-stats-row">
          <div className="History-stat-card">
            <div className="History-stat-icon History-purple"><FiAward /></div>
            <div>
              <h3>{totalMissions}</h3>
              <span>Total Missions</span>
            </div>
          </div>
          <div className="History-stat-card">
            <div className="History-stat-icon History-green"><FiCheckCircle /></div>
            <div>
              <h3>{completedMissions}</h3>
              <span>Lives Impacted</span>
            </div>
          </div>
        </div>
      </header>

      <div className="History-controls">
        <div className="History-tabs">
          <button className={filter === 'all' ? 'History-active' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'accepted' ? 'History-active' : ''} onClick={() => setFilter('accepted')}>Active</button>
          <button className={filter === 'resolved' ? 'History-active' : ''} onClick={() => setFilter('resolved')}>Resolved</button>
        </div>
      </div>

      <div className="History-list">
        {loading ? <div className="History-loader">Loading records...</div> :
          filteredHistory.length === 0 ? <div className="History-empty">No mission history found.</div> :

            filteredHistory.map((mission) => (
              <div key={mission._id} className="History-card">

                <div className="History-card-left">
                  <div className={`History-icon-box History-${mission.type.toLowerCase()}`}>
                    {mission.type.charAt(0)}
                  </div>
                  <div className="History-card-info">
                    <h4>{mission.type} Response</h4>
                    <span className="History-id">ID: #{mission._id.slice(-6).toUpperCase()}</span>
                    <p className="History-desc">{mission.description || "No details provided."}</p>
                  </div>
                </div>

                <div className="History-card-right">
                  <div className="History-meta">
                    <div className="History-meta-item"><FiUser /> {mission.userId?.fullName || "Anonymous"}</div>
                    <div className="History-meta-item"><FiMapPin /> GPS: {mission.location.coordinates[1].toFixed(4)}, {mission.location.coordinates[0].toFixed(4)}</div>
                    <div className="History-meta-item"><FiClock /> {new Date(mission.updatedAt).toLocaleDateString()}</div>
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