import {generateAddress} from "./crypto"
import { SecureWalletStorage } from "@/lib/wallet-storage"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface UTXOInput {
  previousTxHash: string
  outputIndex: number
  signature: string
  publicKey: string
  sequence: number
}

export interface UTXOOutput {
  amount: number
  address: string
  scriptPubKey: string
}

export interface UTXOTransaction {
  hash: string
  inputs: UTXOInput[]
  outputs: UTXOOutput[]
  timestamp: number
  type: "transfer" | "coinbase"
  blockIndex: number
  blockHash: string
  blockTimestamp: number
}

export interface TransactionWithDirection extends UTXOTransaction {
  direction: "sent" | "received" | "self"
  netAmount: number
  fee: number
  counterpartyAddress: string
}
export interface ExplorerTransaction {
  hash: string
  from: string
  to: string
  amount: number
  fee: number
  timestamp: number
  status: "confirmed" | "pending" | "failed"
  blockNumber?: number
}

export interface NetworkStats {
  totalSupply: number
  circulatingSupply: number
  totalTransactions: number
  totalBlocks: number
  difficulty: number
  hashRate: string
  blockTime: number
  pendingTransactions: number
}

export interface AddressInfo {
  address: string
  balance: number
  transactionCount: number
  totalReceived: number
  totalSent: number
}
export interface ExplorerStats {
  totalBlocks: number
  totalTransactions: number
  totalAddresses?: number
  hashRate?: string
  difficulty?: number
  networkStatus?: "online" | "offline"
  [key: string]: any
}
export interface ExplorerBlock {
  number: number
  hash: string
  timestamp: number
  transactions: number
  miner: string
  size: number
}
interface ApiBlock {
  index: number
  hash: string
  previousHash: string
  timestamp: number
  transactions: ApiTransaction[]
  nonce: number
  difficulty: number
  merkleRoot: string
  // backend may include extra fields; we keep flexible
  [key: string]: any
}
interface ApiTransaction {
  hash: string
  inputs: {
    previousTxHash: string
    outputIndex: number
    signature: string
    publicKey: string
    sequence: number
  }[]
  outputs: {
    amount: number
    address: string
    scriptPubKey: string
  }[]
  timestamp: number
  type: string // "coinbase" | "transfer" | etc.
  minerAddress?: string
  blockIndex?: number
  [key: string]: any
}
// Internal helpers
async function request<T = any>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return (await res.json()) as T
}

function unwrapDataArray<T>(payload: any): T[] {
  // Your backend returns { success: true, data: [...] }
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.data)) return payload.data as T[]
  return []
}

