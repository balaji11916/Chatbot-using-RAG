import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Signup() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to chat with your PDFs</p>
        {error && <div className="error-box">{error}</div>}
        <label>Full Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        <button type="submit" className="btn-primary full" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        <p className="switch-text">Have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}