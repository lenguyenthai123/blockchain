"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/explorer/stat-card"
import { LatestBlocks } from "@/components/explorer/latest-blocks"
import { LatestTransactions } from "@/components/explorer/latest-transactions"
import { SearchBar } from "@/components/explorer/search-bar"
import { api } from "@/lib/api"

interface NetworkStats {
  price: number
  priceChange: number
  marketCap: number
  totalTransactions: number
  tps: number
  lastBlock: number
}

export default function ExplorerPage() {
  const [stats, setStats] = useState<NetworkStats>({
    price: 0,
    priceChange: 0,
    marketCap: 0,
    totalTransactions: 0,
    tps: 0,
    lastBlock: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get network statistics
        const networkStats = await api.getNetworkStats()

        setStats({
          price: 250.0, // Mock price - should come from API
          priceChange: 0.28,
          marketCap: networkStats.totalSupply * 250,
          totalTransactions: networkStats.totalTransactions,
          tps: networkStats.tps || 15.5,
          lastBlock: networkStats.blockHeight,
        })
      } catch (err) {
        console.error("Failed to fetch network stats:", err)
        setError("Failed to load network statistics")

        // Fallback to mock data
        setStats({
          price: 250.0,
          priceChange: 0.28,
          marketCap: 455197446,
          totalTransactions: 2909890000,
          tps: 15.5,
          lastBlock: 23009478,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNetworkStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchNetworkStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (error && isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Explorer</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">The SanCoin Blockchain Explorer</h1>
          <SearchBar />
        </div>

        {/* Network Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="SNC PRICE"
            value={`$${stats.price.toFixed(2)}`}
            change={`+${stats.priceChange}%`}
            icon="💰"
            isLoading={isLoading}
          />
          <StatCard title="MARKET CAP" value={`$${stats.marketCap.toLocaleString()}`} icon="📊" isLoading={isLoading} />
          <StatCard
            title="TRANSACTIONS"
            value={`${(stats.totalTransactions / 1000000).toFixed(2)} M`}
            subtitle={`${stats.tps} TPS`}
            icon="🔄"
            isLoading={isLoading}
          />
          <StatCard
            title="LAST FINALIZED BLOCK"
            value={stats.lastBlock.toLocaleString()}
            icon="⏰"
            isLoading={isLoading}
          />
        </div>

        {/* Latest Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LatestBlocks />
          <LatestTransactions />
        </div>
      </div>
    </div>
  )
}
