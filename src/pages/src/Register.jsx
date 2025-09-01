import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert('Complete all fields.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      alert('Email already used.');
      return;
    }
    const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newU = { id, email, password, name, isAdmin: false };
    users.push(newU);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newU));
    alert('Registered! Redirecting to dashboard.');
    navigate('/profile');
  };

  return (
    <div className="register-root">
      <div className="card" style={{ position: 'relative' }}>
        <button className="close-btn" title="Close" onClick={() => navigate('/')}>&times;</button>
        <h2>Create account</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Full name"
        />
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
        <button onClick={handleRegister}>Register</button>
        <p style={{ fontSize: 13 }}>
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
