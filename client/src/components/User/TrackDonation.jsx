import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { 
  FiPackage, FiCheckCircle, FiTruck, FiUser, FiMapPin 
} from "react-icons/fi";

import '../styles/TrackDonation.css';

function TrackDonation() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axiosInstance.get('/resources/donations', config);
        setDonations(res.data);
      } catch (error) {
        toast.error("Failed to load donation history");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const renderProgress = (status) => {
    return (
      <div className="track-donation-stepper">
        <div className="track-donation-step track-donation-completed">
          <div className="track-donation-step-dot"><FiCheckCircle /></div>
          <span>Pledged</span>
        </div>
        <div className="track-donation-step-line track-donation-active"></div>
        <div className="track-donation-step track-donation-completed">
          <div className="track-donation-step-dot"><FiTruck /></div>
          <span>Processing</span>
        </div>
        <div className="track-donation-step-line"></div>
        <div className={`track-donation-step ${status === 'delivered' ? 'track-donation-completed' : ''}`}>
          <div className="track-donation-step-dot"><FiMapPin /></div>
          <span>Delivered</span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="track-donation-loader"><div className="track-donation-spinner"></div></div>;

  return (
    <div className="track-donation-wrapper">
      
      <header className="track-donation-header">
        <h1>My Contributions</h1>
        <p>Track the journey of your donated supplies.</p>
        <div className="track-donation-impact-badge">
          {donations.length} Lives Impacted
        </div>
      </header>

      <div className="track-donation-list">
        {donations.length === 0 ? (
          <div className="track-donation-empty">
            <FiPackage />
            <h3>No Donations Yet</h3>
            <p>Visit the 'Donate Items' page to make your first pledge.</p>
          </div>
        ) : (
          donations.map((donation) => (
            <div key={donation._id} className="track-donation-card">
              
              <div className="track-donation-card-top">
                <div className="track-donation-item-group">
                  <h4><FiPackage /> Donation #{donation._id.slice(-6).toUpperCase()}</h4>
                  <span className="track-donation-timestamp">{new Date(donation.updatedAt).toLocaleDateString()}</span>
                </div>
                <span className="track-donation-status-pill">{donation.status}</span>
              </div>

              <div className="track-donation-track-body">
                <div className="track-donation-items-row">
                  {donation.items.map((item, i) => (
                    <span key={i} className="track-donation-item-tag">
                      {item.quantity} {item.itemCategory}
                    </span>
                  ))}
                </div>

                <div className="track-donation-recipient-box">
                  <span className="track-donation-label">Recipient:</span>
                  <div className="track-donation-rec-details">
                    <FiUser /> {donation.userId?.fullName || "Verified Victim"}
                  </div>
                </div>

                {renderProgress(donation.status)}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default TrackDonation;