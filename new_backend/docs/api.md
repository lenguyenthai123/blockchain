# SanCoin API Documentation

## Base URL
`http://localhost:8080`

---

### 1. Statistics & Explorer API

#### 1.1. Get Blockchain Summary
Lấy các thông số thống kê tổng quan về mạng lưới SanCoin.

- **Endpoint:** `GET /api/v1/stats/summary`
- **Method:** `GET`
- **Success Response (200 OK):**
  \`\`\`json
  {
    "sancoin_price_usd": 0.0,
    "market_cap_usd": 0.0,
    "total_transactions": 150,
    "last_finalized_block": 123,
    "transactions_per_second": 2.5
  }
  \`\`\`

#### 1.2. Get Latest Blocks
Lấy danh sách các block được đào gần đây nhất.

- **Endpoint:** `GET /api/v1/blocks/latest`
- **Method:** `GET`
- **Query Params:**
  - `limit` (int, optional, default: 5): Số lượng block muốn lấy.
- **Success Response (200 OK):**
  \`\`\`json
  [
    {
      "height": 124,
      "hash": "0000efgh...",
      "timestamp": 1678886500,
      "tx_count": 5,
      "miner_address": "1C3zP1eP5QGefi2DMPTfTL5SLmv7DivfNc"
    },
    {
      "height": 123,
      "hash": "0000abcd...",
      "timestamp": 1678886400,
      "tx_count": 8,
      "miner_address": "1C3zP1eP5QGefi2DMPTfTL5SLmv7DivfNc"
    }
  ]
  \`\`\`

#### 1.3. Get Latest Transactions
Lấy danh sách các giao dịch được xác nhận gần đây nhất.

- **Endpoint:** `GET /api/v1/transactions/latest`
- **Method:** `GET`
- **Query Params:**
  - `limit` (int, optional, default: 5): Số lượng giao dịch muốn lấy.
- **Success Response (200 OK):**
  \`\`\`json
  [
    {
      "hash": "a1b2c3d4...",
      "from": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "to": "1B2yP1eP5QGefi2DMPTfTL5SLmv7DivfNb",
      "amount": 10,
      "timestamp": 1678886450
    }
  ]
  \`\`\`

---

### 2. Wallet

#### 2.1. Create a new Wallet
- **Endpoint:** `POST /api/v1/wallet`
- **Method:** `POST`
- **Success Response (201 Created):**
  \`\`\`json
  {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "public_key": "04...",
    "private_key": "..."
  }
\`\`\`

#### 2.2. Get Wallet Balance and UTXOs
- **Endpoint:** `GET /api/v1/wallet/:address/balance`
- **Method:** `GET`
- **Success Response (200 OK):**
  \`\`\`json
  {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "balance": 150,
    "utxo_count": 2,
    "utxos": [
      {
        "tx_hash": "f2a1b3c4...",
        "vout_index": 0,
        "amount": 100
      }
    ]
  }
  \`\`\`

---

### 3. Transactions

#### 3.1. Create and Send a Transaction
- **Endpoint:** `POST /api/v1/transactions`
- **Method:** `POST`
- **Request Body:**
  \`\`\`json
  {
    "sender_private_key": "your_private_key_hex",
    "sender_address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "recipient_address": "1B2yP1eP5QGefi2DMPTfTL5SLmv7DivfNb",
    "amount": 10
  }
  \`\`\`
- **Success Response (202 Accepted):**
  \`\`\`json
  {
    "message": "Transaction created and sent to mempool",
    "tx_hash": "a1b2c3d4..."
  }
  \`\`\`

---

### 4. Blockchain & Mining

#### 4.1. Mine a New Block
- **Endpoint:** `POST /api/v1/mine`
- **Method:** `POST`
- **Request Body:**
  \`\`\`json
  {
    "miner_address": "1C3zP1eP5QGefi2DMPTfTL5SLmv7DivfNc"
  }
  \`\`\`
- **Success Response (201 Created):**
  \`\`\`json
  {
    "message": "New block successfully mined!",
    "block_height": 124,
    "block_hash": "0000efgh...",
    "transactions_included": 5
  }