export class SanCoinAPI {
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }

    console.log(`🌐 [utxoApi] ${config.method || "GET"} ${url}`)
    const res = await fetch(url, config)
    if (!res.ok) {
      const text = await res.text()
      console.error("❌ [utxoApi] Error:", res.status, text)
      throw new Error(`API error ${res.status}: ${text}`)
    }
    const json = (await res.json()) as T
    return json
  }
  private baseURL: string
  // import this context: useWallet() should only be used inside React components or hooks, not here.
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
  }

  async getBalance(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/api/utxo/balance/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.balance || 0
    } catch (error) {
      console.error("Error fetching balance:", error)
      return 0
    }
  }
  
  // GET /api/blockchain/blocks/latest?limit=5
  async getLatestBlocks(limit = 5): Promise<{ blocks: ExplorerBlock[] }> {
    const payload = await request(`/api/blockchain/blocks/latest?limit=${limit}`)
    const items = unwrapDataArray<any>(payload)

    const blocks: ExplorerBlock[] = items.map((b: any) => {
      const txCount = Array.isArray(b.transactions) ? b.transactions.length : Number(b.transactions ?? 0) || 0
      const size = new Blob([JSON.stringify(b)]).size

      return {
        number: Number(b.index ?? b.number ?? 0),
        hash: String(b.hash),
        timestamp: Number(b.timestamp ?? Date.now()),
        transactions: txCount,
        miner: "unknown", // Not present in this endpoint's payload
        size,
      }
    })

    return { blocks }
  }
  async getUTXOs(address: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/utxo/utxos/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.utxos || []
    } catch (error) {
      console.error("Error fetching UTXOs:", error)
      return []
    }
  }

  async sendTransaction(transaction: any): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/utxo/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Transaction failed" }
      }

      return { success: true, txHash: data.txHash }
    } catch (error) {
      console.error("Error sending transaction:", error)
      return { success: false, error: "Network error" }
    }
  }

  async getTransaction(hash: string): Promise<UTXOTransaction | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/utxo/transaction/${hash}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.transaction || null
    } catch (error) {
      console.error("Error fetching transaction:", error)
      return null
    }
  }

  async getTransactionHistory(address: string, limit = 50): Promise<TransactionWithDirection[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/blockchain/address/${address}/transactions?limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const transactions: UTXOTransaction[] = data.data?.transactions || []

      // Process transactions to determine direction and amounts
      return transactions.map((tx) => this.processTransactionDirection(tx, address))
    } catch (error) {
      console.error("Error fetching transaction history:", error)
      return []
    }
  }

  private processTransactionDirection(tx: UTXOTransaction, address: string): TransactionWithDirection {
    const userAddress = address
    // Get the address after wallet is loaded
    // const userAddress = wallet?.address
    
    let direction: "sent" | "received" | "self" = "received"
    let netAmount = 0
    let fee = 0
    let counterpartyAddress = ""

    const senderAddress = generateAddress(Buffer.from(tx.inputs[0]?.publicKey || "", "hex"))
    console.log("Sender address:", senderAddress)
    console.log("User address:", userAddress)
    
    if(userAddress === senderAddress) {
      // User is the sender
      direction = "sent"
    }
    else{
      direction = "received"
    }

    if (tx.type === "coinbase") {
      // Coinbase transaction - always received
      netAmount = tx.outputs.find((output) => output.address === userAddress)?.amount || 0
      counterpartyAddress = "Coinbase"
    } else {
      // Regular transfer transaction
      const inputsFromUser = tx.inputs.filter((input) => {
        // For regular transactions, we need to check if this input belongs to user
        // This is complex without UTXO data, so we'll use a heuristic
        return input.publicKey !== "" // User's inputs will have signatures
      })

      const outputsToUser = tx.outputs.filter((output) => output.address === userAddress)
      const outputsFromUser = tx.outputs.filter((output) => output.address !== userAddress)

      const totalReceived = outputsToUser.reduce((sum, output) => sum + output.amount, 0)
      const totalSent = outputsFromUser.reduce((sum, output) => sum + output.amount, 0)


      // Determine if user is sender or receiver
      const userIsSender = userAddress === senderAddress
      const userIsReceiver = userAddress !== senderAddress

      if (userIsSender && userIsReceiver) {
        // Self transaction or change
        if (outputsFromUser.length === 0) {
          netAmount = 0
        } else {
          netAmount = totalSent
          fee = 0.001 // Estimated fee
          counterpartyAddress = outputsFromUser[0]?.address || ""
        }
      } else if (userIsSender) {
        netAmount = totalSent
        fee = 0.001 // Estimated fee
        counterpartyAddress = outputsFromUser[0]?.address || ""
      } else if (userIsReceiver) {
        netAmount = totalReceived
        counterpartyAddress = senderAddress // We don't have sender info easily
      }
    }

    return {
      ...tx,
      direction,
      netAmount,
      fee,
      counterpartyAddress,
    }
  }

  async getAddressInfo(address: string): Promise<AddressInfo | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/utxo/address/${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.addressInfo || null
    } catch (error) {
      console.error("Error fetching address info:", error)
      return null
    }
  }

  async getNetworkStats(): Promise<NetworkStats | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/utxo/stats`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.stats || null
    } catch (error) {
      console.error("Error fetching network stats:", error)
      return null
    }
  }
    // Stats for Explorer header cards
  async getBlockchainStats(): Promise<ExplorerStats> {
    // Reuse the existing blockchain stats route
    const stats = await this.request<ExplorerStats>("/api/blockchain/stats")
    return stats
  }

  // GET /api/blockchain/transactions/latest?limit=5
  async getLatestTransactions(limit = 5): Promise<{ transactions: ExplorerTransaction[] }> {
    const payload = await request(`/api/blockchain/transactions/latest?limit=${limit}`)
    const items = unwrapDataArray<any>(payload)

    const transactions: ExplorerTransaction[] = items.map((it: any) => {
      const isCoinbase = String(it.type || "").toLowerCase() === "coinbase"
      const status: ExplorerTransaction["status"] = typeof it.blockIndex === "number" ? "confirmed" : "pending"

      // This endpoint does not include from/to addresses or fee; we surface known fields
      return {
        hash: it.hash,
        from: isCoinbase ? "Coinbase" : "unknown",
        to: "unknown",
        amount: Number(it.amount ?? 0),
        fee: 0,
        timestamp: Number(it.timestamp ?? Date.now()),
        status,
        blockNumber: it.blockIndex,
      }
    })

    return { transactions }
  }
}

export const sanCoinAPI = new SanCoinAPI()
