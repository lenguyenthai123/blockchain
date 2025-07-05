# MyCoin Backend

## Setup Instructions

### Prerequisites
- Go 1.21 or higher
- PostgreSQL 15 or higher
- Docker (optional)

### Local Development

1. **Clone and setup:**
\`\`\`bash
cd backend
go mod tidy
\`\`\`

2. **Setup PostgreSQL:**
\`\`\`bash
# Create database
createdb mycoin

# Or use Docker
docker run --name postgres -e POSTGRES_DB=mycoin -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
\`\`\`

3. **Set environment variables:**
\`\`\`bash
export DATABASE_URL="postgres://postgres:password@localhost:5432/mycoin?sslmode=disable"
export PORT=8080
export JWT_SECRET="your-secret-key"
\`\`\`

4. **Run the server:**
\`\`\`bash
go run main.go
\`\`\`

### Docker Development

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
\`\`\`

### API Endpoints

#### Wallet
- `POST /api/v1/wallet/create` - Create new wallet
- `POST /api/v1/wallet/import/private-key` - Import from private key
- `POST /api/v1/wallet/import/mnemonic` - Import from mnemonic
- `GET /api/v1/wallet/:address/balance` - Get wallet balance
- `GET /api/v1/wallet/:address/stats` - Get wallet statistics

#### Transactions
- `POST /api/v1/transaction/send` - Send transaction
- `POST /api/v1/transaction/estimate-fee` - Estimate transaction fee
- `GET /api/v1/transaction/latest` - Get latest transactions
- `GET /api/v1/transaction/:hash` - Get transaction details
- `GET /api/v1/transaction/history/:address` - Get transaction history

#### Blockchain
- `GET /api/v1/blockchain/blocks/latest` - Get latest blocks
- `GET /api/v1/blockchain/blocks/:number` - Get specific block
- `GET /api/v1/blockchain/stats` - Get network statistics
- `GET /api/v1/blockchain/price` - Get MyCoin price

#### Network
- `GET /api/v1/network/stats` - Get network statistics
- `POST /api/v1/network/stake` - Create stake

### Database Schema

The application uses GORM for database operations with the following models:
- Wallet
- Block
- Transaction
- MiningStats
- StakingPool
- UserStake

### Features

- **RESTful API** with Gin framework
- **PostgreSQL** database with GORM
- **CORS** support for frontend integration
- **Automatic migrations** on startup
- **Blockchain simulation** with PoW/PoS
- **Transaction processing** with fee calculation
- **Wallet management** with crypto utilities
- **Network statistics** and monitoring
