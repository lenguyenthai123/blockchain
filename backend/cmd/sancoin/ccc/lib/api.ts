const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

console.log("🔗 API Base URL:", API_BASE_URL)

export interface BlockchainInfo {
  totalBlocks: number
  difficulty: number
  pendingTransactions: number
  totalTransactions: number
  totalUTXOs?: number
  latestBlock: {
    index: number
    hash: string
    timestamp: number
    previousHash: string
    merkleRoot: string
    nonce: number
    difficulty: number
  }
}

export interface NetworkStats {
  totalBlocks: number
  difficulty: number
  pendingTransactions: number
  totalTransactions: number
  totalUTXOs: number
  networkHashRate: string
  averageBlockTime: string
  totalSupply: string
  circulatingSupply: number
  latestBlock: any
}

export interface Transaction {
  hash: string
  inputs?: TransactionInput[]
  outputs?: TransactionOutput[]
  timestamp: number
  type: string
  blockIndex?: number
  blockHash?: string
  blockTimestamp?: number
}

export interface TransactionInput {
  previousTxHash: string
  outputIndex: number
  signature: string
  publicKey: string
  sequence: number
}

export interface TransactionOutput {
  amount: number
  address: string
  scriptPubKey: string
}

export interface UTXO {
  txHash: string
  outputIndex: number
  amount: number
  address: string
  scriptPubKey: string
  blockHeight: number
}

export interface AddressBalance {
  address: string
  balance: number
}

export interface AddressTransactions {
  address: string
  transactions: Transaction[]
}

export interface Block {
  index: number
  timestamp: number
  transactions: Transaction[]
  previousHash: string
  hash: string
  nonce: number
  merkleRoot: string
  difficulty: number
}

export interface MempoolInfo {
  transactions: any[]
  count: number
}

export interface SearchResult {
  type: "transaction" | "block" | "address"
  result: any
}

class SanCoinAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    console.log(`🌐 API Request: ${options.method || "GET"} ${url}`)

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      console.log(`📡 API Response: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`📦 API Data:`, data)

      if (!data.success) {
        throw new Error(data.error || "API request failed")
      }

      return data.data
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error)

      // More specific error messages
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Is the server running?`)
      }

      throw error
    }
  }

  // Health checks
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL.replace("/api", "")}/health`)
      const data = await response.json()
      console.log("🏥 Health check:", data)
      return data
    } catch (error) {
      console.error("❌ Health check failed:", error)
      throw new Error(`Backend health check failed: ${error.message}`)
    }
  }

  async apiHealthCheck() {
    return this.request("/health")
  }

  // Blockchain Info
  async getBlockchainInfo(): Promise<BlockchainInfo> {
    return this.request("/blockchain/info")
  }

  async getNetworkStats(): Promise<NetworkStats> {
    return this.request("/blockchain/stats")
  }

  // Balance
  async getBalance(address: string): Promise<AddressBalance> {
    console.log(`💰 Getting balance for address: ${address}`)
    return this.request(`/blockchain/balance/${address}`)
  }

  // UTXOs
  async getUTXOs(address: string): Promise<UTXO[]> {
    console.log(`🔗 Getting UTXOs for address: ${address}`)
    return this.request(`/blockchain/address/${address}/utxos`)
  }

  // Transactions
  async submitSignedTransaction(transaction: {
    hash: string
    inputs: TransactionInput[]
    outputs: TransactionOutput[]
    timestamp: number
    type: string
    minerAddress: string
  }) {
    console.log(`📤 Submitting signed transaction:`, transaction)
    return this.request("/blockchain/submit-signed-transaction", {
      method: "POST",
      body: JSON.stringify(transaction),
    })
  }

  async createTransaction(fromAddress: string, toAddress: string, amount: number) {
    return this.request("/blockchain/create-transaction", {
      method: "POST",
      body: JSON.stringify({ fromAddress, toAddress, amount }),
    })
  }

  async submitTransaction(transaction: {
    fromAddress: string
    toAddress: string
    amount: number
    signature: string
  }) {
    return this.request("/blockchain/transaction", {
      method: "POST",
      body: JSON.stringify(transaction),
    })
  }

  async getTransaction(hash: string) {
    return this.request(`/blockchain/transaction/${hash}`)
  }

  async getAddressTransactions(address: string): Promise<AddressTransactions> {
    console.log(`📋 Getting transactions for address: ${address}`)
    return this.request(`/blockchain/address/${address}/transactions`)
  }

  // Blocks
  async getBlock(index: number): Promise<Block> {
    return this.request(`/blockchain/block/${index}`)
  }

  async getBlockByHash(hash: string): Promise<Block> {
    return this.request(`/blockchain/block/hash/${hash}`)
  }

  async getLatestBlocks(limit = 10): Promise<Block[]> {
    return this.request(`/blockchain/blocks/latest?limit=${limit}`)
  }

  // Mempool
  async getMempool(limit = 50): Promise<MempoolInfo> {
    return this.request(`/blockchain/mempool?limit=${limit}`)
  }

  // Search
  async search(query: string): Promise<SearchResult> {
    return this.request(`/blockchain/search/${encodeURIComponent(query)}`)
  }

  // Mining
  async mineBlock(minerAddress: string) {
    return this.request("/blockchain/mine", {
      method: "POST",
      body: JSON.stringify({ minerAddress }),
    })
  }

  // UTXO Stats
  async getUTXOStats() {
    return this.request("/blockchain/utxo-stats")
  }
}

export const sanCoinAPI = new SanCoinAPI()
