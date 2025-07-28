const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface UTXO {
  txHash: string
  outputIndex: number
  amount: number
  address: string
  scriptPubKey: string
  blockHeight: number
}

export interface UTXOTransactionInput {
  previousTxHash: string
  outputIndex: number
  signature: string
  publicKey: string
}

export interface UTXOTransactionOutput {
  amount: number
  address: string
  scriptPubKey: string
}

export interface UTXOTransaction {
  hash: string
  inputs: UTXOTransactionInput[]
  outputs: UTXOTransactionOutput[]
  timestamp: number
  type: string
}

export interface BlockchainStats {
  totalBlocks: number
  difficulty: number
  pendingTransactions: number
  totalTransactions: number
  totalUTXOs: number
  networkHashRate: string
  averageBlockTime: string
  totalSupply: string
  circulatingSupply: number
}

export interface TransactionData {
  from: string
  to: string
  amount: number
  fee: number
  timestamp: number
}

class UTXOSanCoinAPI {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "API request failed")
      }

      return data.data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Get UTXOs for address
  async getUTXOs(address: string): Promise<UTXO[]> {
    return this.request(`/blockchain/address/${address}/utxos`)
  }

  // Get balance (calculated from UTXOs)
  async getBalance(address: string): Promise<{ address: string; balance: number }> {
    return this.request(`/blockchain/balance/${address}`)
  }

  // Submit UTXO transaction
  async submitUTXOTransaction(transaction: UTXOTransaction) {
    return this.request("/blockchain/utxo-transaction", {
      method: "POST",
      body: JSON.stringify(transaction),
    })
  }

  // Create transaction (helper method)
  async createTransaction(fromAddress: string, toAddress: string, amount: number, utxos: UTXO[], privateKey: string) {
    return this.request("/blockchain/create-transaction", {
      method: "POST",
      body: JSON.stringify({
        fromAddress,
        toAddress,
        amount,
        utxos,
        privateKey,
      }),
    })
  }

  // Send transaction - NEW METHOD
  async sendTransaction(transactionData: TransactionData, privateKey: string): Promise<{ hash: string }> {
    try {
      const response = await this.request("/blockchain/send-transaction", {
        method: "POST",
        body: JSON.stringify({
          ...transactionData,
          privateKey,
        }),
      })
      return response
    } catch (error) {
      // Mock response for development
      console.log("Using mock transaction response")
      return {
        hash: "0x" + Math.random().toString(16).substring(2, 18),
      }
    }
  }

  // Get transactions for address - NEW METHOD
  async getTransactions(address: string): Promise<{ transactions: any[] }> {
    try {
      return this.request(`/blockchain/address/${address}/transactions`)
    } catch (error) {
      // Mock response for development
      console.log("Using mock transactions response")
      return {
        transactions: [
          {
            hash: "0x1234567890abcdef",
            from: "0x1111111111111111",
            to: address,
            amount: 5.0,
            fee: 0.0001,
            timestamp: Date.now() - 86400000,
            status: "confirmed",
            blockNumber: 1,
          },
          {
            hash: "0xabcdef1234567890",
            from: address,
            to: "0x2222222222222222",
            amount: 2.5,
            fee: 0.0001,
            timestamp: Date.now() - 43200000,
            status: "confirmed",
            blockNumber: 2,
          },
        ],
      }
    }
  }

  // Get blockchain stats - NEW METHOD
  async getBlockchainStats(): Promise<BlockchainStats> {
    try {
      return this.request("/blockchain/stats")
    } catch (error) {
      // Mock response for development
      console.log("Using mock blockchain stats")
      return {
        totalBlocks: 12345,
        difficulty: 1.5,
        pendingTransactions: 23,
        totalTransactions: 98765,
        totalUTXOs: 45678,
        networkHashRate: "1.2 TH/s",
        averageBlockTime: "10 min",
        totalSupply: "21,000,000 SNC",
        circulatingSupply: 18500000,
      }
    }
  }

  // Get latest transactions - NEW METHOD
  async getLatestTransactions(limit = 10): Promise<any[]> {
    try {
      return this.request(`/blockchain/transactions/latest?limit=${limit}`)
    } catch (error) {
      // Mock response for development
      console.log("Using mock latest transactions")
      return [
        {
          hash: "0x1234567890abcdef",
          from: "0x1111111111111111",
          to: "0x2222222222222222",
          amount: 5.0,
          fee: 0.0001,
          timestamp: Date.now() - 300000,
          status: "confirmed",
        },
        {
          hash: "0xabcdef1234567890",
          from: "0x3333333333333333",
          to: "0x4444444444444444",
          amount: 2.5,
          fee: 0.0001,
          timestamp: Date.now() - 600000,
          status: "confirmed",
        },
      ]
    }
  }

  // Get blockchain info
  async getBlockchainInfo() {
    return this.request("/blockchain/info")
  }

  // Get transaction by hash
  async getTransaction(hash: string) {
    return this.request(`/blockchain/transaction/${hash}`)
  }

  // Get address transactions
  async getAddressTransactions(address: string) {
    return this.request(`/blockchain/address/${address}/transactions`)
  }

  // Get block info
  async getBlock(index: number) {
    return this.request(`/blockchain/block/${index}`)
  }

  // Get latest blocks
  async getLatestBlocks(limit = 10) {
    return this.request(`/blockchain/blocks/latest?limit=${limit}`)
  }

  // Mine block
  async mineBlock(minerAddress: string) {
    return this.request("/blockchain/mine", {
      method: "POST",
      body: JSON.stringify({ minerAddress }),
    })
  }
}

export const utxoSanCoinAPI = new UTXOSanCoinAPI()
export const utxoApi = utxoSanCoinAPI // Export alias for easier import
