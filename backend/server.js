const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory demo storage; replace with DB + chain indexer in production
const db = {
	users: [],
	properties: [],
	trades: [],
};

// Wallet auth (nonce + signature) placeholders
const nonces = new Map();
app.post('/auth/nonce', (req, res) => {
	const { address } = req.body;
	if (!address) return res.status(400).json({ error: 'address required' });
	const nonce = Math.floor(Math.random() * 1e9).toString();
	nonces.set(address.toLowerCase(), nonce);
	res.json({ nonce });
});
app.post('/auth/verify', (req, res) => {
	const { address, signature } = req.body;
	if (!address || !signature) return res.status(400).json({ error: 'address & signature required' });
	// TODO: recover address from signature and compare; accept demo
	res.json({ ok: true, address });
});

// Properties
app.get('/properties', (req, res) => {
	res.json(db.properties);
});

app.get('/users/:address/holdings', (req, res) => {
	const address = req.params.address.toLowerCase();
	// TODO: query chain for balances; demo empty
	res.json([]);
});

app.get('/users/:address/transactions', (req, res) => {
	const address = req.params.address.toLowerCase();
	res.json(db.trades.filter(t => t.user?.toLowerCase() === address));
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on :${port}`));
