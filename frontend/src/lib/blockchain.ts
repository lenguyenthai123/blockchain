import { apiClient } from "./api"

export async function getWalletBalance(address: string): Promise<number> {
  try {
    const response = await apiClient.getWalletBalance(address)
    return response.balance
  } catch (error) {
    console.error("Failed to get wallet balance:", error)
    return 0
  }
}

export async function getWalletStats(address: string) {
  try {
    return await apiClient.getWalletStats(address)
  } catch (error) {
    console.error("Failed to get wallet stats:", error)
    return {
      totalTransactions: 0,
      totalSent: 0,
      totalReceived: 0,
      firstTransaction: null,
    }
  }
}

export async function getNetworkStats() {
  try {
    return await apiClient.getNetworkStats()
  } catch (error) {
    console.error("Failed to get network stats:", error)
    return {
      hashRate: "1.2",
      blockHeight: 0,
      avgBlockTime: "10.2",
      difficulty: 4,
      gasPrice: 15,
      totalTransactions: "0",
      tps: "0",
      lastFinalizedBlock: "0",
      lastSafeBlock: "0",
    }
  }
}

export async function estimateTransactionFee(to: string, amount: number, gasPrice: number): Promise<number> {
  try {
    const response = await apiClient.estimateTransactionFee(to, amount, gasPrice)
    return response.estimated_fee
  } catch (error) {
    console.error("Failed to estimate transaction fee:", error)
    return 0
  }
}

export async function sendTransaction(txData: {
  from: string
  to: string
  amount: number
  gasPrice: number
  message?: string
  privateKey: string
}): Promise<string> {
  try {
    const response = await apiClient.sendTransaction({
      from: txData.from,
      to: txData.to,
      amount: txData.amount,
      gas_price: txData.gasPrice,
      message: txData.message,
      private_key: txData.privateKey,
    })
    return response.transaction_hash
  } catch (error) {
    console.error("Failed to send transaction:", error)
    throw error
  }
}

export async function getTransactionHistory(address: string): Promise<any[]> {
  try {
    return await apiClient.getTransactionHistory(address)
  } catch (error) {
    console.error("Failed to get transaction history:", error)
    return []
  }
}

export async function getTransactionDetails(txHash: string): Promise<any | null> {
  try {
    return await apiClient.getTransactionDetails(txHash)
  } catch (error) {
    console.error("Failed to get transaction details:", error)
    return null
  }
}

export async function getMyCoinPrice() {
  try {
    return await apiClient.getMyCoinPrice()
  } catch (error) {
    console.error("Failed to get MyCoin price:", error)
    return {
      price: "12.45",
      change: 0,
      changePercent: "0.00",
      marketCap: "0",
    }
  }
}

export async function getLatestBlocks() {
  try {
    return await apiClient.getLatestBlocks()
  } catch (error) {
    console.error("Failed to get latest blocks:", error)
    return []
  }
}

export async function getLatestTransactions() {
  try {
    return await apiClient.getLatestTransactions()
  } catch (error) {
    console.error("Failed to get latest transactions:", error)
    return []
  }
}
