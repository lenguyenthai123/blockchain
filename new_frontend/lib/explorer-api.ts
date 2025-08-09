const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

type Json = Record<string, any>

async function request<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    // Note: keep credentials omitted for same-site APIs unless required
    ...init,
    // Cache can be tuned per request; default no-store for freshest explorer data
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${res.status} ${path}: ${text || res.statusText}`)
  }
  return (await res.json()) as T
}

function getDataObject<T extends object = any>(payload: any): T {
  if (payload && typeof payload.data === "object") return payload.data as T
  return (payload || {}) as T
}

function getDataArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (Array.isArray(payload?.data)) return payload.data as T[]
  return []
}
export interface BackendStats {
  totalBlocks: number
  difficulty: number
  pendingTransactions: number
  totalTransactions: number
  totalUTXOs: number
  latestBlock: {
    index: number
    hash: string
    previousHash: string
    merkleRoot: string
    timestamp: number
    nonce: number
    difficulty: number
  }
  networkHashRate: string
  averageBlockTime: string
  totalSupply: string
  circulatingSupply: number
}

export interface BlockTxItem {
  hash: string
  timestamp: number
  type: string // "coinbase" | "transfer" | ...
}

export interface BlockDetail {
  index: number
  hash: string
  previousHash: string
  merkleRoot: string
  timestamp: number
  nonce: number
  difficulty: number
  transactions: BlockTxItem[]
}
export interface TxInput {
  previousTxHash: string
  outputIndex: number
  signature: string
  publicKey?: string
  sequence?: number
}
export interface AddressBalance {
  address: string
  balance: number
}
export interface TxOutput {
  amount: number
  address: string
  scriptPubKey?: string
}

export interface TransactionDetail {
  hash: string
  inputs: TxInput[]
  outputs: TxOutput[]
  timestamp: number
  type: string // "transfer" | "coinbase"
}

export interface TxBlockRef {
  index: number
  hash: string
  timestamp: number
}

export interface TransactionByHash {
  transaction: TransactionDetail
  block: TxBlockRef
  status: "confirmed" | "pending" | string
}

export const explorerApi = {
  async getBlockByIndex(index: number): Promise<BlockDetail> {
    const payload = await request<Json>(`/api/blockchain/block/${index}`)
    const data = getDataObject<BlockDetail>(payload)

    return {
      index: Number(data.index ?? 0),
      hash: String(data.hash ?? ""),
      previousHash: String(data.previousHash ?? ""),
      merkleRoot: String(data.merkleRoot ?? ""),
      timestamp: Number(data.timestamp ?? 0),
      nonce: Number(data.nonce ?? 0),
      difficulty: Number(data.difficulty ?? 0),
      transactions: getDataArray<BlockTxItem>({ data: data.transactions ?? [] }).map((t) => ({
        hash: String(t.hash ?? ""),
        timestamp: Number(t.timestamp ?? 0),
        type: String(t.type ?? "transfer"),
      })),
    }
  },
  async getTransactionByHash(hash: string): Promise<TransactionByHash> {
    const payload = await request<Json>(`/api/blockchain/transaction/${hash}`)
    const data = getDataObject<any>(payload)

    // Defensive normalization
    const tx = data.transaction ?? {}
    const block = data.block ?? {}

    return {
      transaction: {
        hash: String(tx.hash ?? ""),
        inputs: Array.isArray(tx.inputs) ? tx.inputs : [],
        outputs: Array.isArray(tx.outputs) ? tx.outputs : [],
        timestamp: Number(tx.timestamp ?? 0),
        type: String(tx.type ?? "transfer"),
      },
      block: {
        index: Number(block.index ?? 0),
        hash: String(block.hash ?? ""),
        timestamp: Number(block.timestamp ?? 0),
      },
      status: String(data.status ?? "pending"),
    }
  },
  // Optional helpers used elsewhere in Explorer
  async getLatestBlocks(limit = 5) {
    const payload = await request<Json>(`/api/blockchain/blocks/latest?limit=${limit}`)
    return getDataArray<any>(payload)
  },

  async getLatestTransactions(limit = 5) {
    const payload = await request<Json>(`/api/blockchain/transactions/latest?limit=${limit}`)
    return getDataArray<any>(payload)
  },

async getStats(): Promise<BackendStats> {
    const payload = await request<Json>("/api/blockchain/stats")
    return getDataObject<BackendStats>(payload)
  },
    async getAddressBalance(address: string): Promise<AddressBalance> {
    const payload = await request<Json>(`/api/blockchain/balance/${address}`)
    const data = getDataObject<AddressBalance>(payload)
    return {
      address: String(data.address ?? address),
      balance: Number(data.balance ?? 0),
    }
  },

}
