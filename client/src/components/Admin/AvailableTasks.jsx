import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/baseUrl';
import { toast } from 'react-toastify';
import { 
  FiUserPlus, FiMapPin, FiClock, FiCheckCircle, FiAlertCircle 
} from "react-icons/fi";

import '../styles/AvailableTasks.css';

function AvailableTasks() {
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      console.error(error);
      toast.error("Failed to load operations data");
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

  if (loading) return <div className="available-tasks-loader"><div className="available-tasks-spinner"></div></div>;

  return (
    <div className="available-tasks-wrapper">
      
      <header className="available-tasks-header">
        <div>
            <h1>Dispatch Command</h1>
            <p>Assign pending emergency requests to ground units.</p>
        </div>
        <div className="available-tasks-count-badge">
            <FiAlertCircle /> {tasks.length} Pending
        </div>
      </header>

      <div className="available-tasks-grid">
        {tasks.length === 0 ? (
          <div className="available-tasks-empty">
            <FiCheckCircle />
            <h3>All Systems Clear</h3>
            <p>No pending unassigned tasks.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="available-tasks-card">
              <div className="available-tasks-card-header">
                <span className={`available-tasks-badge available-tasks-${task.type.toLowerCase()}`}>
                  {task.type}
                </span>
                <span className="available-tasks-time">
                  <FiClock /> {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              
              <div className="available-tasks-body">
                <h4>{task.description || "Emergency Request"}</h4>
                <p className="available-tasks-loc">
                  <FiMapPin /> {task.location.coordinates[1].toFixed(4)}, {task.location.coordinates[0].toFixed(4)}
                </p>
                <div className="available-tasks-user">
                  Req by: <strong>{task.userId?.fullName || "Anonymous"}</strong>
                </div>
              </div>

              <div className="available-tasks-footer">
                <button className="available-tasks-btn-assign" onClick={() => openAssignModal(task)}>
                  <FiUserPlus /> Assign Unit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && selectedTask && (
        <div className="available-tasks-modal-overlay">
          <div className="available-tasks-modal-box">
            <h3>Deploy Unit</h3>
            <p>Assigning to Task <strong>#{selectedTask._id.slice(-6).toUpperCase()}</strong></p>
            
            <div className="available-tasks-vol-select-group">
              <label>Select Available Volunteer</label>
              <select 
                value={selectedVolunteer} 
                onChange={(e) => setSelectedVolunteer(e.target.value)}
                className="available-tasks-vol-select"
              >
                <option value="">-- Choose Personnel --</option>
                
                {volunteers
                  .filter(vol => vol._id !== selectedTask.userId?._id)
                  .map(vol => (
                    <option key={vol._id} value={vol._id}>
                      {vol.fullName} ({vol.phone})
                    </option>
                  ))
                }
              </select>

              {volunteers.filter(vol => vol._id !== selectedTask.userId?._id).length === 0 && (
                 <div className="available-tasks-empty-msg" style={{color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: 600}}>
                    ⚠️ No eligible volunteers found (Requestor cannot be assigned).
                 </div>
              )}
            </div>

            <div className="available-tasks-modal-actions">
              <button className="available-tasks-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                className="available-tasks-btn-confirm" 
                onClick={handleAssign}
                disabled={!selectedVolunteer} 
              >
                Confirm Deployment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AvailableTasks;