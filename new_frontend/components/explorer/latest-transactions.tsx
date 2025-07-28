"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowRight, Clock } from "lucide-react"
import { utxoApi } from "@/lib/utxo-api"

interface Transaction {
  hash: string
  from: string
  to: string
  amount: number
  fee: number
  timestamp: number
  status: "confirmed" | "pending" | "failed"
  blockNumber?: number
}

export default function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLatestTransactions()
  }, [])

  const loadLatestTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await utxoApi.getLatestTransactions()
      setTransactions(response.transactions || [])
    } catch (error) {
      console.error("Failed to load latest transactions:", error)
      // Set mock data for demo
      const mockTransactions: Transaction[] = [
        {
          hash: "0xabc123def456789012345678901234567890123456789012345678901234567890",
          from: "san1sender123456789abcdef",
          to: "san1receiver987654321fed",
          amount: 5.25,
          fee: 0.001,
          timestamp: Date.now() - 30000,
          status: "confirmed",
          blockNumber: 1250,
        },
        {
          hash: "0xdef456789012345678901234567890123456789012345678901234567890abc1",
          from: "san1alice456789abcdef123",
          to: "san1bob987654321fedcba98",
          amount: 12.5,
          fee: 0.001,
          timestamp: Date.now() - 180000,
          status: "confirmed",
          blockNumber: 1249,
        },
        {
          hash: "0x789012345678901234567890123456789012345678901234567890abc123def",
          from: "san1charlie123456789abc",
          to: "san1david987654321fedc",
          amount: 0.75,
          fee: 0.001,
          timestamp: Date.now() - 420000,
          status: "confirmed",
          blockNumber: 1248,
        },
        {
          hash: "0x012345678901234567890123456789012345678901234567890abc123def456",
          from: "san1eve456789abcdef1234",
          to: "san1frank987654321fedc",
          amount: 25.0,
          fee: 0.001,
          timestamp: Date.now() - 600000,
          status: "pending",
        },
        {
          hash: "0x345678901234567890123456789012345678901234567890abc123def456789",
          from: "san1grace123456789abcd",
          to: "san1henry987654321fed",
          amount: 3.33,
          fee: 0.001,
          timestamp: Date.now() - 840000,
          status: "confirmed",
          blockNumber: 1247,
        },
      ]
      setTransactions(mockTransactions)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return "Just now"
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-24"></div>
                <div className="h-3 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.hash} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-sm">{formatHash(tx.hash)}</span>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${
                    tx.status === "confirmed"
                      ? "bg-green-900/30 text-green-400"
                      : tx.status === "pending"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                  }`}
                >
                  {tx.status}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{formatAddress(tx.from)}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{formatAddress(tx.to)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(tx.timestamp)}
                {tx.blockNumber && (
                  <>
                    <span className="mx-1">•</span>
                    <span>Block #{tx.blockNumber}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-white font-medium">{tx.amount.toFixed(4)} SNC</div>
              <div className="text-gray-400 text-sm">Fee: {tx.fee.toFixed(6)}</div>
              <Button
                onClick={() => (window.location.href = `/explorer/tx/${tx.hash}`)}
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 p-1"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <div className="text-center pt-4">
        <Button
          onClick={() => (window.location.href = "/explorer/transactions")}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          View All Transactions
        </Button>
      </div>
    </div>
  )
}
