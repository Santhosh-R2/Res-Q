import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { FiPackage, FiCalendar, FiUser, FiArrowRight, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../styles/InventoryHistory.css';
function InventoryHistory(  ) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axiosInstance.get('/resources/distribution-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="loader">Scanning Logs...</div>;

  return (
    <div className="history-wrapper">
      <header className="history-header">
        <h1>Inventory Distribution Logs</h1>
        <p>Comprehensive record of all resources dispatched from Global HQ.</p>
      </header>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-history">No distribution records found.</div>
        ) : (
          history.map((log) => (
            <div key={log._id} className="history-card">
              <div className="card-side-status">
                {log.status === 'delivered' ? <FiCheckCircle className="icon-delivered" /> : <FiTruck className="icon-dispatched" />}
              </div>
              
              <div className="card-main-content">
                <div className="card-header-row">
                  <span className="log-id">LOG-ID: #{log._id.slice(-6).toUpperCase()}</span>
                  <span className="log-date"><FiCalendar /> {new Date(log.updatedAt).toLocaleDateString()}</span>
                </div>

                <div className="distribution-details">
                  <div className="recipient-info">
                    <label><FiUser /> RECIPIENT</label>
                    <strong>{log.userId?.fullName}</strong>
                    <span>{log.userId?.phone}</span>
                  </div>

                  <div className="items-info">
                    <label><FiPackage /> ITEMS ALLOCATED</label>
                    <div className="item-tags">
                      {log.items.map((item, i) => (
                        <span key={i} className="item-tag">
                          {item.itemCategory} <strong>x{item.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className={`status-pill ${log.status}`}>
                    {log.status.toUpperCase()}
                  </div>
                  <div className="mission-notes">
                    {log.notes?.replace("[Volunteer Request from Global Inventory]", "")}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InventoryHistory;