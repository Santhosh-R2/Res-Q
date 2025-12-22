import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { FiUserPlus, FiMapPin, FiClock, FiShield } from "react-icons/fi";

import '../styles/AvailableTasks.css';

function AvailableTasks() {
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [taskRes, volRes] = await Promise.all([
        axiosInstance.get('/sos', config), 
        axiosInstance.get('/sos/volunteers-list', config)
      ]);

      const unassigned = taskRes.data.filter(t => !t.assignedVolunteer && t.status === 'pending');
      setTasks(unassigned);
      setVolunteers(volRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAssignModal = (task) => {
    setSelectedTask(task);
    setSelectedVolunteer(''); 
    setShowModal(true);
  };

  const handleAssign = async () => {
    if(!selectedVolunteer) return toast.warn("Select a volunteer");

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put('/sos/assign', {
        sosId: selectedTask._id,
        volunteerId: selectedVolunteer
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success("Task Assigned Successfully!");
      setShowModal(false);
      fetchData(); 
    } catch (error) {
      toast.error("Assignment Failed");
    }
  };

  if (loading) return <div className="task-loader">Loading Operations...</div>;

  return (
    <div className="task-wrapper">
      
      <header className="task-header">
        <h1>Dispatch Command</h1>
        <p>Assign pending emergency requests to ground units.</p>
      </header>

      <div className="task-grid">
        {tasks.length === 0 ? (
          <div className="task-empty">All systems clear. No pending unassigned tasks.</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-card-header">
                <span className={`task-badge ${task.type.toLowerCase()}`}>{task.type}</span>
                <span className="task-time"><FiClock /> {new Date(task.createdAt).toLocaleTimeString()}</span>
              </div>
              
              <div className="task-body">
                <h4>{task.description || "Emergency Request"}</h4>
                <p className="task-loc">
                  <FiMapPin /> Lat: {task.location.coordinates[1].toFixed(4)}, Lng: {task.location.coordinates[0].toFixed(4)}
                </p>
                <div className="task-user">
                  Req by: <strong>{task.userId?.fullName || "Anonymous"}</strong>
                </div>
              </div>

              <div className="task-footer">
                <button className="btn-assign" onClick={() => openAssignModal(task)}>
                  <FiUserPlus /> Assign Unit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Deploy Unit</h3>
            <p>Assigning to Task <strong>#{selectedTask._id.slice(-6)}</strong></p>
            
            <div className="vol-select-group">
              <label>Select Available Volunteer</label>
              <select 
                value={selectedVolunteer} 
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="vol-select"
              >
                <option value="">-- Choose Personnel --</option>
                {volunteers.map(vol => (
                  <option key={vol._id} value={vol._id}>
                    {vol.fullName} ({vol.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleAssign}>Confirm Deployment</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AvailableTasks;