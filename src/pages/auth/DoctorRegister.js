import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

const SPECIALIZATIONS = ['Cardiology','Neurology','Gynecology','Pediatrics','Dermatology','Orthopedics','Ophthalmology','General Medicine'];
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone_number: '', specialization: 'Cardiology',
    qualification: '', experience: '', consultation_fee: '',
    available_days: [], available_timing: '', password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      available_days: f.available_days.includes(day)
        ? f.available_days.filter(d => d !== day)
        : [...f.available_days, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.available_days.length === 0) { setError('Select at least one available day'); return; }
    setLoading(true); setError('');
    try {
      authAPI.registerDoctor(form);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm({...form, [key]: e.target.value}) });

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-logo">👨‍⚕️</div>
        <h1>Doctor Portal</h1>
        <p>Register as a healthcare professional and start managing your patients.</p>
      </div>
      <div className="auth-form-panel" style={{ overflow: 'auto' }}>
        <div className="auth-form-box" style={{ maxWidth: 500 }}>
          <h2>Doctor Registration</h2>
          <p>Complete your professional profile</p>
          {error && <div style={{ background: '#fde8e8', color: '#8b1a1a', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}
          {success && <div style={{ background: '#d4f7e0', color: '#155724', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input {...f('full_name')} placeholder="Dr. Jane Smith" required /></div>
              <div className="form-group"><label>Phone Number</label><input {...f('phone_number')} placeholder="+91 9876543210" required /></div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" {...f('email')} placeholder="doctor@hospital.com" required /></div>
            <div className="form-group">
              <label>Specialization</label>
              <select {...f('specialization')}>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Qualification</label><input {...f('qualification')} placeholder="MBBS, MD" required /></div>
              <div className="form-group"><label>Experience (years)</label><input type="number" min="0" {...f('experience')} placeholder="5" required /></div>
            </div>
            <div className="form-group"><label>Consultation Fee (₹)</label><input type="number" min="0" {...f('consultation_fee')} placeholder="500" required /></div>
            <div className="form-group">
              <label>Available Days</label>
              <div className="checkbox-group">
                {DAYS.map(day => (
                  <label key={day} className="checkbox-label">
                    <input type="checkbox" checked={form.available_days.includes(day)} onChange={() => toggleDay(day)} />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label>Available Timing</label><input {...f('available_timing')} placeholder="9:00 AM - 5:00 PM" required /></div>
            <div className="form-group"><label>Password</label><input type="password" {...f('password')} placeholder="••••••••" required /></div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center mt-16">Already registered? <span className="link" onClick={() => navigate('/login')}>Sign in</span></p>
        </div>
      </div>
    </div>
  );
}
