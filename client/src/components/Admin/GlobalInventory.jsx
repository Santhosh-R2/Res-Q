import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiBox, FiPlus, FiTrash2, FiSearch, FiActivity, FiDroplet, FiBriefcase,
  FiAlertTriangle, FiRefreshCw, FiTruck, FiCheckCircle, FiGift, FiXCircle
} from "react-icons/fi";

import '../styles/GlobalInventory.css';

function GlobalInventory() {
  const [items, setItems] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [incomingDonations, setIncomingDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [userRole, setUserRole] = useState('victim');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [formData, setFormData] = useState({ itemName: '', category: 'Food', quantity: '', unit: 'units' });
  const [requestData, setRequestData] = useState({ item: null, quantity: 1, notes: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) setUserRole(user.role);
    fetchData();
  }, []);

  const fetchData = async () => {
    if (items.length === 0) setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [invRes, reqRes] = await Promise.all([
        axiosInstance.get('/inventory', config),
        axiosInstance.get('/resources', config)
      ]);

      setItems(invRes.data);

      const userObj = JSON.parse(localStorage.getItem('userInfo'));
      if (userObj.role === 'admin') {
        const volRequests = reqRes.data.filter(r =>
          r.status === 'pending' && r.notes && r.notes.includes("[Volunteer Request")
        );
        setPendingRequests(volRequests);

        const donations = reqRes.data.filter(r => r.status === 'fulfilled');
        setIncomingDonations(donations);
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...formData, quantity: Number(formData.quantity) };
      await axiosInstance.post('/inventory', payload, config);
      toast.success("Item Added!");
      setShowAddModal(false);
      fetchData();
    } catch (error) { toast.error("Failed to add item"); }
  };

  const updateQuantity = async (id, currentQty, change) => {
    if (userRole !== 'admin') return;
    const newQty = Math.max(0, currentQty + change);

    setItems(items.map(i => {
      if (i._id === id) {
        let status = 'In Stock';
        if (newQty === 0) status = 'Out of Stock';
        else if (newQty < 10) status = 'Low Stock';
        return { ...i, quantity: newQty, status };
      }
      return i;
    }));

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/inventory/${id}`, { quantity: newQty }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      toast.error("Update failed");
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete item?")) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/inventory/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems(items.filter(i => i._id !== id));
      toast.success("Deleted");
    } catch (error) { toast.error("Delete failed"); }
  };

  const handleApprove = async (reqId) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/resources/${reqId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Approved & Stock Deducted");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Approval Failed");
    }
  };
  const handleReject = async (reqId) => {
    if (!window.confirm("Are you sure you want to reject this supply request?")) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axiosInstance.put(`/resources/${reqId}/reject`, {}, config);

      toast.info("Request Rejected");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Rejection Failed");
    }
  };
  const confirmDonationReceipt = async (donation) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const itemData = donation.items[0];

      const existingItem = items.find(i => i.itemName.toLowerCase() === itemData.itemCategory.toLowerCase());

      if (existingItem) {
        const newQty = existingItem.quantity + parseInt(itemData.quantity);
        await axiosInstance.put(`/inventory/${existingItem._id}`, { quantity: newQty }, config);
      } else {
        await axiosInstance.post('/inventory', {
          itemName: itemData.itemCategory,
          category: "Other",
          quantity: parseInt(itemData.quantity),
          unit: "units"
        }, config);
      }

      await axiosInstance.put(`/resources/${donation._id}/status`, { status: 'delivered' }, config);
      toast.success("Donation Added to Stock!");
      fetchData();

    } catch (error) { toast.error("Failed to process donation"); }
  };

  const openRequestModal = (item) => {
    setRequestData({ item: item, quantity: 1, notes: '' });
    setShowRequestModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (requestData.quantity > requestData.item.quantity) return toast.warn("Requested quantity exceeds stock!");

    try {
      const token = localStorage.getItem('token');
      const payload = {
        itemType: requestData.item.itemName,
        quantity: `${requestData.quantity}`,
        urgency: 'High',
        notes: `[Volunteer Request from Global Inventory] ${requestData.notes}`,
        items: [{ itemCategory: requestData.item.itemName, quantity: `${requestData.quantity}` }]
      };

      await axiosInstance.post('/resources', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Request Sent to HQ!");
      setShowRequestModal(false);
    } catch (error) { toast.error("Failed to send request"); }
  };

  const getIcon = (cat) => {
    switch (cat) {
      case 'Food': return <FiBox />;
      case 'Water': return <FiDroplet />;
      case 'Medical': return <FiActivity />;
      default: return <FiBriefcase />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = filter === 'All' || item.category === filter;
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="Global-inv-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <header className="Global-inv-header">
        <div className="Global-inv-header-left">
          <h1>Logistics Hub</h1>
          <p>Global resource monitoring & allocation.</p>
        </div>
        <div className="Global-inv-header-actions">
          <button className="Global-inv-btn-refresh" onClick={fetchData}><FiRefreshCw /></button>
          {userRole === 'admin' && (
            <button className="Global-inv-btn-primary" onClick={() => setShowAddModal(true)}><FiPlus /> New Entry</button>
          )}
        </div>
      </header>

      <div className="Global-inv-stats-panel">
        <div className="Global-inv-stat-card">
          <div className="Global-inv-stat-icon Global-inv-blue"><FiBox /></div>
          <div className="Global-inv-stat-info">
            <h3>Total Items</h3>
            <span>{items.length} SKUs</span>
          </div>
        </div>
        <div className="Global-inv-stat-card">
          <div className="Global-inv-stat-icon Global-inv-green"><FiActivity /></div>
          <div className="Global-inv-stat-info">
            <h3>Total Volume</h3>
            <span>{items.reduce((acc, i) => acc + i.quantity, 0)} Units</span>
          </div>
        </div>
        <div className="Global-inv-stat-card">
          <div className="Global-inv-stat-icon Global-inv-red"><FiAlertTriangle /></div>
          <div className="Global-inv-stat-info">
            <h3>Critical Low</h3>
            <span>{items.filter(i => i.status !== 'In Stock').length} Alerts</span>
          </div>
        </div>
      </div>

      {userRole === 'admin' && pendingRequests.length > 0 && (
        <div className="Global-inv-pending-req-section">
          <h3>🚨 Pending Volunteer Requests <span className="Global-inv-count-pill">{pendingRequests.length}</span></h3>
          <div className="Global-inv-req-grid">
            {pendingRequests.map(req => (
              <div key={req._id} className="Global-inv-req-card">
                <div className="Global-inv-req-card-header">
                  <div className="Global-inv-req-user">
                    <div className="Global-inv-user-initials">{req.userId?.fullName?.charAt(0) || "U"}</div>
                    <div className='glob-name'><strong>{req.userId?.fullName}</strong> <span>Volunteer</span></div>
                  </div>
                </div>
                <div className="Global-inv-req-body">
                  <ul className="Global-inv-req-item-list">
                    {req.items.map((item, idx) => (
                      <li key={idx}><strong>{item.itemCategory}</strong><span className="Global-inv-sub-qty">Qty: {item.quantity}</span></li>
                    ))}
                  </ul>
                  <p className="Global-inv-mission-text">{req.notes.replace("[Volunteer Request from Global Inventory]", "")}</p>
                </div>
                <div className="Global-inv-req-footer">
                  <button
                    className="Global-inv-btn-approve"
                    onClick={() => handleApprove(req._id)}
                  >
                    <FiCheckCircle /> Authorize
                  </button>

                  <button
                    className="Global-inv-btn-reject"
                    onClick={() => handleReject(req._id)}
                  >
                    <FiXCircle /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userRole === 'admin' && incomingDonations.length > 0 && (
        <div className="Global-inv-donation-section">
          <h3><FiGift /> Incoming Donations <span className="Global-inv-count-pill green">{incomingDonations.length}</span></h3>
          <div className="Global-inv-req-grid">
            {incomingDonations.map(don => (
              <div key={don._id} className="Global-inv-req-card donation">
                <div className="Global-inv-req-card-header green-theme">
                  <div className="Global-inv-req-user">
                    <div className="Global-inv-user-initials green">D</div>
                    <div><strong>{don.donorId?.fullName || "Donor"}</strong><span>Incoming Supply</span></div>
                  </div>
                </div>
                <div className="Global-inv-req-body">
                  <ul className="Global-inv-req-item-list">
                    {don.items.map((item, idx) => (
                      <li key={idx}><strong>{item.itemCategory}</strong><span className="Global-inv-sub-qty green">{item.quantity}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="Global-inv-req-footer">
                  <button className="Global-inv-btn-approve green" onClick={() => confirmDonationReceipt(don)}>
                    <FiCheckCircle /> Add to Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="Global-inv-content-card">
        <div className="Global-inv-toolbar">
          <div className="Global-inv-search-wrapper">
            <FiSearch />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="Global-inv-filter-tabs">
            {['All', 'Food', 'Water', 'Medical', 'Equipment'].map(cat => (
              <button key={cat} className={filter === cat ? 'Global-inv-active' : ''} onClick={() => setFilter(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="Global-inv-table-responsive">
          {loading ? <div className="Global-inv-loading-state"><div className="Global-inv-spinner"></div><p>Syncing...</p></div> :
            filteredItems.length === 0 ? <div className="Global-inv-empty-state"><FiBox /><p>No inventory found.</p></div> : (
              <table className="Global-inv-table">
                <thead>
                  <tr>
                    <th>Item Details</th><th>Category</th><th>Stock Level</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item._id}>
                      <td>
                        <div className="Global-inv-item-cell">
                          <div className={`Global-inv-icon-box Global-inv-${item.category.toLowerCase()}`}>{getIcon(item.category)}</div>
                          <span className="Global-inv-item-name">{item.itemName}</span>
                        </div>
                      </td>
                      <td><span className="Global-inv-category-tag">{item.category}</span></td>
                      <td>
                        <div className="Global-inv-stock-control">
                          {userRole === 'admin' && <button className="Global-inv-qty-btn" onClick={() => updateQuantity(item._id, item.quantity, -1)}>-</button>}
                          <span className="Global-inv-qty-value">{item.quantity} <small>{item.unit}</small></span>
                          {userRole === 'admin' && <button className="Global-inv-qty-btn" onClick={() => updateQuantity(item._id, item.quantity, 1)}>+</button>}
                        </div>
                      </td>
                      <td>
                        <span className={`Global-inv-status-badge Global-inv-${item.status.replace(/\s/g, '').toLowerCase()}`}>{item.status}</span>
                      </td>
                      <td>
                        {userRole === 'admin' ? (
                          <button className="Global-inv-btn-delete" onClick={() => handleDelete(item._id)}><FiTrash2 /></button>
                        ) : (
                          <button className="Global-inv-btn-request" disabled={item.quantity === 0} onClick={() => openRequestModal(item)}><FiTruck /> Request</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {showAddModal && (
        <div className="Global-inv-modal-backdrop">
          <div className="Global-inv-modal-panel">
            <h3>Add New Resource</h3>
            <form onSubmit={handleAdd}>
              <div className="Global-inv-form-group"><label>Name</label><input required value={formData.itemName} onChange={e => setFormData({ ...formData, itemName: e.target.value })} /></div>
              <div className="Global-inv-form-row">
                <div className="Global-inv-form-group"><label>Category</label><select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}><option>Food</option><option>Water</option><option>Medical</option><option>Equipment</option></select></div>
                <div className="Global-inv-form-group"><label>Unit</label><input required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} /></div>
              </div>
              <div className="Global-inv-form-group"><label>Qty</label><input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} /></div>
              <div className="Global-inv-modal-actions"><button type="button" className="Global-inv-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button><button type="submit" className="Global-inv-btn-primary Global-inv-full">Add</button></div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="Global-inv-modal-backdrop">
          <div className="Global-inv-modal-panel request-modal">
            <div className="Global-inv-modal-header"><h3>Request Deployment</h3></div>
            <div className="item-preview-card">
              <div className="preview-info"><h4>{requestData.item?.itemName}</h4><span className="stock-badge">Available: {requestData.item?.quantity}</span></div>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="Global-inv-form-group">
                <label>Quantity</label>
                <div className="qty-stepper-large">
                  <button type="button" onClick={() => setRequestData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}>-</button>
                  <input type="number" value={requestData.quantity} onChange={e => setRequestData({ ...requestData, quantity: Number(e.target.value) })} />
                  <button type="button" onClick={() => setRequestData(prev => ({ ...prev, quantity: Math.min(requestData.item?.quantity, prev.quantity + 1) }))}>+</button>
                </div>
              </div>
              <div className="Global-inv-form-group"><label>Mission Context</label><textarea rows="3" value={requestData.notes} onChange={e => setRequestData({ ...requestData, notes: e.target.value })} className="modal-textarea"></textarea></div>
              <div className="Global-inv-modal-actions"><button type="button" className="Global-inv-btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button><button type="submit" className="Global-inv-btn-primary Global-inv-full">Confirm</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default GlobalInventory;