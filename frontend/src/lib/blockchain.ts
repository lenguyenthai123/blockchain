// Mock blockchain data and API functions for ThaiCoin

export interface Block {
  number: number
  hash: string
  timestamp: number
  miner: string
  transactionCount: number
  reward: number
  gasUsed: number
  gasLimit: number
  difficulty: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: number
  gasPrice: number
  gasUsed: number
  timestamp: number
  status: "success" | "failed" | "pending"
  blockNumber: number
}

export interface NetworkStats {
  totalTransactions: string
  tps: string
  gasPrice: number
  hashRate: string
  blockHeight: number
  avgBlockTime: string
  difficulty: number
  lastFinalizedBlock: string
  lastSafeBlock: string
}

export interface WalletStats {
  totalTransactions: number
  totalSent: number
  totalReceived: number
  firstTransaction: string | null
}

export interface PriceData {
  price: string
  change: number
  changePercent: string
  marketCap: string
  volume24h: string
}

// Generate mock data
const generateMockAddress = (): string => {
  const chars = "0123456789abcdef"
  let result = "0x"
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const generateMockHash = (): string => {
  const chars = "0123456789abcdef"
  let result = "0x"
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Mock API functions
export const getNetworkStats = async (): Promise<NetworkStats> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    totalTransactions: (2847610000 + Math.floor(Math.random() * 1000)).toLocaleString(),
    tps: (15 + Math.random() * 10).toFixed(1),
    gasPrice: Math.floor(12 + Math.random() * 8),
    hashRate: (1.2 + Math.random() * 0.5).toFixed(1),
    blockHeight: 22817956 + Math.floor(Math.random() * 100),
    avgBlockTime: (9.8 + Math.random() * 1.4).toFixed(1),
    difficulty: 4,
    lastFinalizedBlock: (22817956 + Math.floor(Math.random() * 50)).toString(),
    lastSafeBlock: (22817988 + Math.floor(Math.random() * 20)).toString(),
  }
}

export const getMyCoinPrice = async (): Promise<PriceData> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const basePrice = 12.45
  const change = (Math.random() - 0.5) * 2 // -1 to 1
  const price = (basePrice + change).toFixed(2)

  return {
    price,
    change,
    changePercent: (change * 8).toFixed(2),
    marketCap: (298054191819 + Math.floor(Math.random() * 1000000000)).toLocaleString(),
    volume24h: (1234567890 + Math.floor(Math.random() * 100000000)).toLocaleString(),
  }
}

export const getLatestBlocks = async (): Promise<Block[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const blocks: Block[] = []
  const currentTime = Math.floor(Date.now() / 1000)

  for (let i = 0; i < 5; i++) {
    blocks.push({
      number: 22817956 - i,
      hash: generateMockHash(),
      timestamp: currentTime - i * 12, // 12 seconds per block
      miner: generateMockAddress(),
      transactionCount: Math.floor(50 + Math.random() * 200),
      reward: 2.5,
      gasUsed: Math.floor(8000000 + Math.random() * 4000000),
      gasLimit: 12000000,
      difficulty: 4 + Math.random() * 2,
    })
  }

  return blocks
}

export const getLatestTransactions = async (): Promise<Transaction[]> => {
  await new Promise((resolve) => setTimeout(resolve, 350))

  const transactions: Transaction[] = []
  const currentTime = Math.floor(Date.now() / 1000)

  for (let i = 0; i < 8; i++) {
    transactions.push({
      hash: generateMockHash(),
      from: generateMockAddress(),
      to: generateMockAddress(),
      value: Math.random() * 100 + 0.1,
      gasPrice: Math.floor(15 + Math.random() * 10),
      gasUsed: Math.floor(21000 + Math.random() * 50000),
      timestamp: currentTime - i * 5,
      status: Math.random() > 0.1 ? "success" : "failed",
      blockNumber: 22817956 - Math.floor(i / 3),
    })
  }

  return transactions
}

export const getWalletBalance = async (address: string): Promise<number> => {
  await new Promise((resolve) => setTimeout(resolve, 600))

  // Generate a consistent balance based on address
  const hash = address.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const balance = Math.abs(hash % 10000) / 100 + Math.random() * 50
  return Math.max(balance, 0.1)
}

export const getWalletStats = async (address: string): Promise<WalletStats> => {
  await new Promise((resolve) => setTimeout(resolve, 700))

  // Generate consistent stats based on address
  const hash = address.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const totalTransactions = Math.abs(hash % 100) + 5
  const totalSent = Math.abs(hash % 500) / 10 + Math.random() * 20
  const totalReceived = totalSent + Math.random() * 30 + 10

  return {
    totalTransactions,
    totalSent,
    totalReceived,
    firstTransaction: new Date(Date.now() - Math.abs(hash % 365) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }
}

export const getTransactionHistory = async (address: string): Promise<Transaction[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const transactions: Transaction[] = []
  const currentTime = Math.floor(Date.now() / 1000)

  // Generate consistent transaction history based on address
  const hash = address.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)

  const txCount = Math.abs(hash % 20) + 5

  for (let i = 0; i < txCount; i++) {
    const isOutgoing = Math.random() > 0.5
    transactions.push({
      hash: generateMockHash(),
      from: isOutgoing ? address : generateMockAddress(),
      to: isOutgoing ? generateMockAddress() : address,
      value: Math.random() * 50 + 0.01,
      gasPrice: Math.floor(15 + Math.random() * 10),
      gasUsed: Math.floor(21000 + Math.random() * 50000),
      timestamp: currentTime - i * 3600 * 24, // Daily transactions
      status: Math.random() > 0.05 ? "success" : "failed",
      blockNumber: 22817956 - Math.floor(i * 10),
    })
  }

  return transactions.sort((a, b) => b.timestamp - a.timestamp)
}

