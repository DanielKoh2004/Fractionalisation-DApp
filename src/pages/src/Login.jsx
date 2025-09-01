import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Initialize default users if not exist
  React.useEffect(() => {
    if (!localStorage.getItem('users')) {
      const users = [
        { id: 1, email: 'admin@dapp', password: 'admin123', name: 'Admin', isAdmin: true }
      ];
      localStorage.setItem('users', JSON.stringify(users));
    }
  }, []);

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const u = users.find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
    if (!u) {
      alert('Invalid credentials.');
      return;
    }
    localStorage.setItem('currentUser', JSON.stringify(u));
    navigate('/');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="login-root">
      <div className="card" style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          top: 16,
          right: 16,
          fontSize: '1.7rem',
          color: '#4f46e5',
          cursor: 'pointer',
          zIndex: 2
        }}
          title="Back to Home"
          onClick={() => navigate('/')}
        >
          &times;
        </span>
        <h2 style={{ textAlign: 'center', margin: '0 0 18px 0', fontWeight: 600, fontSize: '2rem', color: '#222' }}>Login</h2>
        <div style={{ marginBottom: '12px', fontSize: 13, color: '#666' }}>
          Demo admin: <code>admin@dapp</code> / <code>admin123</code>
        </div>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={handleLogin}>Login</button>
        <p style={{ fontSize: 13 }}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}
