"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from "recharts"
import { TrendingUp, TrendingDown, Minus, Activity, Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { sanCoinAPI, type TransactionWithDirection } from "@/lib/utxo-api"
import { generateAddress,generateMnemonic, mnemonicToKeyPair, type KeyPair } from "@/lib/crypto"

interface BalancePoint {
  timestamp: number
  balance: number
  date: string
  time: string
  txHash?: string
  txType?: string
  change?: number
}

interface PortfolioStats {
  change: number
  changePercent: number
  trend: "up" | "down" | "neutral"
  totalTransactions: number
  receivedCount: number
  sentCount: number
}

const TIME_RANGES = [
  { label: "24H", value: "24h", hours: 24 },
  { label: "7D", value: "7d", hours: 24 * 7 },
  { label: "30D", value: "30d", hours: 24 * 30 },
  { label: "All", value: "all", hours: 0 },
]

export default function PortfolioChart() {
  const { wallet, balance } = useWallet()
  const [transactions, setTransactions] = useState<TransactionWithDirection[]>([])
  const [selectedRange, setSelectedRange] = useState("7d")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get wallet address
  const address = wallet?.address

  useEffect(() => {
    if (address) {
      fetchTransactions()
    }
  }, [address])

  const fetchTransactions = async () => {
    if (!address) return

    try {
      setIsLoading(true)
      setError(null)

      console.log("📊 Fetching transactions for portfolio chart:", address)

      // Fetch transactions with userAddress parameter for proper direction calculation
      const data = await sanCoinAPI.getTransactionHistory(address, 200)

      console.log("📊 Portfolio transactions loaded:", {
        total: data.length,
        address,
        sample: data.slice(0, 3).map((tx) => ({
          hash: tx.hash?.slice(0, 8),
          direction: tx.direction,
          netAmount: tx.netAmount,
          type: tx.type,
        })),
      })

      setTransactions(data)
    } catch (err) {
      console.error("❌ Failed to fetch transactions for portfolio:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate balance history from transactions
  const balanceHistory = useMemo(() => {
    if (!transactions.length || !address) return []

    console.log("📈 Calculating balance history for:", address)

    // Sort transactions by timestamp (oldest first)
    const sortedTxs = [...transactions].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

    const history: BalancePoint[] = []
    let runningBalance = 0

    // Calculate balance at each transaction point
    sortedTxs.forEach((tx, index) => {
      let balanceChange = 0
      const senderAddress = generateAddress(Buffer.from(tx?.inputs?.[0]?.publicKey, "hex"))

      if (tx.type === "coinbase") {
        // Mining reward - always increases balance
        balanceChange = tx.netAmount || 0
      } else if (tx.direction === "received") {
        // Money received - increases balance
        balanceChange = tx.netAmount || 0
      } else if (tx.direction === "sent") {
        // Money sent - decreases balance (amount + fee)
        balanceChange = -((tx.netAmount || 0) + (tx.fee || 0))
      } else if (tx.direction === "self") {
        // Self transfer - only fee is lost
        balanceChange = -(tx.fee || 0)
      }

      runningBalance += balanceChange
      runningBalance = Math.max(0, runningBalance) // Safety check

      const date = new Date(tx.timestamp || 0)

      // Store balance point with transaction info
      history.push({
        timestamp: tx.timestamp || 0,
        balance: runningBalance,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        txHash: tx.hash,
        txType: tx.type,
        change: balanceChange, // Track the change for this transaction
      })

      console.log(`📊 Transaction ${index + 1}:`, {
        hash: tx.hash?.slice(0, 8),
        type: tx.type,
        direction: tx.direction,
        netAmount: tx.netAmount,
        fee: tx.fee,
        balanceChange,
        runningBalance,
      })
    })

    // Add current balance as the latest point if we have transactions
    if (history.length > 0 && balance !== runningBalance) {
      history.push({
        timestamp: Date.now(),
        balance: balance,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        change: balance - runningBalance,
      })
    }

    console.log("📈 Balance history calculated:", {
      totalPoints: history.length,
      startBalance: history[0]?.balance || 0,
      endBalance: history[history.length - 1]?.balance || 0,
      currentBalance: balance,
    })

    return history
  }, [transactions, balance, address])

  // Filter history by selected time range
  const filteredHistory = useMemo(() => {
    if (!balanceHistory.length) return []

    const range = TIME_RANGES.find((r) => r.value === selectedRange)
    if (!range || range.value === "all") return balanceHistory

    const cutoffTime = Date.now() - range.hours * 60 * 60 * 1000

    // Find the last point before cutoff time
    const beforeCutoff = balanceHistory.filter((point) => point.timestamp < cutoffTime)
    const afterCutoff = balanceHistory.filter((point) => point.timestamp >= cutoffTime)

    let filtered: BalancePoint[] = []

    // If we have points before cutoff, use the last one as starting point
    if (beforeCutoff.length > 0) {
      const lastBeforeCutoff = beforeCutoff[beforeCutoff.length - 1]
      // Create a synthetic point at cutoff time with the last known balance
      filtered.push({
        ...lastBeforeCutoff,
        timestamp: cutoffTime,
        date: new Date(cutoffTime).toLocaleDateString(),
        time: new Date(cutoffTime).toLocaleTimeString(),
      })
    }

    // Add all points after cutoff
    filtered = [...filtered, ...afterCutoff]

    // If no points in range, create points with current balance
    if (filtered.length === 0) {
      const now = Date.now()
      filtered = [
        {
          timestamp: cutoffTime,
          balance: balance,
          date: new Date(cutoffTime).toLocaleDateString(),
          time: new Date(cutoffTime).toLocaleTimeString(),
        },
        {
          timestamp: now,
          balance: balance,
          date: new Date(now).toLocaleDateString(),
          time: new Date(now).toLocaleTimeString(),
        },
      ]
    }

    return filtered
  }, [balanceHistory, selectedRange, balance])

  // Calculate portfolio statistics
  const portfolioStats = useMemo((): PortfolioStats => {
    if (!filteredHistory.length) {
      return {
        change: 0,
        changePercent: 0,
        trend: "neutral",
        totalTransactions: 0,
        receivedCount: 0,
        sentCount: 0,
      }
    }

    const startBalance = filteredHistory[0].balance
    const endBalance = filteredHistory[filteredHistory.length - 1].balance
    const change = endBalance - startBalance
    const changePercent = startBalance > 0 ? (change / startBalance) * 100 : 0

    // Determine trend
    let trend: "up" | "down" | "neutral" = "neutral"
    if (Math.abs(change) > 0.001) {
      // Only consider significant changes
      trend = change > 0 ? "up" : "down"
    }

    // Count transactions by type
    const totalTransactions = transactions.length
    const receivedCount = transactions.filter((tx) => tx.direction === "received" || tx.type === "coinbase").length
    const sentCount = transactions.filter((tx) => tx.direction === "sent").length

    return {
      change,
      changePercent,
      trend,
      totalTransactions,
      receivedCount,
      sentCount,
    }
  }, [filteredHistory, transactions])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Balance: ${payload[0].value.toFixed(4)} SNC`}</p>
          <p className="text-sm text-muted-foreground">{`${data.date} ${data.time}`}</p>
          {data.change && (
            <p className={`text-sm ${data.change > 0 ? "text-green-600" : "text-red-600"}`}>
              {`Change: ${data.change > 0 ? "+" : ""}${data.change.toFixed(4)} SNC`}
            </p>
          )}
          {data.txHash && <p className="text-xs text-muted-foreground">{`Tx: ${data.txHash.slice(0, 8)}...`}</p>}
        </div>
      )
    }
    return null
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.txHash) {
      return <Dot cx={cx} cy={cy} r={3} fill="#3b82f6" stroke="#1e40af" strokeWidth={2} />
    }
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Portfolio Performance
          </CardTitle>
          <CardDescription>Loading portfolio data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Portfolio Performance
          </CardTitle>
          <CardDescription>Error loading portfolio data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <Button onClick={fetchTransactions} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Portfolio Performance
          </CardTitle>
          <CardDescription>Wallet not connected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Please connect your wallet to view portfolio performance</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!filteredHistory.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Portfolio Performance
          </CardTitle>
          <CardDescription>No transaction data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No transactions found</p>
              <p className="text-lg font-semibold">Current Balance: {balance.toFixed(4)} SNC</p>
              <p className="text-xs text-muted-foreground mt-1">Address: {address}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Portfolio Performance
            </CardTitle>
            <CardDescription>
              Track your balance changes over time • {address}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {portfolioStats.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
              {portfolioStats.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
              {portfolioStats.trend === "neutral" && <Minus className="h-4 w-4 text-gray-600" />}
              <span
                className={`text-lg font-bold ${
                  portfolioStats.trend === "up"
                    ? "text-green-600"
                    : portfolioStats.trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                }`}
              >
                {portfolioStats.change > 0 ? "+" : ""}
                {portfolioStats.change.toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Change</p>
            <p
              className={`text-sm font-medium ${
                portfolioStats.trend === "up"
                  ? "text-green-600"
                  : portfolioStats.trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {portfolioStats.changePercent > 0 ? "+" : ""}
              {portfolioStats.changePercent.toFixed(2)}%
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-lg font-bold">{portfolioStats.totalTransactions}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">{portfolioStats.receivedCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Received</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              <span className="text-lg font-bold text-red-600">{portfolioStats.sentCount}</span>
            </div>
            <p className="text-xs text-muted-foreground">Sent</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                interval="preserveStartEnd"
              />
              <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} tickFormatter={(value) => `${value.toFixed(2)}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: "#1e40af", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Current Balance */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold">{balance.toFixed(4)} SNC</p>
        </div>
      </CardContent>
    </Card>
  )
}
