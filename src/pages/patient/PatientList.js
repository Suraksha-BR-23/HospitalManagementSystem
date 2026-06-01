import React, { useEffect, useState } from 'react';
import { patientsAPI } from '../../utils/api';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { setPatients(patientsAPI.list()); }, []);

  const filtered = patients.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const viewProfile = (id) => {
    try { setSelected(patientsAPI.get(id)); } catch {}
  };

  return (
    <div>
      <div className="page-header"><h1>Patients</h1><p>All registered patients</p></div>
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍  Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Blood Group</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--text-muted)', padding: 32 }}>No patients found</td></tr>
                : filtered.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.full_name}</strong><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.email}</div></td>
                    <td>{p.age}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.gender}</td>
                    <td><span className="badge badge-danger">{p.blood_group}</span></td>
                    <td>{p.phone_number}</td>
                    <td><button className="btn btn-outline btn-sm" onClick={() => viewProfile(p.id)}>View Profile</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <h3>Patient Profile</h3>
            <div className="form-row">
              <div><label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Name</label><p style={{ marginTop: 4 }}>{selected.full_name}</p></div>
              <div><label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Age / Gender</label><p style={{ marginTop: 4 }}>{selected.age} / {selected.gender}</p></div>
            </div>
            <div className="form-row" style={{ marginTop: 16 }}>
              <div><label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Blood Group</label><p style={{ marginTop: 4 }}><span className="badge badge-danger">{selected.blood_group}</span></p></div>
              <div><label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Phone</label><p style={{ marginTop: 4 }}>{selected.phone_number}</p></div>
            </div>
            <div style={{ marginTop: 16 }}><label style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Medical History</label><p style={{ marginTop: 4, color: 'var(--text-muted)' }}>{selected.medical_history || 'None recorded'}</p></div>
            <div style={{ marginTop: 20 }}><h4 style={{ marginBottom: 10, color: 'var(--primary)' }}>Appointment History</h4>
              {selected.appointment_history.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No appointments</p>
                : selected.appointment_history.map(a => <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{a.date} — {a.time_slot} — <span className="badge badge-info">{a.status}</span></div>)}
            </div>
            <div className="modal-actions"><button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
