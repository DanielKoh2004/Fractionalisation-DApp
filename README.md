<div align="center">

# ⌂ FRACTIONAL
# PROPERTY MARKET

### **REAL ESTATE, UNLOCKED INTO SHARES.**

`DISCOVER · FRACTIONALISE · TRADE · EARN`

<br>

![Solidity](https://img.shields.io/badge/SOLIDITY-0.8.20-363636?style=flat-square&logo=solidity&logoColor=white)
![Hardhat](https://img.shields.io/badge/HARDHAT-LOCAL%20EVM-F0D05A?style=flat-square&logo=hardhat&logoColor=111111)
![React](https://img.shields.io/badge/REACT-19-61DAFB?style=flat-square&logo=react&logoColor=111111)
![Vite](https://img.shields.io/badge/VITE-7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Ethers](https://img.shields.io/badge/WEB3-ETHERS.JS-3C3C3D?style=flat-square&logo=ethereum&logoColor=white)

</div>

---

# THE THESIS

Real estate is valuable.

Real estate is expensive.

The project asks a simple question:

> **What if ownership could be divided into tradable on-chain shares?**

Instead of one buyer owning an entire property:

```text
                 PROPERTY
                     │
                     ▼
             ┌───────────────┐
             │  10,000 SHARES│
             └───────┬───────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      1,000          500          50
       shares       shares       shares
        │            │            │
      Investor A  Investor B  Investor C
```

The property becomes a **programmable economic asset**.

---

# 🏠 A PROPERTY, DECOMPOSED

A listing begins as a real-world property description.

It becomes:

```text
PROPERTY
   │
   ├── metadataURI
   ├── total shares
   ├── price / share
   └── owner
         │
         ▼
     ERC-20 STYLE
     FRACTIONAL TOKEN
         │
         ├── BUY
         ├── SELL
         ├── TRANSFER
         └── DIVIDEND CLAIM
```

The core contracts are organised around a **Registry → Factory → Token → Marketplace** model.

---

# ✦ THE MARKET IN ONE PAGE

| Layer | What happens |
|---|---|
| **Discovery** | Browse featured properties and detailed listings |
| **Application** | Property owner submits a tokenisation application |
| **Review** | Admin approves or rejects the application |
| **Finalisation** | Fractional token is deployed and registry entry created |
| **Primary Market** | Investors buy available shares |
| **Secondary Market** | Holders list shares and other users fill listings |
| **Income** | Property-level dividends are deposited and claimed |

This lifecycle is represented directly in the Solidity architecture. fileciteturn66file0 fileciteturn67file0

---

# 📜 THE PROPERTY DEED

The application object behaves like a digital intake record:

```text
┌─────────────────────────────────────────┐
│ PROPERTY APPLICATION                    │
├─────────────────────────────────────────┤
│ Applicant        0x...                   │
│ Name             Damansara Villa Shares │
│ Symbol           DMSR                    │
│ Metadata         ipfs://...              │
│ Total Shares     10,000                  │
│ Price / Share    0.01 ETH                │
│ Status           PENDING                 │
│ Review Note      —                       │
│ Created          block timestamp        │
└─────────────────────────────────────────┘
```

The `PropertyFactory` tracks application lifecycle states:

```text
PENDING
   │
   ├──► REJECTED
   │
   └──► APPROVED
          │
          ▼
      FINALIZED
          │
          ▼
       REMOVED
```

---

# 🔨 FACTORY → TOKEN → PROPERTY

Finalisation is where the business object becomes an on-chain asset.

```text
Approved Application
        │
        ▼
PropertyFactory
        │
        ├──── deploy FractionalToken
        │
        ├──── mint total supply
        │
        └──── create registry entry
                     │
                     ▼
              PropertyRegistry
```

The implementation deploys a new `FractionalToken`, mints the total share supply to the applicant, transfers token ownership to the configured marketplace/registry owner, and creates the property record. fileciteturn66file0

---

# 🪙 FRACTIONAL OWNERSHIP

The token itself is the ownership primitive.

```text
PROPERTY VALUE
      │
      ▼
┌───────────────────────┐
│      100% ASSET       │
└───────────┬───────────┘
            │
            ▼
      10,000 TOKENS
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
  40%      35%      25%
 Holder A Holder B Holder C
```

The `FractionalToken` contract is kept deliberately small; the higher-level market lifecycle is handled by the marketplace and registry contracts. fileciteturn59file0

---

# 💹 PRIMARY MARKET

A buyer purchases newly issued shares from the current property owner.

```text
BUY SHARES
    │
    ├── propertyId
    ├── token address
    ├── amount
    └── price / share
          │
          ▼
    msg.value = amount × price
          │
          ▼
     TOKEN TRANSFER
          │
          ▼
       INVESTOR
```

The marketplace validates the property/token relationship, available supply, and exact ETH payment before moving shares. fileciteturn67file0

---

# 🔄 SECONDARY MARKET

Once an investor owns shares, those shares can be listed for others.

```text
HOLDER
  │
  ▼
CREATE LISTING
  │
  ├── amount
  ├── price / share
  └── seller
        │
        ▼
      ESCROWED
        │
        ▼
   BUYER FILLS LISTING
        │
        ▼
   ETH → SELLER
   SHARES → BUYER
```

Listings support partial fills; once the remaining amount reaches zero, the listing becomes inactive. fileciteturn67file0

---

# 💰 OWNERSHIP CAN PRODUCE CASH FLOW

Fractional ownership is not only about resale.

The marketplace implements an accumulative-per-share dividend accounting model.

```text
PROPERTY
   │
   ▼
RENTAL / DIVIDEND DEPOSIT
   │
   ▼
accDivPerShare
   │
   ├──────────────┐
   ▼              ▼
Holder A       Holder B
  shares        shares
   │              │
   ▼              ▼
pending        pending
 dividends     dividends
   │              │
   └──────┬───────┘
          ▼
       CLAIM()
```

The marketplace tracks cumulative dividend-per-share values and per-holder corrections so newly acquired shares do not retroactively claim distributions that happened before ownership. fileciteturn67file0

---

# 🧠 THE CONTRACT SYSTEM

```text
                         ┌──────────────────────┐
                         │  PROPERTY REGISTRY   │
                         │                      │
                         │ metadata              │
                         │ token                 │
                         │ shares                │
                         │ price                 │
                         │ owner                 │
                         └──────────▲───────────┘
                                    │
                                    │ create / update
                                    │
              ┌─────────────────────┴──────────────────┐
              │                                        │
              │                                        │
┌─────────────┴─────────────┐              ┌───────────┴─────────────┐
│     PROPERTY FACTORY      │              │       MARKETPLACE       │
│                           │              │                           │
│ submit application        │              │ buy shares               │
│ review                    │              │ create listing           │
│ finalise                  │              │ fill / cancel listing    │
└─────────────┬─────────────┘              │ deposit / claim dividends │
              │                            └───────────┬───────────────┘
              ▼                                        │
      ┌──────────────────┐                             │
      │ FRACTIONAL TOKEN │◄────────────────────────────┘
      │      ERC-20      │
      └──────────────────┘
```

The repository contains dedicated Solidity contracts for these responsibilities. fileciteturn58file0 fileciteturn59file0

---

# 🧭 USER JOURNEY

### OWNER

```text
Submit property
      ↓
Wait for review
      ↓
Approved
      ↓
Finalise
      ↓
Fractional token created
```

### INVESTOR

```text
Browse properties
      ↓
Open property detail
      ↓
Buy shares
      ↓
Hold / receive dividends
      ↓
List shares later
```

### MARKET OPERATOR

```text
Review applications
      ↓
Approve / reject
      ↓
Manage active properties
      ↓
Update metadata / prices
```

---

# 🖼️ THE PROPERTY GALLERY

The frontend already includes a **Featured Properties** carousel with multiple fallback real-estate images sourced from Unsplash, plus property-specific images resolved from IPFS/local cache where available. fileciteturn65file0

A typical listing is presented as:

```text
┌─────────────────────────────────────────┐
│                                         │
│        [ PROPERTY PHOTOGRAPH ]          │
│                                         │
├─────────────────────────────────────────┤
│ Damansara Residence                     │
│ Kuala Lumpur, Malaysia                  │
│                                         │
│ 6.4% Rental Yield     9.1% Return       │
│                                         │
│ 2,500 shares available                  │
│ 0.01 ETH / share                        │
└─────────────────────────────────────────┘
```

The actual application supports a responsive carousel and merges locally cached / on-chain property data for the featured section. fileciteturn65file0

---

# 🖥️ FRONTEND

The web application is a React + Vite frontend with routes for the core marketplace experience.

```text
HOME
 ├── Featured Properties
 ├── Product / property discovery
 └── Platform information

MARKETPLACE
 ├── Listings
 ├── Cache refresh
 └── Source status

PROPERTY DETAIL
 ├── Property metadata
 ├── Shares
 ├── Price
 ├── Images
 └── Investment actions

PROFILE
ADMIN
ABOUT
LOGIN
```

The frontend package uses React 19, Vite 7, React Router, Ethers.js and Chart.js. fileciteturn61file0

---

# 🔗 WEB3 DATA FLOW

```text
             BROWSER
                │
                ▼
          React Frontend
                │
              ethers
                │
                ▼
        ┌──────────────┐
        │ LOCAL EVM    │
        │ 127.0.0.1    │
        │ :8545        │
        └──────┬───────┘
               │
      ┌────────┼───────────┐
      ▼        ▼           ▼
 Registry   Factory     Marketplace
      │        │           │
      └────────┼───────────┘
               ▼
        FractionalToken
```

For local development, the contract workspace is configured around Hardhat and Ganache with a local chain on port `8545`. fileciteturn62file0

---

# 🧪 LOCAL DEPLOYMENT

### 01 · Start the chain

```bash
cd contracts
npm install
npm run chain
```

### 02 · Deploy

```bash
npm run deploy:ganache
```

### 03 · Seed demo data

```bash
npm run seed:ganache
```

### 04 · Verify

```bash
npm run verify:ganache
```

Other diagnostic helpers are available in the contract workspace, including `check:ganache`, `diagnose:ganache` and `check:sources`. fileciteturn62file0

### 05 · Start the frontend

```bash
cd ../src/pages
npm install
npm run dev
```

Open the Vite URL printed in the terminal, typically:

```text
http://localhost:5173
```

The original local-run workflow also documents the contract deployment writing current addresses into `src/pages/src/web3/addresses.json`. fileciteturn55file0

---

# 🗃️ REPOSITORY LAYOUT

```text
Fractionalisation-DApp/
│
├── contracts/
│   ├── contracts/
│   │   ├── core/
│   │   │   ├── Marketplace.sol
│   │   │   ├── PropertyFactory.sol
│   │   │   └── PropertyRegistry.sol
│   │   │
│   │   └── tokens/
│   │       └── FractionalToken.sol
│   │
│   ├── interfaces/
│   ├── scripts/
│   ├── artifacts/
│   ├── cache/
│   ├── ganache-db/
│   ├── hardhat.config.js
│   └── package.json
│
└── src/
    └── pages/
        ├── src/
        │   ├── Home.jsx
        │   ├── Marketplace.jsx
        │   ├── PropertyDetail.jsx
        │   ├── Profile.jsx
        │   ├── Admin.jsx
        │   ├── Login.jsx
        │   ├── AboutUs.jsx
        │   └── web3/
        │
        ├── public/
        ├── package.json
        └── index.html
```

---

# ⚙️ TECHNOLOGY REGISTER

| Domain | Technology |
|---|---|
| Smart contracts | **Solidity 0.8.20** |
| Contract framework | **Hardhat** |
| Local blockchain | **Ganache** |
| Token standard | **ERC-20 style fractional token** |
| Security primitives | **OpenZeppelin Ownable / ReentrancyGuard** |
| Frontend | **React 19** |
| Build tool | **Vite 7** |
| Web3 connection | **Ethers.js 6** |
| Routing | **React Router 7** |
| Charts | **Chart.js** |
| Styling | **Tailwind CSS** |
| Metadata | **IPFS / data URI support** |

The contract and frontend manifests confirm these current dependencies. fileciteturn61file0 fileciteturn62file0

---

# ⚠️ PROTOTYPE NOTES

This repository is a blockchain application prototype / academic project.

Real-world tokenised real estate would require substantially more than smart contracts and a frontend, including:

```text
Property legal ownership
SPV / legal wrapper structure
Securities regulation
Investor KYC / AML
Custody
Oracle design
Tax treatment
Dividend funding verification
Contract audits
Production key management
```

The on-chain token should therefore be understood as a **technical representation of fractional ownership mechanics**, not by itself as proof of legal title to a physical property.

---

# ◇ THE IDEA

```text
ONE PROPERTY
      ↓
MANY SHARES
      ↓
MANY OWNERS
      ↓
ONE PROGRAMMABLE MARKET
```

The interesting part is not putting a house on a blockchain.

It is making the economic primitives around ownership **programmable**:

**issue → hold → trade → distribute income.**

---

<div align="center">

<br>

# `OWN A FRACTION. NOT JUST A DREAM.`

**Fractionalisation DApp**

*Real estate ownership reimagined as an on-chain marketplace.*

<br>

[View Repository →](https://github.com/DanielKoh2004/Fractionalisation-DApp)

</div>
