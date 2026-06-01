import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', role: 'admin', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = authAPI.login(form.email, form.password, form.role);
      login({ email: result.email, role: result.role, name: result.name, patient_id: result.patient_id, doctor_id: result.doctor_id }, result.token);
      const redirectMap = { admin: '/dashboard', doctor: '/doctor-dashboard', patient: '/patient-profile', pharmacist: '/pharmacy' };
      navigate(redirectMap[result.role] || '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleRegisterNav = (e) => {
    const val = e.target.value;
    if (val === 'doctor') navigate('/register/doctor');
    else if (val === 'patient') navigate('/register/patient');
    e.target.value = '';
  };

  const fillDemo = (role) => {
    const creds = {
      admin:      { email: 'admin@hospital.com',  password: 'admin123'  },
      pharmacist: { email: 'pharma@hospital.com', password: 'pharma123' },
    };
    if (creds[role]) setForm(f => ({ ...f, ...creds[role], role }));
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-logo">🏥</div>
        <h1>MediCare HMS</h1>
        <p>Complete Hospital Management System — streamlining care from appointment to invoice.</p>
        <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Login</p>
          {[
            { role: 'admin',      label: 'Admin',      email: 'admin@hospital.com',  pwd: 'admin123'  },
            { role: 'pharmacist', label: 'Pharmacist', email: 'pharma@hospital.com', pwd: 'pharma123' },
          ].map(c => (
            <button key={c.role} onClick={() => fillDemo(c.role)}
              style={{ display: 'block', width: '100%', marginBottom: 8, background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 14px',
                color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '0.82rem' }}>
              <strong>{c.label}</strong> · {c.email} / {c.pwd}
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 8 }}>Doctors & Patients: register first →</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
          {error && (
            <div style={{ background: '#fde8e8', color: '#8b1a1a', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: '0.9rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div className="remember-row">
              <label className="remember-label">
                <input type="checkbox" checked={form.remember} onChange={e => setForm({...form, remember: e.target.checked})} />
                Remember me
              </label>
              <a href="/forgot-password" className="link">Forgot password?</a>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>New here? Register as:</p>
            <select onChange={handleRegisterNav} defaultValue=""
              style={{ padding: '10px 20px', borderRadius: 8, border: '2px solid var(--border)', fontFamily: 'DM Sans', cursor: 'pointer', width: '100%' }}>
              <option value="" disabled>Select role to register</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
