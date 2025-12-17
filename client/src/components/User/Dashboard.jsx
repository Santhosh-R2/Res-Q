import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { FiArrowUp, FiArrowDown, FiAlertCircle, FiActivity, FiUsers, FiBox } from "react-icons/fi";

// CSS
import '../styles/Dashboard.css';

// --- DUMMY DATA ---
const activityData = [
  { name: 'Mon', sos: 12, rescues: 8 },
  { name: 'Tue', sos: 19, rescues: 15 },
  { name: 'Wed', sos: 15, rescues: 12 },
  { name: 'Thu', sos: 25, rescues: 20 },
  { name: 'Fri', sos: 32, rescues: 28 },
  { name: 'Sat', sos: 20, rescues: 18 },
  { name: 'Sun', sos: 10, rescues: 9 },
];

const incidentData = [
  { name: 'Floods', value: 400 },
  { name: 'Fire', value: 300 },
  { name: 'Medical', value: 300 },
  { name: 'Earthquake', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  return (
    <div className="dashboard-container">
      
      {/* --- HEADER --- */}
      <header className="dash-header">
        <div>
          <h1>Mission Control</h1>
          <p>Real-time situation overview & analytics.</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>

      {/* --- STAT CARDS ROW --- */}
      <div className="stats-grid">
        <StatCard 
          title="Active SOS" 
          value="42" 
          icon={<FiAlertCircle />} 
          trend="+12%" 
          isPositive={false} // Red trend because more SOS is bad
        />
        <StatCard 
          title="Lives Saved" 
          value="1,204" 
          icon={<FiActivity />} 
          trend="+5%" 
          isPositive={true} 
        />
        <StatCard 
          title="Volunteers Active" 
          value="350" 
          icon={<FiUsers />} 
          trend="+18%" 
          isPositive={true} 
        />
        <StatCard 
          title="Supplies Delivered" 
          value="850 kg" 
          icon={<FiBox />} 
          trend="+2%" 
          isPositive={true} 
        />
      </div>

      {/* --- CHARTS ROW --- */}
      <div className="charts-grid">
        
        {/* Main Activity Chart */}
        <div className="chart-card main-chart">
          <h3>Rescue Operations vs SOS Signals</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d32f2f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRescue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="sos" stroke="#d32f2f" fillOpacity={1} fill="url(#colorSos)" />
                <Area type="monotone" dataKey="rescues" stroke="#2e7d32" fillOpacity={1} fill="url(#colorRescue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart-card pie-chart-container">
          <h3>Incident Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incidentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="custom-legend">
              {incidentData.map((entry, index) => (
                <div key={index} className="legend-item">
                  <div className="dot" style={{ backgroundColor: COLORS[index] }}></div>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- RECENT ALERTS --- */}
      <div className="recent-section">
        <h3>Recent Critical Alerts</h3>
        <div className="alerts-list">
          <AlertItem type="critical" message="Flood Warning detected in Zone A. Evacuation in progress." time="10 mins ago" />
          <AlertItem type="warning" message="Medical supplies running low in Shelter B." time="45 mins ago" />
          <AlertItem type="success" message="Rescue Team Alpha successfully reached Location X." time="2 hours ago" />
        </div>
      </div>

    </div>
  );
}

// --- HELPER COMPONENTS ---

const StatCard = ({ title, value, icon, trend, isPositive }) => (
  <div className="stat-card">
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-info">
      <h4>{title}</h4>
      <h2>{value}</h2>
      <span className={`trend ${isPositive ? 'pos' : 'neg'}`}>
        {isPositive ? <FiArrowUp /> : <FiArrowDown />} {trend}
      </span>
    </div>
  </div>
);

const AlertItem = ({ type, message, time }) => (
  <div className={`alert-item ${type}`}>
    <div className="alert-content">
      <span className="alert-dot"></span>
      <p>{message}</p>
    </div>
    <span className="alert-time">{time}</span>
  </div>
);

export default Dashboard;