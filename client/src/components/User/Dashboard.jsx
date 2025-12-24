import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  FiArrowUp, FiArrowDown, FiAlertCircle, FiActivity, FiUsers, FiBox, FiShield, FiHeart, FiMap, FiTruck, FiCheckCircle
} from "react-icons/fi";
import { BiRadar } from "react-icons/bi";
import { Link } from 'react-router-dom';
import axiosInstance from '../api/baseUrl'; 
import { toast } from 'react-toastify';

import '../styles/Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const [role, setRole] = useState('victim');
  const [userName, setUserName] = useState('User');
  const [userId, setUserId] = useState(null);
  
  const [stats, setStats] = useState({
    totalSOS: 0, activeSOS: 0, resolvedSOS: 0, totalResources: 0, myMissions: 0, myDonations: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. INITIALIZE USER ---
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (user) {
        setRole(user.role || 'victim');
        setUserName(user.fullName || 'User');
        setUserId(user._id);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, role]);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (role === 'admin') {
        const [sosRes, resRes, analyticsRes] = await Promise.all([
          axiosInstance.get('/sos', config),
          axiosInstance.get('/resources', config),
          axiosInstance.get('/sos/analytics', config) 
        ]);
        
        processAdminData(analyticsRes.data, resRes.data);

      } else if (role === 'volunteer') {
        const [allSos, myHistory] = await Promise.all([
          axiosInstance.get('/sos', config),
          axiosInstance.get('/sos/history', config)
        ]);
        processVolunteerData(allSos.data, myHistory.data, userId);

      } else if (role === 'donor') {
        const res = await axiosInstance.get('/resources/donations', config);
        processDonorData(res.data);

      } else {
        const res = await axiosInstance.get('/sos/my', config);
        processVictimData(res.data);
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const processAdminData = (allSosList, resList) => {
    const active = allSosList.filter(s => s.status !== 'resolved' && s.status !== 'cancelled').length;
    const resolved = allSosList.filter(s => s.status === 'resolved').length;
    
    setStats({
      totalSOS: allSosList.length,
      activeSOS: active,
      resolvedSOS: resolved,
      totalResources: resList.length
    });

    setChartData(processChartTimeline(allSosList));
    const types = {};
    allSosList.forEach(s => { types[s.type] = (types[s.type] || 0) + 1; });
    setPieData(Object.keys(types).map(key => ({ name: key, value: types[key] })));
  };

  const processVolunteerData = (allSos, history, myId) => {
    const pending = allSos.filter(s => 
      s.status === 'pending' && 
      !s.assignedVolunteer &&
      (s.userId?._id || s.userId) !== myId
    ).length;

    const myResolved = history.filter(s => s.status === 'resolved').length;
    
    const myActive = history.length - myResolved;

    setStats({ 
      myMissions: myActive, 
      resolvedSOS: myResolved, 
      activeSOS: pending 
    });

    const othersActivity = allSos.filter(s => (s.userId?._id || s.userId) !== myId);
    setRecentActivity(othersActivity.slice(0, 3));
  };

  const processDonorData = (donations) => {
    const delivered = donations.filter(d => d.status === 'delivered').length;
    setStats({ 
        myDonations: donations.length, 
        resolvedSOS: delivered, 
        activeSOS: donations.filter(d => d.status === 'fulfilled').length 
    });
  };

  const processVictimData = (myRequests) => {
    setRecentActivity(myRequests);
  };

  const processChartTimeline = (data) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      grouped[dayName] = { name: dayName, sos: 0, rescues: 0 };
    }

    data.forEach(item => {
      const d = new Date(item.createdAt);
      const dayName = days[d.getDay()];
      if (grouped[dayName]) {
        grouped[dayName].sos += 1;
        if (item.status === 'resolved') grouped[dayName].rescues += 1;
      }
    });
    return Object.values(grouped);
  };

  if (loading) return <div className="dash-loader"><div className="dash-spinner"></div></div>;

  return (
    <div className="dash-wrapper">
      
      <header className="dash-header">
        <div className="dash-welcome">
          <h1>Welcome, {userName.split(' ')[0]}</h1>
          <span className="dash-role-badge">{role.toUpperCase()}</span>
        </div>
        <div className="dash-date-pill">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </header>

      {role === 'admin' && <AdminDashboard stats={stats} chartData={chartData} pieData={pieData} />}
      {role === 'volunteer' && <VolunteerDashboard stats={stats} recent={recentActivity} />}
      {role === 'donor' && <DonorDashboard stats={stats} />}
      {role === 'victim' && <VictimDashboard recent={recentActivity} />}

    </div>
  );
}

