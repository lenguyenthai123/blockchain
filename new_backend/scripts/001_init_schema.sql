-- Bảng lưu trữ thông tin các block
CREATE TABLE IF NOT EXISTS blocks (
    hash VARCHAR(64) PRIMARY KEY,
    prev_block_hash VARCHAR(64),
    height BIGINT NOT NULL,
    timestamp BIGINT NOT NULL,
    nonce BIGINT NOT NULL,
    difficulty INT NOT NULL,
    merkle_root VARCHAR(64) NOT NULL
);

-- Bảng lưu trữ các giao dịch
CREATE TABLE IF NOT EXISTS transactions (
    tx_hash VARCHAR(64) PRIMARY KEY,
    block_hash VARCHAR(64) REFERENCES blocks(hash), -- Nullable for mempool txs
    version INT NOT NULL,
    locktime BIGINT NOT NULL,
    is_coinbase BOOLEAN DEFAULT FALSE,
    timestamp BIGINT NOT NULL
);

-- Bảng lưu trữ các input của giao dịch (spending UTXOs)
CREATE TABLE IF NOT EXISTS tx_inputs (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(64) REFERENCES transactions(tx_hash) ON DELETE CASCADE,
    prev_tx_hash VARCHAR(64) NOT NULL,
    vout_index INT NOT NULL,
    signature VARCHAR(256) NOT NULL,
    pub_key TEXT NOT NULL
);

-- Bảng lưu trữ các output của giao dịch (new UTXOs)
CREATE TABLE IF NOT EXISTS tx_outputs (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(64) REFERENCES transactions(tx_hash) ON DELETE CASCADE,
    vout_index INT NOT NULL,
    amount BIGINT NOT NULL, -- Store amount in smallest unit (e.g., satoshis)
    script_pub_key VARCHAR(256) NOT NULL, -- Address
    UNIQUE(tx_hash, vout_index)
);

-- Bảng UTXO (Unspent Transaction Outputs) để tra cứu nhanh
-- Bảng này được cập nhật mỗi khi một block mới được thêm vào
CREATE TABLE IF NOT EXISTS utxos (
    tx_hash VARCHAR(64) NOT NULL,
    vout_index INT NOT NULL,
    amount BIGINT NOT NULL,
    script_pub_key VARCHAR(256) NOT NULL,
    PRIMARY KEY (tx_hash, vout_index)
);

-- Index để tăng tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_blocks_height ON blocks(height);
CREATE INDEX IF NOT EXISTS idx_tx_block_hash ON transactions(block_hash);
CREATE INDEX IF NOT EXISTS idx_utxos_script_pub_key ON utxos(script_pub_key);
