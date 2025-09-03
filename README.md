<div align="center">

# 🪙 SanWallet - UTXO Blockchain Wallet




[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🔧 Configuration](#-configuration) • [🤝 Contributing](#-contributing)

---

## 👨‍💻 **Project Information**

**👤 Developer:** Lê Nguyên Thái  
**🎓 Student ID:** 21127162  
**🌐 Live Demo:** [https://blockchain-two-rho.vercel.app](https://blockchain-two-rho.vercel.app) 

**🔗 Backend API:** [https://blockchain-thaile-4f725e359671.herokuapp.com](https://blockchain-thaile-4f725e359671.herokuapp.com)  
**📺 Demo Video:** [https://youtu.be/FF54eF-x29c](https://youtu.be/FF54eF-x29c)  
**💻 GitHub Repository:** [https://github.com/lenguyenthai123/blockchain.git](https://github.com/lenguyenthai123/blockchain.git)

</div>

---

## 🧪 **Test Accounts**

For testing purposes, you can use these pre-configured accounts:

### 🔑 **Root Account**
- **Mnemonic:** `angle busy burden aspect armor arctic angry belt agent bridge blow another`
- **Address:** `SNC66134458b2eb0f34672265267edec7eafbf557402438ac75ca39eee47d388301`
- **Purpose:** Main testing account with initial balance

### ⛏️ **Miner Account**
- **Mnemonic:** `breeze advice balcony bullet board believe area broccoli afford before adult birth`
- **Purpose:** Mining rewards account for testing mining functionality

> **⚠️ Important:** These are test accounts only. Never use these mnemonics for real funds or production environments.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🔧 Configuration](#-configuration)
  - [Backend Node Configuration](#backend-node-configuration)
  - [Miner Configuration](#miner-configuration)
  - [Frontend Configuration](#frontend-configuration)
- [📦 Installation & Setup](#-installation--setup)
- [🏃‍♂️ Running the Application](#️-running-the-application)
- [🔗 API Documentation](#-api-documentation)
- [🛠️ Development](#️-development)
- [📚 References](#-references)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 **Wallet Management**
- **HD Wallet Support** - Hierarchical Deterministic wallet with BIP39 mnemonic phrases
- **Secure Key Storage** - Encrypted private keys with password protection
- **Multi-Address Support** - Generate and manage multiple addresses
- **Import/Export** - Restore wallets from recovery phrases

### 💰 **Transaction Features**
- **UTXO Model** - Unspent Transaction Output based blockchain
- **Real-time Updates** - Live transaction monitoring and notifications
- **Transaction History** - Complete transaction history with filtering
- **Fee Estimation** - Smart fee calculation for optimal confirmation times

### 🔍 **Blockchain Explorer**
- **Block Explorer** - Browse blocks, transactions, and addresses
- **Real-time Stats** - Network statistics and mining information
- **Search Functionality** - Search by block, transaction hash, or address
- **Network Monitoring** - Live network status and sync information

### ⛏️ **Mining Support**
- **Built-in Miner** - Integrated proof-of-work mining
- **Mining Pool Ready** - Support for distributed mining
- **Adaptive Difficulty** - Dynamic difficulty adjustment
- **Mining Analytics** - Detailed mining statistics and performance

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **PostgreSQL** 15+
- **Git**

### 1️⃣ Clone Repository

\`\`\`bash
git clone https://github.com/lenguyenthai123/blockchain.git
cd blockchain
\`\`\`

### 2️⃣ Setup Backend

\`\`\`bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run migrate
npm run seed
npm start
\`\`\`

### 3️⃣ Setup Frontend

\`\`\`bash
cd ../
npm install
cp .env.local.example .env.local
# Configure your environment variables
npm run dev
\`\`\`

### 4️⃣ Start Mining (Optional)

\`\`\`bash
cd backend
MINER_ADDRESS=your_san_address npm run miner
\`\`\`

---

## 🔧 Configuration

### Backend Node Configuration

Create a `.env` file in the `backend` directory:

\`\`\`bash
# 🌐 Server Configuration
NODE_ENV=development                    # Environment: development, production, test

PORT=3001                              # API server port

FRONTEND_URL=http://localhost:3000     # Frontend URL for CORS

# 🗄️ Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database?

sslmode=require
# PostgreSQL connection string - supports Neon, Supabase, local PostgreSQL

# 🔐 Security Configuration
JWT_SECRET=your-super-secret-jwt-key-here           # JWT signing secret (32+ chars)

ENCRYPTION_KEY=your-32-character-encryption-key    # AES encryption key (32 chars)

# ⛓️ Blockchain Settings
MINING_DIFFICULTY=4                    # Mining difficulty (2-6 recommended)
MINING_REWARD=100                      # Block reward in SAN coins
MAX_TRANSACTIONS_PER_BLOCK=100        # Maximum transactions per block

### Miner Configuration

Environment variables for the mining process:

\`\`\`bash
# ⛏️ Miner Configuration
MINER_ADDRESS=san1your_miner_address_here    # Your SAN address for mining rewards
BACKEND_URL=http://localhost:3001            # Backend API URL
MINER_INTERVAL_MS=5000                       # Mining interval in milliseconds
MINE_BATCH_SIZE=100                          # Transactions per mining batch

# 🔄 Mining Modes
NODE_ROLE=miner                              # Node role: server, miner, or both

MEMPOOL_MODE=local                           # Mempool mode: local or distributed

MINER_ONCE=false                             # Mine once and exit (for testing)

# 🌐 Network Configuration
PEERS=http://node1:3001,http://node2:3001    # Comma-separated peer URLs
\`\`\`

### Frontend Configuration

Create a `.env.local` file in the root directory:

\`\`\`bash
# 🔗 Backend Connection
NEXT_PUBLIC_API_URL=http://localhost:3001/api    # Backend API endpoint

# 🌐 Network Configuration
NEXT_PUBLIC_NETWORK_NAME=SanCoin                 # Network display name

NEXT_PUBLIC_CHAIN_ID=1                           # Chain ID for network identification

# 🔐 Security Settings
NEXT_PUBLIC_ENCRYPTION_ENABLED=true             # Enable client-side encryption

NEXT_PUBLIC_SESSION_TIMEOUT=3600000             # Session timeout (1 hour)

# 🎨 UI Configuration
NEXT_PUBLIC_THEME=dark                           # Default theme: light, dark, auto

NEXT_PUBLIC_ENABLE_ANIMATIONS=true              # Enable UI animations
\`\`\`

---

## 📦 Installation & Setup

### Backend Dependencies

\`\`\`bash
cd backend
npm install
\`\`\`

**Key Dependencies:**
- `express` - Web framework
- `pg` - PostgreSQL client
- `secp256k1` - Elliptic curve cryptography
- `joi` - Data validation
- `helmet` - Security middleware
- `winston` - Logging

### Frontend Dependencies

\`\`\`bash
npm install
\`\`\`

**Key Dependencies:**
- `next` - React framework
- `react` - UI library
- `tailwindcss` - CSS framework
- `recharts` - Charts and graphs
- `lucide-react` - Icons
- `@radix-ui/*` - UI components

### Database Setup

1. **Create Database:**
   \`\`\`sql
   CREATE DATABASE sanwallet;
   CREATE USER sanwallet_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE sanwallet TO sanwallet_user;
   \`\`\`

2. **Run Migrations:**
   \`\`\`bash
   cd backend
   npm run migrate
   \`\`\`

3. **Seed Initial Data:**
   \`\`\`bash
   npm run seed
   \`\`\`

---

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start Backend API:**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`
   🌐 API available at `http://localhost:3001`

2. **Start Frontend:**
   \`\`\`bash
   npm run dev
   \`\`\`
   🌐 Web app available at `http://localhost:3000`

3. **Start Miner (Optional):**
   \`\`\`bash
   cd backend
   MINER_ADDRESS=san1yourmineraddress npm run miner
   \`\`\`

### Production Mode

1. **Build Frontend:**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

2. **Start Backend:**
   \`\`\`bash
   cd backend
   NODE_ENV=production npm start
   \`\`\`

### Docker Deployment

\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d

# Scale miners
docker-compose up -d --scale miner=3
\`\`\`

---

## 🔗 API Documentation

### Blockchain Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blockchain/info` | Get blockchain information |
| `GET` | `/api/blockchain/blocks` | List recent blocks |
| `GET` | `/api/blockchain/block/:hash` | Get block by hash |
| `GET` | `/api/blockchain/tx/:hash` | Get transaction by hash |
| `POST` | `/api/blockchain/tx` | Submit new transaction |

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/wallet/create` | Create new wallet |
| `POST` | `/api/wallet/import` | Import wallet from mnemonic |
| `GET` | `/api/wallet/:address/balance` | Get address balance |
| `GET` | `/api/wallet/:address/transactions` | Get transaction history |

### Mining Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/mining/info` | Get mining information |
| `POST` | `/api/mining/submit` | Submit mined block |
| `GET` | `/api/mempool/status` | Get mempool status |

---

## 📚 References

### 📖 **Educational Resources**
- 📘 [**"Mastering Bitcoin"**](https://github.com/bitcoinbook/bitcoinbook) – Andreas M. Antonopoulos
- 📄 [**Bitcoin Whitepaper**](https://bitcoin.org/bitcoin.pdf) – Satoshi Nakamoto (2008)
- 🎓 [**Blockchain Fundamentals**](https://www.coursera.org/learn/blockchain-basics) – University at Buffalo

### 🔗 **Wallet Inspirations**
- 🦊 [**MetaMask**](https://metamask.io/) - Browser extension wallet
- 💼 [**MyEtherWallet**](https://www.myetherwallet.com/) - Web-based wallet interface
- 🔐 [**Electrum**](https://electrum.org/) - Desktop Bitcoin wallet

### 🔍 **Blockchain Explorers**
- 🔎 [**Etherscan**](https://etherscan.io/) - Ethereum blockchain explorer
- ⚡ [**Blockstream**](https://blockstream.info/) - Bitcoin explorer
- 🌐 [**Blockchain.info**](https://www.blockchain.com/explorer) - Multi-chain explorer

### 🛠️ **Technical Standards**
- 📋 [**BIP39**](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) - Mnemonic code for generating deterministic keys
- 🔑 [**BIP32**](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) - Hierarchical Deterministic Wallets
- 🏷️ [**BIP44**](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) - Multi-Account Hierarchy for Deterministic Wallets

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### 🚀 **Quick Contribution Steps**

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### 🐛 **Bug Reports**

Found a bug? Please open an issue with:
- 📝 Clear description
- 🔄 Steps to reproduce
- 💻 Environment details
- 📸 Screenshots (if applicable)

### 💡 **Feature Requests**

Have an idea? We'd love to hear it! Open an issue with:
- 🎯 Clear feature description
- 🤔 Use case explanation
- 📋 Acceptance criteria

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌟 **Star this repository if you found it helpful!**

**Made with ❤️ by Lê Nguyên Thái**

[🐛 Report Bug](https://github.com/lenguyenthai123/blockchain/issues) • [✨ Request Feature](https://github.com/lenguyenthai123/blockchain/issues) • [💬 Discussions](https://github.com/lenguyenthai123/blockchain/discussions)

</div>
