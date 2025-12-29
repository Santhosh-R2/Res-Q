import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast, ToastContainer } from 'react-toastify';
import { 
  FiUser, FiMail, FiPhone, FiSave, FiShield, FiCheckCircle, FiRefreshCw 
} from "react-icons/fi";

import '../styles/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    const { name, value } = e.target;

    if (name === 'fullName') {
      const alphabetRegex = /^[a-zA-Z\s]*$/;
      if (!alphabetRegex.test(value)) return; 
    }

    if (name === 'phone') {
      const numberRegex = /^[0-9]*$/;
      if (!numberRegex.test(value) || value.length > 10) return; 
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    setFormData({ ...formData, role: newRole }); 

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put('/auth/profile', { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

      toast.success(`System Access Changed to: ${newRole.toUpperCase()}`);
      
      setTimeout(() => window.location.reload(), 1200);

    } catch (error) {
      toast.error("Failed to change role");
      setFormData({ ...formData, role: user.role }); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.fullName.trim().length < 3) {
      return toast.warn("Full Name must be at least 3 characters.");
    }

    if (formData.phone.length !== 10) {
      return toast.warn("Phone number must be exactly 10 digits.");
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axiosInstance.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('userInfo', JSON.stringify(res.data));
      setUser(res.data);
      toast.success("Profile Updated Successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <div className="pro-loader"><FiRefreshCw className="spin" /></div>;

  return (
    <div className="pro-profile-wrapper">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <div className="pro-profile-grid">
        
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
              <span className="label">Access Level</span>
              <span className="value">Verified</span>
            </div>
          </div>
        </aside>

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
                    placeholder="Enter alphabets only"
                    required
                  />
                </div>
                
                <div className="input-field">
                  <label><FiPhone /> Phone (10 Digits)</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="input-field disabled">
                <label><FiMail /> Email Address</label>
                <input type="email" value={formData.email} disabled />
                <span className="locked-badge">Primary Identity Locked</span>
              </div>
            </div>

            <div className="form-section role-section">
              <label className="section-label">System Access</label>
              <div className="role-selector-box">
                <div className="role-icon-box">
                  <FiShield />
                </div>
                <div className="role-select-wrapper">
                  <label>Selected Module</label>
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
                * Role changes modify your command permissions and menu items.
              </p>
            </div>

            <div className="form-footer">
              <button type="submit" className="pro-save-btn">
                <FiSave /> Update Profile
              </button>
            </div>

          </form>
        </main>

      </div>
    </div>
  );
}

export default Profile;