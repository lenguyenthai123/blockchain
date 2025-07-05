// Mock blockchain API functions for ThaiCoin
export interface Transaction {
  id: string
  hash: string
  tx_hash: string
  from: string
  from_address: string
  to: string
  to_address: string
  amount: number
  value: number
  fee: number
  gas_used: number
  gas_price: number
  timestamp: string
  status: "pending" | "confirmed" | "failed"
  block_number: number
  confirmations: number
  type: "send" | "receive"
}

export interface Block {
  number: number
  hash: string
  timestamp: string
  transactions: number
  miner: string
  gas_used: number
  gas_limit: number
  size: number
}

export interface NetworkStats {
  blockHeight: number
  totalTransactions: number
  hashRate: string
  difficulty: string
  gasPrice: number
  activeNodes: number
  networkHealth: "healthy" | "warning" | "critical"
}

export interface WalletStats {
  balance: number
  totalTransactions: number
  totalSent: number
  totalReceived: number
  pendingTransactions: number
}

export interface PriceData {
  price: number
  change: number
  changePercent: string
  volume24h: number
  marketCap: number
}

// Generate consistent mock addresses
const generateAddress = (seed: string): string => {
  const chars = "0123456789abcdef"
  let result = "0x"
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff
  }
  for (let i = 0; i < 40; i++) {
    result += chars[Math.abs(hash + i) % 16]
  }
  return result
}

// Generate consistent transaction hash
const generateTxHash = (seed: string): string => {
  const chars = "0123456789abcdef"
  let result = "0x"
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff
  }
  for (let i = 0; i < 64; i++) {
    result += chars[Math.abs(hash + i) % 16]
  }
  return result
}

// Mock data generators
const mockAddresses = [
  generateAddress("alice"),
  generateAddress("bob"),
  generateAddress("charlie"),
  generateAddress("david"),
  generateAddress("eve"),
]

export async function getNetworkStats(): Promise<NetworkStats> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    blockHeight: 2201834 + Math.floor(Math.random() * 100),
    totalTransactions: 15847392 + Math.floor(Math.random() * 1000),
    hashRate: `${(125.5 + Math.random() * 10).toFixed(1)} TH/s`,
    difficulty: `${(8.2 + Math.random()).toFixed(2)}T`,
    gasPrice: 12 + Math.floor(Math.random() * 8),
    activeNodes: 1247 + Math.floor(Math.random() * 100),
    networkHealth: Math.random() > 0.1 ? "healthy" : "warning",
  }
}

export async function getMyCoinPrice(): Promise<PriceData> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const basePrice = 12.57
  const change = (Math.random() - 0.5) * 2
  const price = basePrice + change

  return {
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(4)),
    changePercent: `${change >= 0 ? "+" : ""}${((change / basePrice) * 100).toFixed(2)}`,
    volume24h: 2847392 + Math.floor(Math.random() * 100000),
    marketCap: 125847392 + Math.floor(Math.random() * 1000000),
  }
}

export async function getLatestBlocks(limit = 10): Promise<Block[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const blocks: Block[] = []
  const currentBlock = 2201834

  for (let i = 0; i < limit; i++) {
    blocks.push({
      number: currentBlock - i,
      hash: generateTxHash(`block-${currentBlock - i}`),
      timestamp: new Date(Date.now() - i * 15000).toISOString(),
      transactions: 150 + Math.floor(Math.random() * 100),
      miner: mockAddresses[i % mockAddresses.length],
      gas_used: 8000000 + Math.floor(Math.random() * 2000000),
      gas_limit: 10000000,
      size: 50000 + Math.floor(Math.random() * 20000),
    })
  }

  return blocks
}

export async function getLatestTransactions(limit = 10): Promise<Transaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const transactions: Transaction[] = []

  for (let i = 0; i < limit; i++) {
    const hash = generateTxHash(`tx-${Date.now()}-${i}`)
    const from = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
    const to = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
    const amount = Number((Math.random() * 100).toFixed(4))

    transactions.push({
      id: `tx-${i}`,
      hash,
      tx_hash: hash,
      from,
      from_address: from,
      to,
      to_address: to,
      amount,
      value: amount,
      fee: Number((Math.random() * 0.01).toFixed(6)),
      gas_used: 21000 + Math.floor(Math.random() * 50000),
      gas_price: 12 + Math.floor(Math.random() * 8),
      timestamp: new Date(Date.now() - i * 30000).toISOString(),
      status: Math.random() > 0.1 ? "confirmed" : "pending",
      block_number: 2201834 - Math.floor(i / 3),
      confirmations: Math.floor(Math.random() * 100),
      type: Math.random() > 0.5 ? "send" : "receive",
    })
  }

  return transactions
}

export async function getWalletBalance(address: string): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Generate consistent balance based on address
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) & 0xffffffff
  }

  return Number((Math.abs(hash % 10000) / 100).toFixed(4))
}

export async function getWalletStats(address: string): Promise<WalletStats> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const balance = await getWalletBalance(address)

  return {
    balance,
    totalTransactions: 45 + Math.floor(Math.random() * 100),
    totalSent: Number((balance * 0.6).toFixed(4)),
    totalReceived: Number((balance * 1.4).toFixed(4)),
    pendingTransactions: Math.floor(Math.random() * 3),
  }
}

