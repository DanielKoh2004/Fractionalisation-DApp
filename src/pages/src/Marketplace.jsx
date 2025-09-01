import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Marketplace.css';

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

function PropertiesList({ properties }) {
  return (
    <div>
      <h3 style={{ color: '#4636e3', marginBottom: 18 }}>Properties</h3>
      <div id="propertiesList">
        {properties.map((p, i) => (
          <div className="product-card" style={{ marginBottom: 24 }} key={i}>
            <div className="recent-listing">RECENT LISTING</div>
            <img src={p.image} alt={p.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            <div style={{ padding: '18px 16px 10px 16px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#222' }}>{p.title}</div>
              <div style={{ fontSize: '0.98rem', color: '#666' }}>{p.address}</div>
              <div style={{ color: '#7c3aed', fontWeight: 600, marginTop: 8 }}>{p.rentalYield}% Rental Yield</div>
              <div style={{ color: '#4636e3', fontSize: '0.98rem' }}>{p.annualReturn}% Projected Annual Return</div>
            </div>
            <div style={{ background: '#a78bfa', color: '#fff', padding: '8px 0', textAlign: 'center', fontSize: '1rem', fontWeight: 500 }}>
              Available: {p.availableShares} shares at {p.sharePrice} ETH
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TradingPlatform({ properties, user, onBuy, onSell, tradeMsg }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [tradeShares, setTradeShares] = useState(1);

  const p = properties[selectedIdx] || {};

  return (
    <div>
      <h3 style={{ color: '#4636e3', marginBottom: 18 }}>Trading Platform</h3>
      <div className="trade-container">
        <label htmlFor="tradeProperty">Select Property:</label>
        <select
          id="tradeProperty"
          value={selectedIdx}
          onChange={e => setSelectedIdx(Number(e.target.value))}
          style={{ width: '100%', padding: 10, marginBottom: 18, borderRadius: 8, border: '1px solid #e6eefc' }}
        >
          {properties.map((p, i) => (
            <option value={i} key={i}>{p.title}</option>
          ))}
        </select>
        <div id="tradeDetails" style={{ marginBottom: 18 }}>
          <div><b>{p.title}</b></div>
          <div>{p.address}</div>
          <div>Rental Yield: <b>{p.rentalYield}%</b></div>
          <div>Annual Return: <b>{p.annualReturn}%</b></div>
          <div>Available Shares: <b>{p.availableShares}</b></div>
          <div>Share Price: <b>{p.sharePrice} ETH</b></div>
        </div>
        <input
          id="tradeShares"
          type="number"
          min="1"
          value={tradeShares}
          onChange={e => setTradeShares(Number(e.target.value))}
          placeholder="Number of shares"
          style={{ marginBottom: 12 }}
        />
        <div className="trade-btn-row">
          <button className="trade-btn" onClick={() => onSell(selectedIdx, tradeShares)}>Sell Shares</button>
          <button className="trade-btn" onClick={() => onBuy(selectedIdx, tradeShares)}>Buy Shares</button>
        </div>
        <div id="tradeMsg" style={{ marginTop: 18, color: '#4636e3', fontWeight: 500 }}>{tradeMsg}</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>&copy; 2025 RealEstate dApp. All rights reserved.</div>
    </footer>
  );
}

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [tradeMsg, setTradeMsg] = useState('');
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    setUser(userStr ? JSON.parse(userStr) : null);
    const props = JSON.parse(localStorage.getItem('properties') || '[]');
    setProperties(props);
  }, []);
  const showTradeMsg = msg => setTradeMsg(msg);
  const handleBuy = (idx, shares) => {
    if (!shares || shares < 1) return showTradeMsg('Enter valid number of shares.');
    const props = [...properties];
    const p = props[idx];
    if (shares > p.availableShares) return showTradeMsg('Not enough shares available.');
    if (!user) return showTradeMsg('Please login to buy shares.');
    p.availableShares -= shares;
    localStorage.setItem('properties', JSON.stringify(props));
    setProperties(props);
    let ownership = JSON.parse(localStorage.getItem('ownership') || '[]');
    let owner = ownership.find(o => o.userId === user.id && o.propertyId === p.id);
    if (owner) {
      owner.shares += shares;
    } else {
      ownership.push({ userId: user.id, propertyId: p.id, shares });
    }
    localStorage.setItem('ownership', JSON.stringify(ownership));
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      id: transactions.length + 1,
      type: 'buy',
      propertyId: p.id,
      userId: user.id,
      shares,
      amount: Math.round(p.sharePrice * shares * 10000) / 10000,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    showTradeMsg(`Purchased ${shares} shares of ${p.title}.`);
  };
  const handleSell = (idx, shares) => {
    if (!shares || shares < 1) return showTradeMsg('Enter valid number of shares.');
    const props = [...properties];
    const p = props[idx];
    if (!user) return showTradeMsg('Please login to sell shares.');
    let ownership = JSON.parse(localStorage.getItem('ownership') || '[]');
    let owner = ownership.find(o => o.userId === user.id && o.propertyId === p.id);
    if (!owner || owner.shares < shares) {
      showTradeMsg('You do not have enough shares to sell.');
      return;
    }
    owner.shares -= shares;
    localStorage.setItem('ownership', JSON.stringify(ownership));
    p.availableShares += shares;
    localStorage.setItem('properties', JSON.stringify(props));
    setProperties(props);
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push({
      id: transactions.length + 1,
      type: 'sell',
      propertyId: p.id,
      userId: user.id,
      shares,
      amount: Math.round(p.sharePrice * shares * 10000) / 10000,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    showTradeMsg(`Sold ${shares} shares of ${p.title}.`);
  };
  return (
    <div className="marketplace-root">
      <Header user={user} />
      <div className="container">
        <h2>Marketplace</h2>
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 340 }}>
            <PropertiesList properties={properties} />
          </div>
          <div style={{ flex: 1, minWidth: 340 }}>
            <TradingPlatform
              properties={properties}
              user={user}
              onBuy={handleBuy}
              onSell={handleSell}
              tradeMsg={tradeMsg}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
