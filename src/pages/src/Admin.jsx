import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css';
import { web3Client } from './web3/client';
import { ethers } from 'ethers';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [trades, setTrades] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: '', address: '', rentalYield: '', annualReturn: '', totalShares: '', sharePrice: '', image: ''
  });
  const [propMsg, setPropMsg] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');
  const [previewImg, setPreviewImg] = useState('');
  const [divForm, setDivForm] = useState({ propertyId: '', amountEth: '' });
  const [divMsg, setDivMsg] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      alert('Admin access required');
      navigate('/');
      return;
    }
    const u = JSON.parse(userStr);
    if (!u.isAdmin) {
      alert('Admin access required');
      navigate('/');
      return;
    }
    setUser(u);
    setProperties(JSON.parse(localStorage.getItem('properties') || '[]'));
    setTrades(JSON.parse(localStorage.getItem('trades') || '[]'));
    setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
  }, [navigate]);

  // Property creation
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      setForm(f => ({ ...f, image: evt.target.result }));
      setPreviewImg(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProperty = async () => {
    const { title, address, rentalYield, annualReturn, totalShares, sharePrice, image } = form;
    if (!title || !address || !rentalYield || !annualReturn || !totalShares || !sharePrice || !image) {
      setPropMsg('Complete all fields and upload image.');
      return;
    }
    const props = [...properties];
    const id = props.length ? Math.max(...props.map(p => p.id)) + 1 : 1;
    const p = {
      id,
      title,
      address,
      image,
      rentalYield: Number(rentalYield),
      annualReturn: Number(annualReturn),
      totalShares: Number(totalShares),
      availableShares: Number(totalShares),
      sharePrice: Number(sharePrice)
    };
    props.push(p);
    localStorage.setItem('properties', JSON.stringify(props));
    setProperties(props);
    // On-chain create fractional token + registry entry
    try {
      await web3Client.connect();
      // Only the Marketplace owner can create properties
      const acct = await web3Client.getAccount();
      const owner = await web3Client.getMarketplaceOwner();
      if (!owner || owner.toLowerCase() !== acct.toLowerCase()) {
        setPropMsg(`Only owner can create properties. Switch wallet to ${owner || 'owner'} or transfer ownership.`);
        return;
      }
      setPropMsg('Creating property on-chain...');
      const { receipt, propertyId, token } = await web3Client.createProperty({
        name: `${title} Shares`,
        symbol: title.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase() || 'PROP',
        metadataURI: 'ipfs://placeholder',
        totalShares: Number(totalShares),
        sharePriceWei: ethers.parseEther(String(sharePrice)),
        owner: (await web3Client.signer.getAddress())
      });
      console.log('createProperty', { receipt, propertyId, token });
      if (propertyId !== undefined && token) {
        setPropMsg(`Created on-chain: #${propertyId} token ${token.slice(0,6)}...${token.slice(-4)}`);
        // Optional: store on the local item so the Admin list shows token
        const updated = props.map(x => x.id === id ? { ...x, tokenAddress: token, onchainId: propertyId } : x);
        localStorage.setItem('properties', JSON.stringify(updated));
        setProperties(updated);
        // Clear local fallback to force Marketplace to load from chain
        localStorage.removeItem('properties');
      } else {
        setPropMsg('On-chain create confirmed, but event not parsed.');
      }
    } catch (e) {
      console.error(e);
      setPropMsg('On-chain create failed. See console.');
      return;
    }
    setForm({ title: '', address: '', rentalYield: '', annualReturn: '', totalShares: '', sharePrice: '', image: '' });
    setPreviewImg('');
    // Small delay to let the node index the event
    setTimeout(() => navigate('/marketplace'), 600);
  };

  // Property deletion
  const handleDeleteProperty = id => {
    const props = [...properties];
    const idx = props.findIndex(p => p.id === id);
    if (idx === -1) return;
    const propTitle = props[idx].title;
    props.splice(idx, 1);
    localStorage.setItem('properties', JSON.stringify(props));
    setProperties(props);
    setDeleteMsg(`Property "${propTitle}" deleted.`);
  };

  // Deposit dividends on-chain
  const handleDepositDividends = async () => {
    if (!divForm.propertyId || !divForm.amountEth) {
      setDivMsg('Select property and amount.');
      return;
    }
    try {
      await web3Client.connect();
      const amountWei = ethers.parseEther(String(divForm.amountEth));
      await web3Client.depositDividends({ propertyId: Number(divForm.propertyId), amountWei });
      setDivMsg('Dividends deposited.');
    } catch (e) {
      console.error(e);
      setDivMsg('Deposit failed.');
    }
    setTimeout(() => setDivMsg(''), 2500);
  };

  // Trading history
  const renderTradeHistory = () => {
    if (trades.length === 0) return <div>No trading history yet.</div>;
    return (
      <table className="admin-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>User</th>
            <th>Property Name</th>
            <th>Property ID</th>
            <th>Quantity</th>
            <th>Price (ETH)</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(tr => {
            const user = users.find(u => u.id === tr.userId);
            const prop = properties.find(p => p.id === tr.propertyId);
            return (
              <tr key={tr.id}>
                <td>{tr.type}</td>
                <td>{user ? user.name || user.email : tr.userId}</td>
                <td>{prop ? prop.title : 'Unknown'}</td>
                <td>{tr.propertyId}</td>
                <td>{tr.quantity}</td>
                <td>{tr.price}</td>
                <td>{new Date(tr.timestamp).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="logo">RealEstate dApp</div>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/marketplace" className="nav-link">Marketplace</Link>
          {/* Only show Profile link for non-admin users */}
          {/* <Link to="/profile" className="nav-link">Profile</Link> */}
          {user && user.isAdmin && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
          <Link to="/about_us" className="nav-link">About Us</Link>
          {user ? (
            <button className="btn-login" onClick={() => {
              localStorage.removeItem('currentUser');
              navigate('/');
            }}>Logout</button>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </nav>
      </header>
      <main>
        <div className="container">
          <div className="admin-container">
            <div className="admin-title">Admin Panel</div>
            <div className="admin-desc">
              Welcome, Admin! Here you can list new properties for fractional ownership and manage dividends.<br />
              <b>Note:</b> All property trading is powered by Ethereum blockchain smart contracts for secure, transparent transactions.
            </div>
            <div className="card">
              <h3>List New Property</h3>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Property name (e.g. Damansara Villa)" />
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address (e.g. No. 12, Jalan Damansara, 47800 Petaling Jaya, Selangor)" />
              <input value={form.rentalYield} type="number" step="0.01" onChange={e => setForm(f => ({ ...f, rentalYield: e.target.value }))} placeholder="Rental Yield (%)" />
              <input value={form.annualReturn} type="number" step="0.01" onChange={e => setForm(f => ({ ...f, annualReturn: e.target.value }))} placeholder="Projected Annual Return (%)" />
              <input value={form.totalShares} type="number" onChange={e => setForm(f => ({ ...f, totalShares: e.target.value }))} placeholder="Total shares (e.g. 10000)" />
              <input value={form.sharePrice} type="number" step="0.0001" onChange={e => setForm(f => ({ ...f, sharePrice: e.target.value }))} placeholder="Price per share (ETH)" />
              <label htmlFor="imageUpload">House image:</label>
              <input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} />
              {previewImg && <img src={previewImg} alt="Preview" style={{ width: '100%', maxWidth: 320, margin: '12px 0', borderRadius: 12 }} />}
              <button onClick={handleCreateProperty}>Create property</button>
              <div className="small">{propMsg}</div>
            </div>
            <div className="card">
              <h3>Delete Property</h3>
              <div>
                {properties.length === 0 ? (
                  <div>No properties available.</div>
                ) : (
                  properties.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, background: '#fff', padding: 10, borderRadius: 8, boxShadow: '0 1px 6px rgba(70,54,227,0.07)' }}>
                      <img src={p.image} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#4636e3' }}>{p.title}</div>
                        <div style={{ fontSize: '0.98rem', color: '#444' }}>{p.address}</div>
                      </div>
                      <button className="btn" style={{ background: '#e34c4c' }} onClick={() => handleDeleteProperty(p.id)}>Delete</button>
                    </div>
                  ))
                )}
              </div>
              <div className="small">{deleteMsg}</div>
            </div>
            <div className="card">
              <h3>Trading History</h3>
              <div>{renderTradeHistory()}</div>
            </div>
            <div className="card">
              <h3>Dividends</h3>
              <select value={divForm.propertyId} onChange={e => setDivForm(f => ({ ...f, propertyId: e.target.value }))}>
                <option value="">Select property</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title} (#{p.id})</option>
                ))}
              </select>
              <input type="number" step="0.0001" placeholder="Amount (ETH)" value={divForm.amountEth} onChange={e => setDivForm(f => ({ ...f, amountEth: e.target.value }))} />
              <button onClick={handleDepositDividends}>Deposit Dividends</button>
              <div className="small">{divMsg}</div>
            </div>
          </div>
        </div>
      </main>
      <footer className="admin-footer">
        <div>&copy; 2025 RealEstate dApp. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Admin;
