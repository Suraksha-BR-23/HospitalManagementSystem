import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI, doctorsAPI } from '../../utils/api';

export default function AppointmentList() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time_slot: '' });
  const [slots, setSlots] = useState([]);

  const fetchAppointments = () => {
    const params = {};
    if (filterDate) params.date = filterDate;
    if (filterDoctor) params.doctor_id = filterDoctor;
    if (user?.patient_id && user.role === 'patient') params.patient_id = user.patient_id;
    if (user?.doctor_id && user.role === 'doctor') params.doctor_id = user.doctor_id;
    setAppointments(appointmentsAPI.list(params));
  };

  useEffect(() => { fetchAppointments(); setDoctors(doctorsAPI.list()); }, [filterDate, filterDoctor]);

  useEffect(() => {
    if (rescheduleModal && rescheduleForm.date) {
      setSlots(appointmentsAPI.slots(rescheduleModal.doctor_id, rescheduleForm.date));
    }
  }, [rescheduleModal, rescheduleForm.date]);

  const handleCancel = (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    appointmentsAPI.cancel(id); fetchAppointments();
  };

  const handleReschedule = () => {
    appointmentsAPI.reschedule(rescheduleModal.id, rescheduleForm);
    setRescheduleModal(null); fetchAppointments();
  };

  const statusBadge = (s) => {
    const map = { scheduled: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
    return <span className={`badge ${map[s] || 'badge-info'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header"><h1>Appointments</h1><p>All scheduled visits</p></div>
      <div className="filter-bar">
        <input type="date" className="search-input" style={{ flex: 'none', width: 180 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        {user?.role !== 'patient' && (
          <select className="search-input" style={{ flex: 'none', width: 220 }} value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
          </select>
        )}
        <button className="btn btn-outline" onClick={() => { setFilterDate(''); setFilterDoctor(''); }}>Clear</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.length === 0
                ? <tr><td colSpan={6} className="text-center" style={{ color: 'var(--text-muted)', padding: 32 }}>No appointments found</td></tr>
                : appointments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>{a.doctor_name}<div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.specialization}</div></td>
                    <td>{a.date}</td>
                    <td>{a.time_slot}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td>
                      {a.status === 'scheduled' && (
                        <div className="flex gap-8">
                          <button className="btn btn-warning btn-sm" onClick={() => { setRescheduleModal(a); setRescheduleForm({ date: '', time_slot: '' }); }}>Reschedule</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Reschedule Appointment</h3>
            <div className="form-group"><label>New Date</label>
              <input type="date" value={rescheduleForm.date} min={new Date().toISOString().split('T')[0]}
                onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value, time_slot: '' }))} /></div>
            <div className="form-group"><label>Available Slot</label>
              <select value={rescheduleForm.time_slot} onChange={e => setRescheduleForm(f => ({ ...f, time_slot: e.target.value }))}>
                <option value="">-- Select slot --</option>
                {slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setRescheduleModal(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleReschedule} disabled={!rescheduleForm.time_slot}>Confirm Reschedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