const AdminDashboard = ({ stats, chartData, pieData }) => (
  <>
    <div className="dash-stats-grid">
      <StatCard title="Total Incidents" value={stats.totalSOS} icon={<BiRadar />} trend="All Time" isPositive={true} />
      <StatCard title="Active Alerts" value={stats.activeSOS} icon={<FiAlertCircle />} trend="Live" isPositive={false} />
      <StatCard title="Resolved" value={stats.resolvedSOS} icon={<FiCheckCircle />} trend="Completed" isPositive={true} />
      <StatCard title="Resource Pool" value={stats.totalResources} icon={<FiBox />} trend="Available" isPositive={true} />
    </div>

    <div className="dash-charts-grid">
      <div className="dash-chart-card main">
        <h3>Incident Volume vs Resolutions (7 Days)</h3>
        <div className="dash-chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                <linearGradient id="colorRescue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip contentStyle={{backgroundColor:'#fff', borderRadius:'10px', border:'1px solid #e2e8f0'}}/>
              <Area type="monotone" dataKey="sos" stroke="#ef4444" fillOpacity={1} fill="url(#colorSos)" />
              <Area type="monotone" dataKey="rescues" stroke="#10b981" fillOpacity={1} fill="url(#colorRescue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dash-chart-card pie">
        <h3>Incident Types</h3>
        <div className="dash-chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="dash-chart-legend">
              {pieData.map((entry, index) => (
                <div key={index} className="dash-legend-item">
                  <span className="dash-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

const VolunteerDashboard = ({ stats, recent }) => (
  <>
    <div className="dash-stats-grid">
      <StatCard title="My Active Tasks" value={stats.myMissions} icon={<FiActivity />} trend="Ongoing" isPositive={true} />
      <StatCard title="Missions Solved" value={stats.resolvedSOS} icon={<FiCheckCircle />} trend="Total" isPositive={true} />
      <StatCard title="Pending Nearby" value={stats.activeSOS} icon={<FiMap />} trend="Needs Help" isPositive={false} />
    </div>

    <div className="dash-actions-row">
      <Link to="/available-tasks" className="dash-action-card primary">
        <div className="dash-ac-icon"><BiRadar /></div>
        <div className="dash-ac-text"><h4>Find Missions</h4><p>Scan for SOS signals near you.</p></div>
      </Link>
      <Link to="/logistics" className="dash-action-card secondary">
        <div className="dash-ac-icon"><FiTruck /></div>
        <div className="dash-ac-text"><h4>Logistics</h4><p>Manage pickup and delivery tasks.</p></div>
      </Link>
    </div>

    <div className="dash-recent-section">
      <h3>Recent Network Alerts</h3>
      <div className="dash-alert-list">
        {recent.map((alert) => (
           <AlertItem key={alert._id} type="critical" message={`${alert.type} Alert reported.`} time={new Date(alert.createdAt).toLocaleTimeString()} />
        ))}
        {recent.length === 0 && <p className="dash-no-data">No recent alerts.</p>}
      </div>
    </div>
  </>
);

const DonorDashboard = ({ stats }) => (
  <>
    <div className="dash-stats-grid">
      <StatCard title="Items Pledged" value={stats.myDonations} icon={<FiHeart />} trend="Total" isPositive={true} />
      <StatCard title="Verified Deliveries" value={stats.resolvedSOS} icon={<FiUsers />} trend="Impact" isPositive={true} />
      <StatCard title="Pending Pickups" value={stats.activeSOS} icon={<FiTruck />} trend="Waiting" isPositive={false} />
    </div>

    <div className="dash-actions-row">
      <Link to="/donate" className="dash-action-card primary">
        <div className="dash-ac-icon"><FiBox /></div>
        <div className="dash-ac-text"><h4>Donate Supplies</h4><p>Browse current needs and pledge support.</p></div>
      </Link>
      <Link to="/track-donations" className="dash-action-card secondary">
        <div className="dash-ac-icon"><FiActivity /></div>
        <div className="dash-ac-text"><h4>Track Status</h4><p>See where your donations are going.</p></div>
      </Link>
    </div>
  </>
);

const VictimDashboard = ({ recent }) => (
  <>
    <div className="dash-hero-alert">
      <div className="dash-hero-icon"><BiRadar /></div>
      <div className="dash-hero-text">
        <h2>Emergency Mode Active</h2>
        <p>If you are in danger, use the SOS button immediately. Your GPS will be tracked.</p>
      </div>
      <Link to="/sos" className="dash-hero-btn">SOS</Link>
    </div>

    <div className="dash-actions-row">
      <Link to="/my-requests" className="dash-action-card secondary">
        <div className="dash-ac-icon"><FiActivity /></div>
        <div className="dash-ac-text"><h4>My Signals</h4><p>Check status of your help requests.</p></div>
      </Link>
      <Link to="/safety-tips" className="dash-action-card secondary">
        <div className="dash-ac-icon"><FiShield /></div>
        <div className="dash-ac-text"><h4>Safety Guide</h4><p>Protocols for Flood, Fire, and Quake.</p></div>
      </Link>
    </div>
    
    <div className="dash-recent-section">
      <h3>Your Recent Activity</h3>
      <div className="dash-alert-list">
        {recent.length > 0 ? recent.slice(0,3).map(r => (
            <AlertItem key={r._id} type={r.status === 'resolved' ? 'success' : 'warning'} message={`Your ${r.type} alert is ${r.status}.`} time={new Date(r.createdAt).toLocaleTimeString()} />
        )) : <p className="dash-no-data">No recent activity.</p>}
      </div>
    </div>
  </>
);

const StatCard = ({ title, value, icon, trend, isPositive }) => (
  <div className="dash-stat-card">
    <div className="dash-stat-icon">{icon}</div>
    <div className="dash-stat-info">
      <h4>{title}</h4>
      <h2>{value}</h2>
      <span className={`dash-trend ${isPositive ? 'pos' : 'neg'}`}>
        {isPositive ? <FiArrowUp /> : <FiArrowDown />} {trend}
      </span>
    </div>
  </div>
);

const AlertItem = ({ type, message, time }) => (
  <div className={`dash-alert-item ${type}`}>
    <div className="dash-alert-content">
      <span className="dash-alert-dot"></span>
      <p>{message}</p>
    </div>
    <span className="dash-alert-time">{time}</span>
  </div>
);

export default Dashboard;