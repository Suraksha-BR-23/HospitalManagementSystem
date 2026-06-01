import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorsAPI, appointmentsAPI } from '../../utils/api';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctor_id: '', specialization: '', date: '', time_slot: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { setDoctors(doctorsAPI.list()); }, []);

  const handleDoctorChange = (e) => {
    const id = e.target.value;
    const doc = doctors.find(d => d.id === parseInt(id));
    setForm(f => ({ ...f, doctor_id: id, specialization: doc?.specialization || '', time_slot: '' }));
  };

  useEffect(() => {
    if (form.doctor_id && form.date) {
      setSlots(appointmentsAPI.slots(form.doctor_id, form.date));
    } else {
      setSlots([]);
    }
  }, [form.doctor_id, form.date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.patient_id) { setError('No patient profile found. Please register as a patient first.'); return; }
    try {
      appointmentsAPI.book({ ...form, patient_id: user.patient_id });
      setSuccess('Appointment booked successfully!');
      setTimeout(() => navigate('/my-appointments'), 1500);
    } catch (err) {
      setError(err.message || 'Booking failed');
    }
  };

  return (
    <div>
      <div className="page-header"><h1>Book Appointment</h1><p>Schedule a visit with your preferred doctor</p></div>
      <div className="card" style={{ maxWidth: 600 }}>
        {success && <div style={{ background: '#d4f7e0', color: '#155724', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{success}</div>}
        {error && <div style={{ background: '#fde8e8', color: '#8b1a1a', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}
        {doctors.length === 0 && (
          <div style={{ background: '#fff8e1', color: '#856404', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
            No doctors registered yet. Ask your admin to add doctors first.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Doctor</label>
            <select value={form.doctor_id} onChange={handleDoctorChange} required>
              <option value="">-- Choose a doctor --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} — ₹{d.consultation_fee}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input value={form.specialization} readOnly placeholder="Auto-filled" style={{ background: '#f0f4f8' }} />
          </div>
          <div className="form-group">
            <label>Patient Name</label>
            <input value={user?.name || ''} readOnly style={{ background: '#f0f4f8' }} />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(f => ({ ...f, date: e.target.value, time_slot: '' }))} required />
          </div>
          <div className="form-group">
            <label>Available Slot</label>
            <select value={form.time_slot} onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))} required>
              <option value="">-- Select a slot --</option>
              {slots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={!form.time_slot}>
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
}
