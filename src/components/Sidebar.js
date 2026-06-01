import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navConfig = {
  admin: [
    { path: '/dashboard',       icon: '🏠', label: 'Dashboard' },
    { path: '/doctors',         icon: '👨‍⚕️', label: 'Doctors' },
    { path: '/patients',        icon: '🧑‍🤝‍🧑', label: 'Patients' },
    { path: '/appointments',    icon: '📅', label: 'Appointments' },
    { path: '/admissions',      icon: '🛏️', label: 'Admissions' },
    { path: '/prescriptions',   icon: '💊', label: 'Prescriptions' },
    { path: '/pharmacy',        icon: '🏪', label: 'Pharmacy' },
    { path: '/billing',         icon: '🧾', label: 'Billing' },
    { path: '/reports',         icon: '📊', label: 'Reports' },
  ],
  doctor: [
    { path: '/doctor-dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/appointments',     icon: '📅', label: 'Appointments' },
    { path: '/patients',         icon: '🧑‍🤝‍🧑', label: 'Patients' },
    { path: '/prescriptions',    icon: '💊', label: 'Prescriptions' },
    { path: '/admissions',       icon: '🛏️', label: 'Admissions' },
  ],
  patient: [
    { path: '/patient-profile',    icon: '👤', label: 'My Profile' },
    { path: '/book-appointment',   icon: '📅', label: 'Book Appointment' },
    { path: '/my-appointments',    icon: '🗓️', label: 'My Appointments' },
    { path: '/my-prescriptions',   icon: '💊', label: 'My Prescriptions' },
  ],
  pharmacist: [
    { path: '/pharmacy', icon: '🏪', label: 'Pharmacy' },
    { path: '/billing',  icon: '🧾', label: 'Billing' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = navConfig[user?.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>🏥</div>
        <h2>MediCare</h2>
        <span>Hospital Management</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <button key={link.path}
            className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => navigate(link.path)}>
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">{(user?.name || user?.email || 'U')[0].toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || user?.email}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }} title="Logout">⏏</button>
        </div>
      </div>
    </aside>
  );
}
