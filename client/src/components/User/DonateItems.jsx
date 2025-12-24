import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import {
  FiPackage, FiClock, FiCheckCircle, FiHeart, FiMapPin
} from "react-icons/fi";

import '../styles/DonateItems.css';

function DonateItems() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (user && user._id) {
        setCurrentUserId(user._id);
      }
    } catch (e) { console.error("Error parsing user info", e); }
  }, []);

  const fetchRequests = async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axiosInstance.get('/resources', config);
      const validRequests = res.data.filter(r => {
        if (r.status !== 'pending') return false;
        const creatorId = r.userId?._id || r.userId;
        if (creatorId === currentUserId) return false;

        return true;
      });

      setRequests(validRequests);
    } catch (error) {
      toast.error("Failed to load donation list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) fetchRequests();
  }, [currentUserId]);

  const handlePledge = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/resources/${id}/fulfill`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Thank you! Coordination team notified.");
      fetchRequests();
    } catch (error) {
      toast.error("Action Failed");
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return req.urgency === 'High' || req.urgency === 'Critical';
    return req.items.some(item => item.itemCategory.toLowerCase().includes(filter));
  });

  if (loading) return (
    <div className="donateItems-loader">
      <div className="donateItems-spinner"></div>
    </div>
  );

  return (
    <div className="donateItems-wrapper">

      <header className="donateItems-header">
        <div className="donateItems-header-text">
          <h1>Aid Marketplace</h1>
          <p>Connect directly with victims needs. Your contribution saves lives.</p>
        </div>
        <div className="donateItems-stats">
          <div className="donateItems-stat-box">
            <h3>{requests.length}</h3>
            <span>Open Requests</span>
          </div>
        </div>
      </header>

      <div className="donateItems-controls">
        <button className={filter === 'all' ? 'donateItems-active' : ''} onClick={() => setFilter('all')}>All Needs</button>
        <button className={filter === 'urgent' ? 'donateItems-active' : ''} onClick={() => setFilter('urgent')}>High Urgency</button>
        <button className={filter === 'food' ? 'donateItems-active' : ''} onClick={() => setFilter('food')}>Food/Water</button>
        <button className={filter === 'medical' ? 'donateItems-active' : ''} onClick={() => setFilter('medical')}>Medical</button>
      </div>

      <div className="donateItems-grid">
        {filteredRequests.length === 0 ? (
          <div className="donateItems-empty">
            <FiCheckCircle />
            <h3>No pending requests found.</h3>
            <p>Great news! All current needs have been met.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req._id} className="donateItems-card">

              <div className="donateItems-card-badge">
                <span className={`donateItems-urgency-pill donateItems-${req.urgency.toLowerCase()}`}>{req.urgency} Priority</span>
                <span className="donateItems-time-ago"><FiClock /> {new Date(req.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="donateItems-card-body">
                <h4>Items Needed:</h4>
                <ul className="donateItems-item-list">
                  {req.items.map((item, idx) => (
                    <li key={idx}>
                      <FiPackage className="donateItems-icon-pkg" />
                      <span>{item.itemCategory}</span>
                      <strong className="donateItems-qty">x{item.quantity}</strong>
                    </li>
                  ))}
                </ul>

                {req.notes && (
                  <div className="donateItems-notes-box">
                    <p>"{req.notes}"</p>
                  </div>
                )}

                <div className="donateItems-requester-info">
                  <FiMapPin /> Request from: <strong>{req.userId?.fullName || "Anonymous User"}</strong>
                </div>
              </div>

              <div className="donateItems-card-footer">
                <button className="donateItems-btn-pledge" onClick={() => handlePledge(req._id)}>
                  <FiHeart /> I Can Provide This
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default DonateItems;