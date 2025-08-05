"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { sanCoinAPI, type TransactionWithDirection } from "@/lib/utxo-api"

interface BalancePoint {
  timestamp: number
  balance: number
  date: string
  time: string
}

type TimeRange = "24h" | "7d" | "30d" | "all"

export default function PortfolioChart() {
  const { wallet, balance } = useWallet()
  const [transactions, setTransactions] = useState<TransactionWithDirection[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wallet?.address) {
      fetchTransactions()
    }
  }, [wallet?.address])

  const fetchTransactions = async () => {
    if (!wallet?.address) return

    try {
      setLoading(true)
      const data = await sanCoinAPI.getTransactionHistory(wallet.address, 200)
      setTransactions(data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const balanceHistory = useMemo(() => {
    if (!transactions.length) return []

    // Sort transactions by timestamp (oldest first)
    const sortedTxs = [...transactions].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

    const history: BalancePoint[] = []
    let runningBalance = 0

    // Calculate balance at each transaction point
    sortedTxs.forEach((tx, index) => {
      let balanceChange = 0

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

      // Ensure balance never goes negative (safety check)
      runningBalance = Math.max(0, runningBalance)

      const date = new Date(tx.timestamp)
      history.push({
        timestamp: tx.timestamp,
        balance: runningBalance,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
      })
    })

    // Add current balance as the latest point
    if (history.length > 0) {
      const now = new Date()
      history.push({
        timestamp: now.getTime(),
        balance: balance,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      })
    } else if (balance > 0) {
      // If no transactions but we have balance, show current balance
      const now = new Date()
      history.push({
        timestamp: now.getTime(),
        balance: balance,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      })
    }

    return history
  }, [transactions, balance])

  const filteredHistory = useMemo(() => {
    if (!balanceHistory.length) return []

    const now = Date.now()
    let cutoffTime = 0

    switch (timeRange) {
      case "24h":
        cutoffTime = now - 24 * 60 * 60 * 1000
        break
      case "7d":
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case "30d":
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000
        break
      case "all":
        return balanceHistory
    }

    // Filter points within the time range
    const filtered = balanceHistory.filter((point) => point.timestamp >= cutoffTime)

    // If no points in range, find the last point before cutoff to use as starting point
    if (filtered.length === 0) {
      const lastPointBefore = balanceHistory.filter((point) => point.timestamp < cutoffTime).slice(-1)[0]

      if (lastPointBefore) {
        // Create a synthetic starting point at the cutoff time with the last known balance
        const startDate = new Date(cutoffTime)
        const startPoint: BalancePoint = {
          timestamp: cutoffTime,
          balance: lastPointBefore.balance,
          date: startDate.toLocaleDateString(),
          time: startDate.toLocaleTimeString(),
        }
        return [startPoint]
      }
      return []
    }

    // If we have filtered points but the first one is after cutoff,
    // add a starting point with the balance from before the cutoff
    if (filtered.length > 0 && filtered[0].timestamp > cutoffTime) {
      const lastPointBefore = balanceHistory.filter((point) => point.timestamp < cutoffTime).slice(-1)[0]

      if (lastPointBefore) {
        const startDate = new Date(cutoffTime)
        const startPoint: BalancePoint = {
          timestamp: cutoffTime,
          balance: lastPointBefore.balance,
          date: startDate.toLocaleDateString(),
          time: startDate.toLocaleTimeString(),
        }
        return [startPoint, ...filtered]
      }
    }

    return filtered
  }, [balanceHistory, timeRange])

  const stats = useMemo(() => {
    if (filteredHistory.length === 0) {
      return {
        change: 0,
        changePercent: 0,
        trend: "neutral" as const,
        startBalance: balance,
        endBalance: balance,
      }
    }

    if (filteredHistory.length === 1) {
      return {
        change: 0,
        changePercent: 0,
        trend: "neutral" as const,
        startBalance: filteredHistory[0].balance,
        endBalance: filteredHistory[0].balance,
      }
    }

    const startBalance = filteredHistory[0].balance
    const endBalance = filteredHistory[filteredHistory.length - 1].balance
    const change = endBalance - startBalance
    const changePercent = startBalance > 0 ? (change / startBalance) * 100 : 0

    let trend: "up" | "down" | "neutral" = "neutral"
    if (Math.abs(change) > 0.001) {
      trend = change > 0 ? "up" : "down"
    }

    return {
      change,
      changePercent,
      trend,
      startBalance,
      endBalance,
    }
  }, [filteredHistory, balance])

  const formatBalance = (value: number) => {
    return `${value.toFixed(3)} SNC`
  }

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(3)} SNC (${sign}${percent.toFixed(2)}%)`
  }

  const getTrendIcon = () => {
    switch (stats.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (stats.trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Balance</CardTitle>
          <CardDescription>Track your balance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-800 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!filteredHistory.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Balance</CardTitle>
          <CardDescription>Track your balance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-300">{formatBalance(balance)}</div>
              <div className="text-sm text-gray-400">Current Balance</div>
            </div>
            <p>No transaction history available for this period</p>
            <p className="text-sm mt-1">Your balance chart will appear here after transactions</p>
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
            <CardTitle>Portfolio Balance</CardTitle>
            <CardDescription>Track your balance over time</CardDescription>
          </div>
          <div className="flex gap-2">
            {(["24h", "7d", "30d", "all"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Balance & Change */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatBalance(balance)}</div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{formatChange(stats.change, stats.changePercent)}</span>
              </div>
            </div>
            <Badge
              variant={stats.trend === "up" ? "default" : stats.trend === "down" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {timeRange.toUpperCase()}
            </Badge>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredHistory} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(1)}`}
                  domain={["dataMin - 0.1", "dataMax + 0.1"]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as BalancePoint
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
                          <p className="text-sm text-gray-400">
                            {data.date} at {data.time}
                          </p>
                          <p className="text-lg font-semibold text-cyan-400">{formatBalance(data.balance)}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#06B6D4", strokeWidth: 2, fill: "#06B6D4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div>
              <p className="text-sm text-gray-400">Period Start</p>
              <p className="font-semibold">{formatBalance(stats.startBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Period End</p>
              <p className="font-semibold">{formatBalance(stats.endBalance)}</p>
            </div>
          </div>

          {/* Debug Info (can be removed in production) */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
              <p>Transactions: {transactions.length}</p>
              <p>History Points: {balanceHistory.length}</p>
              <p>Filtered Points: {filteredHistory.length}</p>
              <p>Current Balance: {balance}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
