"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, Hash } from "lucide-react"
import { utxoApi } from "@/lib/utxo-api"

interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  miner: string
  size: number
}

export default function LatestBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLatestBlocks()
  }, [])

  const loadLatestBlocks = async () => {
    try {
      setIsLoading(true)
      const response = await utxoApi.getLatestBlocks()
      setBlocks(response.blocks || [])
    } catch (error) {
      console.error("Failed to load latest blocks:", error)
      // Set mock data for demo
      const mockBlocks: Block[] = [
        {
          number: 1250,
          hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
          timestamp: Date.now() - 60000,
          transactions: 15,
          miner: "san1miner123456789abcdef",
          size: 1024,
        },
        {
          number: 1249,
          hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
          timestamp: Date.now() - 660000,
          transactions: 23,
          miner: "san1miner987654321fedcba",
          size: 1536,
        },
        {
          number: 1248,
          hash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
          timestamp: Date.now() - 1260000,
          transactions: 8,
          miner: "san1miner456789abcdef123",
          size: 768,
        },
        {
          number: 1247,
          hash: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          timestamp: Date.now() - 1860000,
          transactions: 31,
          miner: "san1miner789abcdef123456",
          size: 2048,
        },
        {
          number: 1246,
          hash: "0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
          timestamp: Date.now() - 2460000,
          transactions: 12,
          miner: "san1minerabcdef123456789",
          size: 896,
        },
      ]
      setBlocks(mockBlocks)
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
                <div className="h-4 bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-700 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <div key={block.number} className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold">#{block.number}</span>
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(block.timestamp)}
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-sm">
                <Hash className="h-3 w-3" />
                {formatHash(block.hash)}
              </div>
              <div className="text-gray-500 text-xs">Miner: {formatAddress(block.miner)}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-white font-medium">{block.transactions} txns</div>
              <div className="text-gray-400 text-sm">{(block.size / 1024).toFixed(1)} KB</div>
              <Button
                onClick={() => (window.location.href = `/explorer/block/${block.number}`)}
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
          onClick={() => (window.location.href = "/explorer/blocks")}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          View All Blocks
        </Button>
      </div>
    </div>
  )
}
