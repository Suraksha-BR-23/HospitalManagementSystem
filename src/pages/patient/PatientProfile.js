import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientsAPI } from '../../utils/api';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const fetchProfile = () => {
    if (user?.patient_id) {
      try { const p = patientsAPI.get(user.patient_id); setProfile(p); setForm(p); } catch {}
    }
  };

  useEffect(() => { fetchProfile(); }, [user]);

  const handleSave = () => {
    patientsAPI.update(user.patient_id, form);
    setEditing(false); fetchProfile();
  };

  if (!profile) return <div className="page-header"><h1>Profile</h1><p>No patient profile linked.</p></div>;

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h1>My Profile</h1><p>Your personal health record</p></div>
        <button className="btn btn-accent" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Profile'}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="card text-center">
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', color: 'white', fontFamily: 'DM Serif Display' }}>
            {profile.full_name?.[0] || '?'}
          </div>
          <h3 style={{ color: 'var(--primary)' }}>{profile.full_name}</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{profile.email}</p>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-danger">{profile.blood_group}</span>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{profile.gender}</span>
            <span className="badge badge-warning">{profile.age} yrs</span>
          </div>
        </div>
        <div className="card">
          {editing ? (
            <>
              <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>Edit Information</h3>
              {[['full_name','Full Name'],['phone_number','Phone'],['address','Address'],['emergency_number','Emergency Contact'],['medical_history','Medical History']].map(([k,l]) => (
                <div className="form-group" key={k}>
                  <label>{l}</label>
                  {k === 'address' || k === 'medical_history'
                    ? <textarea value={form[k] || ''} onChange={e => setForm({...form, [k]: e.target.value})} />
                    : <input value={form[k] || ''} onChange={e => setForm({...form, [k]: e.target.value})} />}
                </div>
              ))}
              <button className="btn btn-accent" onClick={handleSave}>Save Changes</button>
            </>
          ) : (
            <>
              <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>Personal Information</h3>
              {[['Address', profile.address],['Phone', profile.phone_number],['Emergency Contact', profile.emergency_number],['Medical History', profile.medical_history || 'None recorded']].map(([l, v]) => (
                <div key={l} style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{l}</label>
                  <p style={{ marginTop: 4 }}>{v}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="card mt-24">
        <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>Appointment History</h3>
        {profile.appointment_history.length === 0
          ? <p style={{ color: 'var(--text-muted)' }}>No appointments yet</p>
          : <div className="table-wrapper"><table>
              <thead><tr><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>{profile.appointment_history.map(a => (
                <tr key={a.id}><td>{a.date}</td><td>{a.time_slot}</td><td><span className={`badge ${a.status === 'scheduled' ? 'badge-info' : a.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>{a.status}</span></td></tr>
              ))}</tbody>
            </table></div>}
      </div>
      <div className="card mt-24">
        <h3 style={{ marginBottom: 20, color: 'var(--primary)' }}>Billing History</h3>
        {profile.billing_history.length === 0
          ? <p style={{ color: 'var(--text-muted)' }}>No bills yet</p>
          : <div className="table-wrapper"><table>
              <thead><tr><th>Bill ID</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{profile.billing_history.map(b => (
                <tr key={b.bill_id}><td><code>{b.bill_id}</code></td><td>₹{b.total}</td><td><span className={`badge ${b.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{b.status}</span></td></tr>
              ))}</tbody>
            </table></div>}
      </div>
    </div>
  );
}
