"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowRight, Clock } from "lucide-react"
import { sanCoinAPI } from "@/lib/utxo-api"

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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadLatestTransactions()
  }, [])

  const loadLatestTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await sanCoinAPI.getLatestTransactions(5)
      setTransactions(response.transactions || [])
    } catch (err: any) {
      console.error("Failed to load latest transactions:", err)
      setError(err?.message || "Failed to load latest transactions.")
      setTransactions([])
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
    if (!address) return "unknown"
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  const formatHash = (hash: string) => {
    if (!hash) return "unknown"
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

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg">
        <div className="flex items-center justify-between">
          <p className="text-sm">Failed to load latest transactions. {error}</p>
          <Button
            onClick={loadLatestTransactions}
            variant="ghost"
            size="sm"
            className="text-red-300 hover:text-red-200"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!transactions.length) {
    return <div className="text-sm text-gray-400">No transactions found.</div>
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
                aria-label={`View transaction ${tx.hash}`}
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
