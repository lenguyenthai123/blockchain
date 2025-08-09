"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface Transaction {
  hash: string
  from: string
  to: string
  amount: number
  timeAgo: string
}

export function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestTransactions = async () => {
      try {
        setError(null)
        const mempool = await api.getMempool()

        const formattedTxs = mempool.slice(0, 5).map((tx: any) => ({
          hash: tx.hash,
          from: tx.from || "0xdadB0d80...",
          to: tx.to || "0x27A7B4e...",
          amount: tx.amount || 0,
          timeAgo: formatTimeAgo(new Date(tx.timestamp || Date.now())),
        }))

        setTransactions(formattedTxs)
      } catch (err) {
        console.error("Failed to fetch latest transactions:", err)
        setError("Failed to load transactions")

        // Fallback to mock data
        setTransactions([
          {
            hash: "0x0f351239df...",
            from: "0xdadB0d80...",
            to: "0x27A7B4e...",
            amount: 0.01106,
            timeAgo: "2 mins ago",
          },
          {
            hash: "0x80f52720a64...",
            from: "0xdadB0d80...",
            to: "0x3B932eB1...",
            amount: 0.00329,
            timeAgo: "5 mins ago",
          },
          {
            hash: "0xb95fce765bf...",
            from: "0xdadB0d80...",
            to: "0xe7a03a27...",
            amount: 0,
            timeAgo: "8 mins ago",
          },
          {
            hash: "0x6a9ebf134c0...",
            from: "0xdadB0d80...",
            to: "0x03EB482...",
            amount: 0.00069,
            timeAgo: "12 mins ago",
          },
          {
            hash: "0xc0adefd438b...",
            from: "0xdadB0d80...",
            to: "0xcF0475d9...",
            amount: 0.00004,
            timeAgo: "15 mins ago",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestTransactions()

    // Refresh every 10 seconds
    const interval = setInterval(fetchLatestTransactions, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secs ago`
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} mins ago`
    } else {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`
    }
  }

  const truncateHash = (hash: string): string => {
    return `${hash.slice(0, 6)}${hash.slice(6, 12)}...`
  }

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 8)}...`
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Latest Transactions</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-600 rounded"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-600 rounded"></div>
                    <div className="w-24 h-3 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-4 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Latest Transactions</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
          {error} - Showing cached data
        </div>
      )}

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div
            key={tx.hash}
            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-xs">📄</span>
              </div>
              <div>
                <div className="text-blue-400 font-mono hover:text-blue-300 cursor-pointer">
                  {truncateHash(tx.hash)}
                </div>
                <div className="text-sm text-gray-400">
                  From <span className="text-blue-400">{truncateAddress(tx.from)}</span> To{" "}
                  <span className="text-blue-400">{truncateAddress(tx.to)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono">{tx.amount.toFixed(5)} SNC</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
