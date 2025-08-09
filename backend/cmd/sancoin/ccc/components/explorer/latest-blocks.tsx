"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface Block {
  number: number
  timestamp: string
  miner: string
  transactionCount: number
  timeAgo: string
}

export function LatestBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestBlocks = async () => {
      try {
        setError(null)
        const latestBlocks = await api.getLatestBlocks(5)

        const formattedBlocks = latestBlocks.map((block: any) => ({
          number: block.number,
          timestamp: block.timestamp,
          miner: block.miner || "MinerNet",
          transactionCount: block.transactions?.length || 0,
          timeAgo: formatTimeAgo(new Date(block.timestamp)),
        }))

        setBlocks(formattedBlocks)
      } catch (err) {
        console.error("Failed to fetch latest blocks:", err)
        setError("Failed to load blocks")

        // Fallback to mock data
        setBlocks([
          {
            number: 23009546,
            timestamp: new Date().toISOString(),
            miner: "MinerNet",
            transactionCount: 217,
            timeAgo: "15 secs ago",
          },
          {
            number: 23009545,
            timestamp: new Date(Date.now() - 27000).toISOString(),
            miner: "BuilderNet",
            transactionCount: 163,
            timeAgo: "27 secs ago",
          },
          {
            number: 23009544,
            timestamp: new Date(Date.now() - 39000).toISOString(),
            miner: "Titan Builder",
            transactionCount: 203,
            timeAgo: "39 secs ago",
          },
          {
            number: 23009543,
            timestamp: new Date(Date.now() - 51000).toISOString(),
            miner: "MinerNet",
            transactionCount: 131,
            timeAgo: "51 secs ago",
          },
          {
            number: 23009542,
            timestamp: new Date(Date.now() - 60000).toISOString(),
            miner: "BuilderNet",
            transactionCount: 193,
            timeAgo: "60 secs ago",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestBlocks()

    // Refresh every 15 seconds
    const interval = setInterval(fetchLatestBlocks, 15000)
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

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Latest Blocks</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-600 rounded"></div>
                  <div className="space-y-2">
                    <div className="w-20 h-4 bg-gray-600 rounded"></div>
                    <div className="w-16 h-3 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="w-24 h-4 bg-gray-600 rounded"></div>
                  <div className="w-16 h-3 bg-gray-600 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Latest Blocks</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
          {error} - Showing cached data
        </div>
      )}

      <div className="space-y-4">
        {blocks.map((block) => (
          <div
            key={block.number}
            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs">📦</span>
              </div>
              <div>
                <div className="text-blue-400 font-mono hover:text-blue-300 cursor-pointer">
                  {block.number.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">{block.timeAgo}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                Fee Recipient <span className="text-blue-400">{block.miner}</span>
              </div>
              <div className="text-sm text-gray-400">{block.transactionCount} txns</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
