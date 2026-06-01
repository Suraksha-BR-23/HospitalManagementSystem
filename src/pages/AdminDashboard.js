import React, { useEffect, useState } from 'react';
import { doctorsAPI, patientsAPI, appointmentsAPI, billingAPI, bedsAPI, admissionsAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ doctors:0, patients:0, appointments:0, revenue:0, beds:{total:0,available:0,occupied:0} });
  const [appointments, setAppointments] = useState([]);
  const [activeAdmissions, setActiveAdmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const docs  = doctorsAPI.list();
    const pats  = patientsAPI.list();
    const appts = appointmentsAPI.list();
    const bStats = bedsAPI.stats();
    const bStats2 = billingAPI.stats();
    setStats({ doctors: docs.length, patients: pats.length, appointments: appts.length, revenue: bStats2.total_revenue, beds: bStats });
    setAppointments(appts.slice(-6).reverse());
    setActiveAdmissions(admissionsAPI.list().filter(a => a.status === 'admitted').slice(0,5));
  }, []);

  const statusBadge = (s) => {
    const m = { scheduled:'badge-info', completed:'badge-success', cancelled:'badge-danger', admitted:'badge-warning', discharged:'badge-success' };
    return <span className={`badge ${m[s]||'badge-info'}`}>{s}</span>;
  };

  const statCards = [
    { icon:'👨‍⚕️', value: stats.doctors,      label:'Total Doctors',      color:'var(--accent)',   path:'/doctors' },
    { icon:'🧑‍🤝‍🧑', value: stats.patients,     label:'Total Patients',     color:'#e63946',        path:'/patients' },
    { icon:'📅', value: stats.appointments,   label:'Appointments',       color:'#2dc653',        path:'/appointments' },
    { icon:'🛏️', value: stats.beds.occupied,  label:'Beds Occupied',      color:'#f4a261',        path:'/admissions' },
    { icon:'🛏️', value: stats.beds.available, label:'Beds Available',     color:'#2dc653',        path:'/admissions' },
    { icon:'💰', value: `₹${stats.revenue.toLocaleString()}`, label:'Total Revenue', color:'var(--primary)', path:'/reports' },
  ];

  return (
    <div>
      <div className="page-header"><h1>Admin Dashboard</h1><p>Hospital operations at a glance</p></div>
      <div className="stat-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
        {statCards.map((c,i) => (
          <div key={i} className="stat-card" style={{ borderLeftColor: c.color, cursor:'pointer' }} onClick={() => navigate(c.path)}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div className="card">
          <h3 style={{ marginBottom:20, color:'var(--primary)' }}>Recent Appointments</h3>
          {appointments.length === 0 ? <p style={{color:'var(--text-muted)'}}>No appointments yet</p> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>{appointments.map(a => (
                  <tr key={a.id}><td><strong>{a.patient_name}</strong></td><td>{a.doctor_name}</td><td>{a.date}</td><td>{statusBadge(a.status)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ marginBottom:20, color:'var(--primary)' }}>Active Admissions</h3>
          {activeAdmissions.length === 0 ? <p style={{color:'var(--text-muted)'}}>No active admissions</p> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Bed</th><th>Ward</th><th>Since</th></tr></thead>
                <tbody>{activeAdmissions.map(a => (
                  <tr key={a.id}><td><strong>{a.patient_name}</strong></td><td>{a.bed_number}</td><td>{a.ward}</td><td>{a.admission_date}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
