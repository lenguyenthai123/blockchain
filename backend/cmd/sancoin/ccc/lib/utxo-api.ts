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
