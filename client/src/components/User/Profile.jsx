import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { 
  FiUser, FiMail, FiPhone, FiSave, FiShield, FiCheckCircle, FiRefreshCw, FiEdit3 
} from "react-icons/fi";

import '../styles/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'victim',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('userInfo'));
        if (storedUser) {
          setUser(storedUser);
          setFormData({
            fullName: storedUser.fullName || '',
            email: storedUser.email || '',
            phone: storedUser.phone || '',
            role: storedUser.role || 'victim',
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ROLE CHANGE HANDLER ---
  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setFormData({ ...formData, role: newRole }); // Optimistic update

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put('/auth/profile', { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      toast.success(`System Access Changed to: ${newRole.toUpperCase()}`);
      
      // Reload to update Sidebar
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      toast.error("Failed to change role");
      setFormData({ ...formData, role: user.role }); // Revert
    }
  };

  // --- SAVE PROFILE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('userInfo', JSON.stringify(res.data));
      toast.success("Profile Updated Successfully!");
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  if (loading) return <div className="pro-loader"><FiRefreshCw className="spin" /></div>;

  return (
    <div className="pro-profile-wrapper">
      
      <div className="pro-profile-grid">
        
        {/* --- LEFT CARD: IDENTITY --- */}
        <aside className="pro-identity-card">
          <div className="id-card-bg"></div>
          <div className="id-avatar-container">
            <div className="id-avatar">
              {formData.fullName.charAt(0).toUpperCase()}
            </div>
            <div className={`id-status-dot ${formData.role}`}></div>
          </div>
          
          <div className="id-info">
            <h2>{formData.fullName}</h2>
            <p className="id-email">{formData.email}</p>
            <span className={`id-role-badge ${formData.role}`}>
              {formData.role.toUpperCase()}
            </span>
          </div>

          <div className="id-stats">
            <div className="stat-item">
              <span className="label">Status</span>
              <span className="value active"><FiCheckCircle/> Active</span>
            </div>
            <div className="stat-item">
              <span className="label">Member Since</span>
              <span className="value">2024</span>
            </div>
          </div>
        </aside>

        {/* --- RIGHT CARD: SETTINGS FORM --- */}
        <main className="pro-settings-card">
          <div className="settings-header">
            <h3>Account Settings</h3>
            <p>Update your personal details and system role.</p>
          </div>

          <form onSubmit={handleSubmit} className="pro-form">
            
            <div className="form-section">
              <label className="section-label">General Information</label>
              
              <div className="input-group-row">
                <div className="input-field">
                  <label><FiUser /> Full Name</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="input-field">
                  <label><FiPhone /> Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="input-field disabled">
                <label><FiMail /> Email Address</label>
                <input type="email" value={formData.email} disabled />
                <span className="locked-badge">Locked</span>
              </div>
            </div>

            <div className="form-section role-section">
              <label className="section-label">System Access</label>
              <div className="role-selector-box">
                <div className="role-icon-box">
                  <FiShield />
                </div>
                <div className="role-select-wrapper">
                  <label>Current Role</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleRoleChange}
                    className="pro-select"
                  >
                    <option value="victim">Victim (Request Help)</option>
                    <option value="volunteer">Volunteer (Provide Help)</option>
                    <option value="donor">Donor (Give Supplies)</option>
                  </select>
                </div>
              </div>
              <p className="role-note">
                * Switching roles will refresh the page and update your sidebar menu immediately.
              </p>
            </div>

            <div className="form-footer">
              <button type="submit" className="pro-save-btn">
                <FiSave /> Save Changes
              </button>
            </div>

          </form>
        </main>

      </div>
    </div>
  );
}

export default Profile;