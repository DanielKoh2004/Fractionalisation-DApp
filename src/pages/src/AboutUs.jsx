import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AboutUs.css';

function Header({ user }) {
  const navigate = useNavigate();
  const handleLogin = () => navigate('/login');
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
    window.location.reload();
  };
  return (
    <header className="header">
      <div className="logo">RealEstate dApp</div>
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/marketplace" className="nav-link">Marketplace</Link>
        {user && !user.isAdmin && (
          <Link to="/profile" className="nav-link">Profile</Link>
        )}
        {user && user.isAdmin && (
          <Link to="/admin" className="nav-link">Admin</Link>
        )}
        <Link to="/about_us" className="nav-link">About Us</Link>
        {!user ? (
          <button className="btn-login" onClick={handleLogin}>Login</button>
        ) : (
          <button className="btn-login" onClick={handleLogout}>Logout</button>
        )}
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>&copy; 2025 RealEstate dApp. All rights reserved.</div>
    </footer>
  );
}

export default function AboutUs() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    setUser(userStr ? JSON.parse(userStr) : null);
  }, []);
  return (
    <div className="aboutus-root">
      <Header user={user} />
      <main>
        <div className="about-container">
          <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=700&q=80" alt="Our Team" className="about-img" />
          <div className="about-content">
            <div className="about-title">About RealEstate dApp</div>
            <div className="about-text">
              RealEstate dApp is revolutionizing property investment by making fractional ownership accessible to everyone. Our platform allows you to invest in real estate with small amounts, trade shares instantly, and earn daily rental income.<br /><br />
              Our team is passionate about democratizing real estate, leveraging blockchain technology for transparency, security, and liquidity. Whether you're a seasoned investor or just starting out, our mission is to help you build wealth through property, one share at a time.<br /><br />
              Join us and be part of the future of real estate investing!
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
