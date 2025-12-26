import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { 
  FiSearch, FiTrash2, FiEdit2, FiCheck, FiX, FiMapPin, FiExternalLink 
} from "react-icons/fi";

import '../styles/UserDatabase.css';

function UserDatabase() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axiosInstance.get('/auth/users', config);
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load user database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(`/auth/users/${id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User Role Updated");
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      toast.error("Update Failed");
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = user.fullName || "";
    const email = user.email || "";
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const colors = { admin: 'purple', volunteer: 'blue', donor: 'green', victim: 'orange' };
    return (
      <span className={`User-database-badge User-database-badge-${colors[role] || 'gray'}`}>
        {role?.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="User-database-loader"><div className="User-database-spinner"></div></div>;

  return (
    <div className="User-database-wrapper">
      <header className="User-database-header">
        <div>
          <h1>User Management</h1>
          <p>Database of <strong>{users.length}</strong> registered accounts.</p>
        </div>
        
        <div className="User-database-controls">
          <div className="User-database-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="User-database-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="victim">Victims</option>
            <option value="volunteer">Volunteers</option>
            <option value="donor">Donors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </header>

      <div className="User-database-table-container">
        <table className="User-database-table">
          <thead>
            <tr>
              <th>User Details</th>
              <th>Role</th>
              <th>Contact Info</th>
              <th>Live Location</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="6" className="User-database-empty">No users found matching your criteria.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="User-database-user-cell">
                      <div className="User-database-user-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="User-database-name">{user.fullName}</div>
                        <div className="User-database-user-id">ID: {user._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {editingId === user._id ? (
                      <select 
                        className="User-database-role-edit-select"
                        value={newRole} 
                        onChange={(e) => setNewRole(e.target.value)}
                      >
                        <option value="victim">Victim</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="donor">Donor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      getRoleBadge(user.role)
                    )}
                  </td>

                  <td>
                    <div className="User-database-contact-cell">
                      <span className="email">{user.email}</span>
                      <span className="phone">{user.phone}</span>
                    </div>
                  </td>

                  <td>
                    {user.location && user.location.coordinates ? (
                      <a 
                        href={`https://www.google.com/maps?q=${user.location.coordinates[1]},${user.location.coordinates[0]}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="User-database-location-btn"
                      >
                        <FiMapPin /> Map <FiExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="no-location">N/A</span>
                    )}
                  </td>

                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                  <td>
                    <div className="User-database-action-buttons">
                      {editingId === user._id ? (
                        <>
                          <button className="User-database-btn-save" onClick={() => handleUpdate(user._id)}><FiCheck /></button>
                          <button className="User-database-btn-cancel" onClick={() => setEditingId(null)}><FiX /></button>
                        </>
                      ) : (
                        <button className="User-database-btn-edit" onClick={() => { setEditingId(user._id); setNewRole(user.role); }}>
                          <FiEdit2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserDatabase;