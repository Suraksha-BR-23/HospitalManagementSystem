import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorsAPI } from '../../utils/api';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.doctor_id) {
      try { setData(doctorsAPI.dashboard(user.doctor_id)); } catch {}
    }
  }, [user]);

  if (!data) return <div className="page-header"><h1>Doctor Dashboard</h1><p>No profile linked to this account.</p></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name || 'Doctor'}</h1>
        <p>Your schedule at a glance</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-icon">📅</div><div className="stat-value">{data.total_appointments}</div><div className="stat-label">Total Appointments</div></div>
        <div className="stat-card" style={{ borderLeftColor: '#e63946' }}><div className="stat-icon">🧑‍🤝‍🧑</div><div className="stat-value">{data.patient_count}</div><div className="stat-label">Unique Patients</div></div>
        <div className="stat-card" style={{ borderLeftColor: '#2dc653' }}><div className="stat-icon">⏰</div><div className="stat-value">{data.upcoming_appointments.length}</div><div className="stat-label">Upcoming</div></div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>Upcoming Appointments</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {data.upcoming_appointments.length === 0
                ? <tr><td colSpan={4} className="text-center" style={{ color: 'var(--text-muted)', padding: 32 }}>No upcoming appointments</td></tr>
                : data.upcoming_appointments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>{a.date}</td>
                    <td>{a.time_slot}</td>
                    <td><span className="badge badge-info">{a.status}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
