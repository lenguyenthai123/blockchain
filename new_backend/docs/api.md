# SanCoin API Documentation

## Luồng Giao Dịch Mới (Client-Side Signing)

Với phiên bản này, việc tạo và ký giao dịch được thực hiện **hoàn toàn ở phía client** để đảm bảo private key không bao giờ rời khỏi máy người dùng.

1.  **Client**: Gọi `GET /wallet/:address/balance` để lấy danh sách UTXO (Unspent Transaction Outputs).
2.  **Client**: Tự chọn các UTXO cần thiết để chi tiêu.
3.  **Client**: Tạo một giao dịch thô (raw transaction) với các input (từ UTXO đã chọn) và output (đến người nhận và địa chỉ trả lại tiền thừa).
4.  **Client**: Dùng private key của mình để ký vào giao dịch thô.
5.  **Client**: Serialize toàn bộ giao dịch đã ký thành một chuỗi HEX.
6.  **Client**: Gọi `POST /transactions/broadcast` và gửi chuỗi HEX này lên server.
7.  **Server**: Nhận chuỗi HEX, deserialize, xác thực chữ ký và các quy tắc khác, sau đó đưa vào mempool.

---

### 2. Transaction API

#### 2.1 Broadcast a Signed Transaction
Gửi một giao dịch đã được ký hoàn chỉnh ở client lên server để đưa vào mempool.

- **Endpoint:** `POST /transactions/broadcast`
- **Request Body (JSON):**
  \`\`\`json
  {
  "raw_tx_hex": "a1b2c3d4e5f6..."
  }
  \`\`\`
- **Success Response (200 OK):**
  \`\`\`json
  {
  "message": "Transaction broadcast successfully and is pending inclusion in a block.",
  "tx_hash": "..."
  }
  \`\`\`
- **Error Response (422 Unprocessable Entity):**
  \`\`\`json
  {
  "error": "transaction signature verification failed"
  }
  \`\`\`

---
**(Các API khác không thay đổi)**


Lấy thông tin tài khoản, bao gồm tổng số dư (tính từ UTXO) và danh sách các UTXO chưa tiêu.

- **Endpoint:** `GET /wallet/:address/balance`
- **Method:** `GET`
- **URL Params:**
  - `address` (string, required): Địa chỉ ví SanCoin.
- **Success Response (200 OK):**
  \`\`\`json
  {
  "address": "1...",
  "balance": 50,
  "utxo_count": 1,
  "utxos": [
  {
  "tx_id": "f2a1b3c4...",
  "vout_index": 0,
  "amount": 50
  }
  ]
  }
  \`\`\`
- **Error Response (404 Not Found):**
  \`\`\`json
  {
  "error": "Wallet address not found or has no transactions"
  }
  \`\`\`

---

### 2. Transaction API

#### 2.1 Create and Send a Transaction
Tạo một giao dịch mới để gửi coin. Giao dịch sẽ được ký và đưa vào mempool chờ được đào.

- **Endpoint:** `POST /transactions`
- **Method:** `POST`
- **Request Body (JSON, required):**
  \`\`\`json
  {
  "sender_private_key": "your_hex_encoded_private_key",
  "sender_address": "1SENDER...",
  "recipient_address": "1RECIPIENT...",
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
- **Error Response (400 Bad Request):**
  \`\`\`json
  {
  "error": "Insufficient funds"
  }
  \`\`\`

---

### 3. Blockchain & Mining API

#### 3.1 Mine a New Block
Kích hoạt quá trình đào một block mới, gom các giao dịch từ mempool và nhận phần thưởng.

- **Endpoint:** `POST /blockchain/mine`
- **Method:** `POST`
- **Request Body (JSON, required):**
  \`\`\`json
  {
  "miner_address": "1MINER..."
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
  \`\`\`
- **Response when no transactions are in mempool (200 OK):**
  \`\`\`json
  {
  "message": "No pending transactions to mine. Genesis block created if not exists."
  }
  \`\`\`

---

### 4. Statistics & Explorer API

#### 4.1 Get Blockchain Summary
Lấy các thông số thống kê tổng quan về mạng lưới SanCoin.

- **Endpoint:** `GET /stats/summary`
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

#### 4.2 Get Latest Blocks
Lấy danh sách các block được đào gần đây nhất.

- **Endpoint:** `GET /blocks/latest`
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
  "miner_address": "1MINER..."
  },
  {
  "height": 123,
  "hash": "0000abcd...",
  "timestamp": 1678886400,
  "tx_count": 8,
  "miner_address": "1MINER..."
  }
  ]
  \`\`\`

#### 4.3 Get Latest Transactions
Lấy danh sách các giao dịch được xác nhận gần đây nhất (không bao gồm giao dịch coinbase).

- **Endpoint:** `GET /transactions/latest`
- **Method:** `GET`
- **Query Params:**
  - `limit` (int, optional, default: 5): Số lượng giao dịch muốn lấy.
- **Success Response (200 OK):**
  \`\`\`json
  [
  {
  "hash": "a1b2c3d4...",
  "from": "1SENDER...",
  "to": "1RECIPIENT...",
  "amount": 10,
  "timestamp": 1678886450
  }
  ]