export async function getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const transactions: Transaction[] = []

  for (let i = 0; i < limit; i++) {
    const hash = generateTxHash(`history-${address}-${i}`)
    const isOutgoing = Math.random() > 0.5
    const otherAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
    const amount = Number((Math.random() * 50).toFixed(4))

    transactions.push({
      id: `history-${i}`,
      hash,
      tx_hash: hash,
      from: isOutgoing ? address : otherAddress,
      from_address: isOutgoing ? address : otherAddress,
      to: isOutgoing ? otherAddress : address,
      to_address: isOutgoing ? otherAddress : address,
      amount,
      value: amount,
      fee: Number((Math.random() * 0.005).toFixed(6)),
      gas_used: 21000 + Math.floor(Math.random() * 30000),
      gas_price: 10 + Math.floor(Math.random() * 10),
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      status: Math.random() > 0.05 ? "confirmed" : "pending",
      block_number: 2201834 - Math.floor(i / 2),
      confirmations: Math.floor(Math.random() * 200),
      type: isOutgoing ? "send" : "receive",
    })
  }

  return transactions
}

export async function getTransactionDetails(hash: string): Promise<Transaction | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Generate consistent transaction details based on hash
  let hashNum = 0
  for (let i = 0; i < hash.length; i++) {
    hashNum = ((hashNum << 5) - hashNum + hash.charCodeAt(i)) & 0xffffffff
  }

  const from = mockAddresses[Math.abs(hashNum) % mockAddresses.length]
  const to = mockAddresses[Math.abs(hashNum + 1) % mockAddresses.length]
  const amount = Number((Math.abs(hashNum % 10000) / 100).toFixed(4))

  return {
    id: hash,
    hash,
    tx_hash: hash,
    from,
    from_address: from,
    to,
    to_address: to,
    amount,
    value: amount,
    fee: Number((Math.random() * 0.01).toFixed(6)),
    gas_used: 21000 + Math.floor(Math.random() * 50000),
    gas_price: 12 + Math.floor(Math.random() * 8),
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    status: Math.random() > 0.1 ? "confirmed" : "pending",
    block_number: 2201834 - Math.floor(Math.random() * 100),
    confirmations: Math.floor(Math.random() * 100),
    type: Math.random() > 0.5 ? "send" : "receive",
  }
}

export async function estimateTransactionFee(
  to: string,
  amount: number,
): Promise<{
  gasEstimate: number
  gasPrice: number
  totalFee: number
  totalFeeUSD: number
}> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Validate inputs
  if (!to || amount <= 0) {
    throw new Error("Invalid transaction parameters")
  }

  // Base gas for simple transfer
  const baseGas = 21000
  // Additional gas for complex transactions
  const additionalGas = Math.floor(Math.random() * 10000)
  const gasEstimate = baseGas + additionalGas

  // Current gas price in Gwei
  const gasPrice = 12 + Math.floor(Math.random() * 8)

  // Calculate total fee in THC
  const totalFeeWei = gasEstimate * gasPrice * 1e9 // Convert Gwei to Wei
  const totalFee = totalFeeWei / 1e18 // Convert Wei to THC

  // Ensure minimum fee
  const finalFee = Math.max(totalFee, 0.0001)

  // Convert to USD (assuming 1 THC = $12.57)
  const totalFeeUSD = finalFee * 12.57

  return {
    gasEstimate,
    gasPrice,
    totalFee: Number(finalFee.toFixed(6)),
    totalFeeUSD: Number(totalFeeUSD.toFixed(4)),
  }
}

export async function sendTransaction(
  from: string,
  to: string,
  amount: number,
  gasPrice?: number,
): Promise<{
  success: boolean
  hash?: string
  error?: string
}> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Validate inputs
  if (!from || !to || amount <= 0) {
    return {
      success: false,
      error: "Invalid transaction parameters",
    }
  }

  // Simulate occasional failures
  if (Math.random() < 0.1) {
    return {
      success: false,
      error: "Insufficient gas or network congestion",
    }
  }

  // Generate transaction hash
  const hash = generateTxHash(`send-${from}-${to}-${amount}-${Date.now()}`)

  return {
    success: true,
    hash,
  }
}

export async function getBlockByNumber(blockNumber: number): Promise<Block | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (blockNumber < 0 || blockNumber > 2201834) {
    return null
  }

  return {
    number: blockNumber,
    hash: generateTxHash(`block-${blockNumber}`),
    timestamp: new Date(Date.now() - (2201834 - blockNumber) * 15000).toISOString(),
    transactions: 100 + Math.floor(Math.random() * 200),
    miner: mockAddresses[blockNumber % mockAddresses.length],
    gas_used: 7000000 + Math.floor(Math.random() * 3000000),
    gas_limit: 10000000,
    size: 40000 + Math.floor(Math.random() * 30000),
  }
}

export async function getTransactionByHash(hash: string): Promise<Transaction | null> {
  return getTransactionDetails(hash)
}

// WebSocket simulation for real-time updates
export function subscribeToUpdates(callback: (data: any) => void): () => void {
  const interval = setInterval(async () => {
    const updates = {
      newBlock: Math.random() < 0.1,
      newTransaction: Math.random() < 0.3,
      priceUpdate: Math.random() < 0.2,
      networkStats: await getNetworkStats(),
    }
    callback(updates)
  }, 5000)

  return () => clearInterval(interval)
}

// Health check function
export async function checkNetworkHealth(): Promise<{
  status: "healthy" | "degraded" | "down"
  latency: number
  blockHeight: number
}> {
  const start = Date.now()
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 100))
  const latency = Date.now() - start

  return {
    status: latency < 50 ? "healthy" : latency < 100 ? "degraded" : "down",
    latency,
    blockHeight: 2201834 + Math.floor(Math.random() * 10),
  }
}
