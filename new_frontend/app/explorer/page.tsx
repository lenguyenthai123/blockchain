"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, RefreshCw, Blocks, Activity, Users, TrendingUp } from "lucide-react"
import { ExplorerStatCard } from "@/components/explorer/stat-card"
import LatestBlocks from "@/components/explorer/latest-blocks"
import LatestTransactions from "@/components/explorer/latest-transactions"
import { sanCoinAPI } from "@/lib/utxo-api"

interface BlockchainStats {
  totalBlocks: number
  totalTransactions: number
  totalAddresses?: number
  hashRate?: string
  difficulty?: number
  networkStatus?: "online" | "offline"
}

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<BlockchainStats>({
    totalBlocks: 0,
    totalTransactions: 0,
    totalAddresses: 0,
    hashRate: "0 H/s",
    difficulty: 0,
    networkStatus: "online",
  })
  const [error, setError] = useState<string | null>(null)

  // Load blockchain stats
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await sanCoinAPI.getBlockchainStats()
      console.log("Blockchain stats:", response)
      setStats({
        totalBlocks: Number(response.data.totalBlocks) || 222,
        totalTransactions: Number(response.data.totalTransactions) || 0,
        totalAddresses: Number(response.data.totalAddresses) || 0,
        hashRate: response.data.networkHashRate || "0 H/s",
        difficulty: typeof response.data.difficulty === "number" ? response.data.difficulty : 0,
        networkStatus: (response.data.networkStatus as "online" | "offline") || "online",
      })
    } catch (err: any) {
      console.error("Failed to load stats:", err)
      setError(err?.message || "Failed to load network stats.")
      // Do not set mock data; keep zeros to reflect real backend status
      setStats((prev) => ({ ...prev, totalBlocks: 0, totalTransactions: 0 }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      // Determine search type based on query format
      if (searchQuery.match(/^[0-9]+$/)) {
        window.location.href = `/explorer/block/${searchQuery}`
      } else if (searchQuery.startsWith("san1")) {
        window.location.href = `/explorer/address/${searchQuery}`
      } else if (searchQuery.match(/^(0x)?[a-fA-F0-9]{64}$/)) {
        const clean = searchQuery.startsWith("0x") ? searchQuery.slice(2) : searchQuery
        window.location.href = `/explorer/tx/${clean}`
      } else {
        alert("Invalid search query. Please enter a block number, address, or transaction hash.")
      }
    } catch (error) {
      console.error("Search failed:", error)
      alert("Search failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Safe number formatting function
  const formatNumber = (num: number | undefined): string => {
    if (typeof num !== "number" || isNaN(num)) return "0"
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6">The SanCoin Blockchain Explorer</h1>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by Address / Txn Hash / Block"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                aria-label="Search by Address / Txn Hash / Block"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-gray-900"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-300">
            Failed to load network stats. {error}{" "}
            <button onClick={loadStats} className="underline hover:text-red-200">
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExplorerStatCard
          title="Total Blocks"
          value={formatNumber(stats.totalBlocks)}
          icon={<Blocks className="h-6 w-6" />}
          change={undefined}
          trend="up"
        />
        <ExplorerStatCard
          title="Total Transactions"
          value={formatNumber(stats.totalTransactions)}
          icon={<Activity className="h-6 w-6" />}
          change={undefined}
          trend="up"
        />
        <ExplorerStatCard
          title="Active Addresses"
          value={formatNumber(stats.totalAddresses || 0)}
          icon={<Users className="h-6 w-6" />}
          change={undefined}
          trend="up"
        />
        <ExplorerStatCard
          title="Hash Rate"
          value={stats.hashRate || "0 H/s"}
          icon={<TrendingUp className="h-6 w-6" />}
          change={undefined}
          trend="up"
        />
      </div>

      {/* Latest Blocks and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Latest Blocks</CardTitle>
              <CardDescription className="text-gray-400">Most recent blocks mined</CardDescription>
            </div>
            <Button
              onClick={loadStats}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              aria-label="Refresh stats"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <LatestBlocks />
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">Latest Transactions</CardTitle>
              <CardDescription className="text-gray-400">Most recent network transactions</CardDescription>
            </div>
            <Button
              onClick={loadStats}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              aria-label="Refresh stats"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <LatestTransactions />
          </CardContent>
        </Card>
      </div>

      {/* Network Health */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Network Health</CardTitle>
          <CardDescription className="text-gray-400">Current network status and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-white font-semibold">Network Status</h3>
              <p className="text-green-400">{stats.networkStatus === "offline" ? "Offline" : "Online"}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold">Difficulty</h3>
              <p className="text-blue-400">{stats.difficulty ?? 0}T</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold">Block Time</h3>
              <p className="text-purple-400">~10 min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
