import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../../utils/api';

const SPECS = ['All','Cardiology','Neurology','Gynecology','Pediatrics','Dermatology','Orthopedics','Ophthalmology','General Medicine'];

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('All');
  const [editDoctor, setEditDoctor] = useState(null);
  const navigate = useNavigate();

  const fetchDoctors = () => {
    setDoctors(doctorsAPI.list({ search, specialization: spec === 'All' ? '' : spec }));
  };

  useEffect(() => { fetchDoctors(); }, [search, spec]);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    doctorsAPI.delete(id); fetchDoctors();
  };

  const handleEditSave = () => {
    doctorsAPI.update(editDoctor.id, editDoctor);
    setEditDoctor(null); fetchDoctors();
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h1>Doctors</h1><p>Manage all registered doctors</p></div>
        <button className="btn btn-accent" onClick={() => navigate('/register/doctor')}>+ Add Doctor</button>
      </div>
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍  Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="search-input" style={{ flex: 'none', width: 180 }} value={spec} onChange={e => setSpec(e.target.value)}>
          {SPECS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Experience</th><th>Fee (₹)</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
              {doctors.length === 0
                ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--text-muted)', padding: 32 }}>No doctors found. <span className="link" onClick={() => navigate('/register/doctor')}>Add one →</span></td></tr>
                : doctors.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.full_name}</strong><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.email}</div></td>
                    <td><span className="badge badge-info">{d.specialization}</span></td>
                    <td>{d.experience} yrs</td>
                    <td>₹{d.consultation_fee}</td>
                    <td style={{ fontSize: '0.8rem' }}>{d.available_timing}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-outline btn-sm" onClick={() => setEditDoctor({...d})}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {editDoctor && (
        <div className="modal-overlay" onClick={() => setEditDoctor(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Doctor</h3>
            {['full_name','phone_number','qualification','available_timing'].map(key => (
              <div className="form-group" key={key}>
                <label>{key.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                <input value={editDoctor[key]} onChange={e => setEditDoctor({...editDoctor, [key]: e.target.value})} />
              </div>
            ))}
            <div className="form-row">
              <div className="form-group"><label>Experience (yrs)</label><input type="number" value={editDoctor.experience} onChange={e => setEditDoctor({...editDoctor, experience: e.target.value})} /></div>
              <div className="form-group"><label>Fee (₹)</label><input type="number" value={editDoctor.consultation_fee} onChange={e => setEditDoctor({...editDoctor, consultation_fee: e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditDoctor(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleEditSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
