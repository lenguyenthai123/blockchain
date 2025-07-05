const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Wallet endpoints
  async createWallet(password: string) {
    return this.request("/wallet/create", {
      method: "POST",
      body: JSON.stringify({ password }),
    })
  }

  async importWalletFromPrivateKey(privateKey: string, password: string) {
    return this.request("/wallet/import/private-key", {
      method: "POST",
      body: JSON.stringify({ private_key: privateKey, password }),
    })
  }

  async importWalletFromMnemonic(mnemonic: string, password: string) {
    return this.request("/wallet/import/mnemonic", {
      method: "POST",
      body: JSON.stringify({ mnemonic, password }),
    })
  }

  async getWalletBalance(address: string): Promise<{ balance: number }> {
    return this.request(`/wallet/${address}/balance`)
  }

  async getWalletStats(address: string) {
    return this.request(`/wallet/${address}/stats`)
  }

  // Transaction endpoints
  async sendTransaction(data: {
    from: string
    to: string
    amount: number
    gas_price: number
    message?: string
    private_key: string
  }) {
    return this.request("/transaction/send", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async estimateTransactionFee(to: string, amount: number, gasPrice: number) {
    return this.request("/transaction/estimate-fee", {
      method: "POST",
      body: JSON.stringify({ to, amount, gas_price: gasPrice }),
    })
  }

  async getLatestTransactions(limit = 6) {
    return this.request(`/transaction/latest?limit=${limit}`)
  }

  async getTransactionDetails(hash: string) {
    return this.request(`/transaction/${hash}`)
  }

  async getTransactionHistory(address: string, limit = 50) {
    return this.request(`/transaction/history/${address}?limit=${limit}`)
  }

  // Blockchain endpoints
  async getLatestBlocks(limit = 6) {
    return this.request(`/blockchain/blocks/latest?limit=${limit}`)
  }

  async getBlock(number: number) {
    return this.request(`/blockchain/blocks/${number}`)
  }

  async getNetworkStats() {
    return this.request("/blockchain/stats")
  }

  async getMyCoinPrice() {
    return this.request("/blockchain/price")
  }

  // Network endpoints
  async createStake(userAddress: string, poolId: number, stakedAmount: number) {
    return this.request("/network/stake", {
      method: "POST",
      body: JSON.stringify({
        user_address: userAddress,
        pool_id: poolId,
        staked_amount: stakedAmount,
      }),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
