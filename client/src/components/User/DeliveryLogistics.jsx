import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { 
  FiBox, FiMapPin, FiTruck, FiCheckSquare, FiNavigation, FiPhone, FiPackage 
} from "react-icons/fi";

import '../styles/DeliveryLogistics.css';

function DeliveryLogistics() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); 

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axiosInstance.get('/resources/logistics', config);
      
      const visibleStatuses = ['fulfilled', 'collected', 'delivered', 'dispatched'];
      const list = res.data.filter(r => visibleStatuses.includes(r.status));
      
      setDeliveries(list);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load logistics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/resources/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Status updated: ${newStatus.toUpperCase()}`);
      fetchDeliveries(); 
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  const displayedDeliveries = deliveries.filter(d => {
    if (tab === 'active') {
        return ['fulfilled', 'collected', 'dispatched'].includes(d.status);
    }
    return d.status === 'delivered';
  });

  const openNav = (coords) => {
    if(coords && coords.length === 2) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`, '_blank');
    } else {
      toast.warn("No coordinates available");
    }
  };

  if (loading) return <div className="delivery-logistics-loader"><div className="delivery-logistics-spinner"></div></div>;

  return (
    <div className="delivery-logistics-wrapper">
      
      <header className="delivery-logistics-header">
        <h1>Logistics & Delivery</h1>
        <p>Manage pickup from donors/HQ and delivery to victims.</p>
        
        <div className="delivery-logistics-tabs">
          <button className={tab === 'active' ? 'delivery-logistics-active' : ''} onClick={() => setTab('active')}>Active Tasks</button>
          <button className={tab === 'history' ? 'delivery-logistics-active' : ''} onClick={() => setTab('history')}>Completed</button>
        </div>
      </header>

      <div className="delivery-logistics-grid">
        {displayedDeliveries.length === 0 ? (
          <div className="delivery-logistics-empty">No delivery tasks available.</div>
        ) : (
          displayedDeliveries.map((item) => (
            <div key={item._id} className={`delivery-logistics-card delivery-logistics-${item.status}`}>
              
              <div className="delivery-logistics-card-header">
                <span className={`delivery-logistics-status-badge delivery-logistics-${item.status}`}>
                    {item.status === 'dispatched' ? 'INCOMING FROM HQ' : item.status.toUpperCase()}
                </span>
                <span className="delivery-logistics-id">#{item._id.slice(-6)}</span>
              </div>

              <div className="delivery-logistics-body">
                
                <div className="delivery-logistics-section">
                  <label><FiBox /> Shipment Content</label>
                  <div className="delivery-logistics-items-list">
                    {item.items && item.items.length > 0 ? (
                        item.items.map((i, idx) => (
                        <span key={idx} className="delivery-logistics-pill">
                            <strong>{i.quantity}</strong> {i.itemCategory}
                        </span>
                        ))
                    ) : (
                        <span className="delivery-logistics-pill">
                            <strong>{item.quantity}</strong> {item.itemType}
                        </span>
                    )}
                  </div>
                </div>

                <div className="delivery-logistics-section">
                  <label><FiMapPin /> Route Details</label>
                  <div className="delivery-logistics-route-box">
                    
                    <div className="delivery-logistics-route-step">
                      <div className="delivery-logistics-dot delivery-logistics-start"></div>
                      <div>
                        <span>Source / Pickup</span>
                        {item.status === 'dispatched' ? (
                            <>
                                <strong>Global Inventory HQ</strong>
                                <p className="delivery-logistics-contact-sub">Admin Authorized</p>
                            </>
                        ) : item.donorId ? (
                          <>
                            <strong>{item.donorId.fullName}</strong>
                            <p className="delivery-logistics-contact-sub"><FiPhone size={10}/> {item.donorId.phone}</p>
                          </>
                        ) : (
                          <p style={{fontStyle:'italic', color:'#888'}}>Anonymous Donor</p>
                        )}
                      </div>
                    </div>

                    <div className="delivery-logistics-route-line"></div>

                    <div className="delivery-logistics-route-step">
                      <div className="delivery-logistics-dot delivery-logistics-end"></div>
                      <div>
                        <span>Deliver To</span>
                        <strong>{item.userId?.fullName || "Mission Site"}</strong>
                        <button className="delivery-logistics-nav-small-btn" onClick={() => openNav(item.location?.coordinates)}>
                          <FiNavigation /> Map
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              <div className="delivery-logistics-footer">
                {item.status === 'fulfilled' && (
                  <button className="delivery-logistics-btn-action delivery-logistics-pickup" onClick={() => updateStatus(item._id, 'collected')}>
                    <FiTruck /> Confirm Pickup from Donor
                  </button>
                )}

                {item.status === 'dispatched' && (
                  <button className="delivery-logistics-btn-action delivery-logistics-pickup" onClick={() => updateStatus(item._id, 'collected')}>
                    <FiPackage /> Confirm Receipt from HQ
                  </button>
                )}

                {item.status === 'collected' && (
                  <button className="delivery-logistics-btn-action delivery-logistics-deliver" onClick={() => updateStatus(item._id, 'delivered')}>
                    <FiCheckSquare /> Confirm Final Delivery
                  </button>
                )}
                
                {item.status === 'delivered' && (
                  <div className="delivery-logistics-completed-msg">Delivery Verified ✅</div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default DeliveryLogistics;