export const sendTransaction = async (
  from: string,
  to: string,
  amount: number,
  gasPrice: number,
  privateKey: string,
): Promise<{ hash: string; status: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate transaction validation
  if (!from || !to || amount <= 0) {
    throw new Error("Invalid transaction parameters")
  }

  if (Math.random() < 0.1) {
    throw new Error("Transaction failed: Insufficient gas or network error")
  }

  return {
    hash: generateMockHash(),
    status: "pending",
  }
}

export const getBlockByNumber = async (blockNumber: number): Promise<Block | null> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  if (blockNumber > 22817956 || blockNumber < 1) {
    return null
  }

  return {
    number: blockNumber,
    hash: generateMockHash(),
    timestamp: Math.floor(Date.now() / 1000) - (22817956 - blockNumber) * 12,
    miner: generateMockAddress(),
    transactionCount: Math.floor(50 + Math.random() * 200),
    reward: 2.5,
    gasUsed: Math.floor(8000000 + Math.random() * 4000000),
    gasLimit: 12000000,
    difficulty: 4 + Math.random() * 2,
  }
}

export const getTransactionByHash = async (hash: string): Promise<Transaction | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (!hash.startsWith("0x") || hash.length !== 66) {
    return null
  }

  return {
    hash,
    from: generateMockAddress(),
    to: generateMockAddress(),
    value: Math.random() * 100 + 0.1,
    gasPrice: Math.floor(15 + Math.random() * 10),
    gasUsed: Math.floor(21000 + Math.random() * 50000),
    timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
    status: Math.random() > 0.1 ? "success" : "failed",
    blockNumber: 22817956 - Math.floor(Math.random() * 1000),
  }
}

// Chart data for network visualization
export const getNetworkChartData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const data = []
  const now = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      transactions: Math.floor(800000 + Math.random() * 400000),
      volume: Math.floor(50000 + Math.random() * 30000),
      activeAddresses: Math.floor(25000 + Math.random() * 15000),
    })
  }

  return data
}

// Mining and staking functions
export const getMiningStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return {
    hashRate: (1.2 + Math.random() * 0.5).toFixed(1) + " TH/s",
    difficulty: (4 + Math.random() * 2).toFixed(2),
    blockReward: "2.5 THC",
    nextDifficultyAdjustment: Math.floor(Math.random() * 2016) + " blocks",
    estimatedNextDifficulty: (4 + Math.random() * 2).toFixed(2),
  }
}

export const getStakingInfo = async (address: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const balance = await getWalletBalance(address)
  const stakedAmount = balance * 0.1

  return {
    stakedAmount,
    stakingRewards: stakedAmount * 0.05, // 5% APY
    stakingPeriod: "30 days",
    nextReward: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    stakingAPY: "5.2%",
  }
}

// Utility functions
export const formatAddress = (address: string): string => {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatHash = (hash: string): string => {
  if (!hash) return ""
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`
}

export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)

  if (seconds < 60) return `${seconds} secs ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} mins ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

export const formatCurrency = (amount: number, currency = "THC"): string => {
  return `${amount.toFixed(4)} ${currency}`
}

export const formatUSD = (amount: number): string => {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// WebSocket simulation for real-time updates
export class BlockchainWebSocket {
  private callbacks: { [key: string]: Function[] } = {}
  private interval: NodeJS.Timeout | null = null

  connect() {
    console.log("🔗 Connecting to ThaiCoin WebSocket...")

    // Simulate real-time updates
    this.interval = setInterval(() => {
      this.emit("newBlock", {
        number: 22817956 + Math.floor(Math.random() * 100),
        hash: generateMockHash(),
        timestamp: Math.floor(Date.now() / 1000),
        transactionCount: Math.floor(50 + Math.random() * 200),
      })

      this.emit("newTransaction", {
        hash: generateMockHash(),
        from: generateMockAddress(),
        to: generateMockAddress(),
        value: Math.random() * 100,
        timestamp: Math.floor(Date.now() / 1000),
      })

      this.emit("priceUpdate", {
        price: (12.45 + (Math.random() - 0.5) * 2).toFixed(2),
        change: (Math.random() - 0.5) * 10,
      })
    }, 5000)
  }

  disconnect() {
    console.log("🔌 Disconnecting from ThaiCoin WebSocket...")
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback)
    }
  }

  private emit(event: string, data: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(data))
    }
  }
}

// Export singleton instance
export const blockchainWS = new BlockchainWebSocket()

// Health check function
export const checkNetworkHealth = async (): Promise<{
  status: "healthy" | "degraded" | "down"
  latency: number
  blockHeight: number
  peerCount: number
}> => {
  const start = Date.now()
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 200 + 50))
  const latency = Date.now() - start

  return {
    status: latency < 100 ? "healthy" : latency < 300 ? "degraded" : "down",
    latency,
    blockHeight: 22817956 + Math.floor(Math.random() * 100),
    peerCount: Math.floor(50 + Math.random() * 200),
  }
}
