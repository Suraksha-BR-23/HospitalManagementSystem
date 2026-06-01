import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      authAPI.forgotPassword(email);
      setMessage('If this email exists in our system, a reset link has been sent.');
      setError('');
    } catch (err) {
      setError(err.message || 'Email not found');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-logo">🔒</div>
        <h1>MediCare HMS</h1>
        <p>Reset your password to regain access to your account.</p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-box">
          <h2>Forgot Password</h2>
          <p>Enter your email and we'll send you a reset link.</p>
          {message && <div style={{ background: '#d4f7e0', color: '#155724', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{message}</div>}
          {error && <div style={{ background: '#fde8e8', color: '#8b1a1a', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit">Send Reset Link</button>
          </form>
          <p className="text-center mt-16"><span className="link" onClick={() => navigate('/login')}>← Back to Login</span></p>
        </div>
      </div>
    </div>
  );
}
