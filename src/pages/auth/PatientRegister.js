import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

export default function PatientRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone_number: '', password: '', confirm_password: '',
    gender: 'male', date_of_birth: '', address: '', age: '', blood_group: 'A+',
    emergency_number: '', medical_history: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    if (!form.age || parseInt(form.age) <= 0) { setError('Please enter a valid age'); return; }
    setLoading(true); setError('');
    try {
      authAPI.registerPatient(form);
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
        <div className="auth-logo">🧑‍🤝‍🧑</div>
        <h1>Patient Portal</h1>
        <p>Create your account to access appointments, reports, and health records.</p>
      </div>
      <div className="auth-form-panel" style={{ overflow: 'auto' }}>
        <div className="auth-form-box" style={{ maxWidth: 500 }}>
          <h2>Register as Patient</h2>
          <p>Fill in your details to get started</p>
          {error && <div style={{ background: '#fde8e8', color: '#8b1a1a', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}
          {success && <div style={{ background: '#d4f7e0', color: '#155724', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Full Name</label><input {...f('full_name')} placeholder="John Doe" required /></div>
              <div className="form-group"><label>Age</label><input type="number" min="1" max="150" {...f('age')} placeholder="25" required /></div>
            </div>
            <div className="form-group"><label>Email</label><input type="email" {...f('email')} placeholder="you@email.com" required /></div>
            <div className="form-row">
              <div className="form-group"><label>Phone Number</label><input {...f('phone_number')} placeholder="+91 9876543210" required /></div>
              <div className="form-group">
                <label>Blood Group</label>
                <select {...f('blood_group')}>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Gender</label>
              <div className="radio-group">
                {['male','female','other'].map(g => (
                  <label key={g} className="radio-label">
                    <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={e => setForm({...form, gender: e.target.value})} />
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group"><label>Date of Birth</label><input type="date" {...f('date_of_birth')} /></div>
            <div className="form-group"><label>Address</label><textarea {...f('address')} placeholder="Full address..." required /></div>
            <div className="form-group"><label>Emergency Contact</label><input {...f('emergency_number')} placeholder="+91 9876543210" required /></div>
            <div className="form-group"><label>Medical History (optional)</label><textarea {...f('medical_history')} placeholder="Any existing conditions, allergies..." /></div>
            <div className="form-row">
              <div className="form-group"><label>Password</label><input type="password" {...f('password')} placeholder="••••••••" required /></div>
              <div className="form-group"><label>Confirm Password</label><input type="password" {...f('confirm_password')} placeholder="••••••••" required /></div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center mt-16">Already have an account? <span className="link" onClick={() => navigate('/login')}>Sign in</span></p>
        </div>
      </div>
    </div>
  );
}
