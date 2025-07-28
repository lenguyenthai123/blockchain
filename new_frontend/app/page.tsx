"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Wallet, PlusCircle, Search, Download, TrendingUp, Users, Activity, Blocks } from "lucide-react"
import { useEffect, useState } from "react"
import { sanCoinAPI } from "@/lib/api"

interface NetworkStats {
  totalBlocks: number
  totalTransactions: number
  difficulty: number
  hashRate: string
  blockTime: string
  pendingTransactions: number
  totalSupply: number
  circulatingSupply: number
  totalAddresses: number
  activeAddresses: number
}

export default function LandingPage() {
  const [stats, setStats] = useState<NetworkStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const networkStats = await sanCoinAPI.getNetworkStats()

        // Map API response to local interface
        setStats({
          totalBlocks: networkStats.totalBlocks || 0,
          totalTransactions: networkStats.totalTransactions || 0,
          difficulty: networkStats.difficulty || 2,
          hashRate: networkStats.networkHashRate || "0 H/s",
          blockTime: networkStats.averageBlockTime || "10 minutes",
          pendingTransactions: networkStats.pendingTransactions || 0,
          totalSupply: networkStats.totalSupply || 0,
          circulatingSupply: networkStats.circulatingSupply || 0,
          totalAddresses: networkStats.totalAddresses || 0,
          activeAddresses: networkStats.activeAddresses || 0,
        })
      } catch (error) {
        console.error("Failed to fetch network stats:", error)
        // Set default stats if API fails
        setStats({
          totalBlocks: 0,
          totalTransactions: 0,
          difficulty: 2,
          hashRate: "0 H/s",
          blockTime: "10 minutes",
          pendingTransactions: 0,
          totalSupply: 0,
          circulatingSupply: 0,
          totalAddresses: 0,
          activeAddresses: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center p-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?width=1920&height=1080"
          alt="Background"
          fill
          className="opacity-30 object-cover"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="mb-12">
          <Image
            src="/placeholder.svg?width=80&height=80"
            alt="SanWallet Logo"
            width={80}
            height={80}
            className="mb-4 mx-auto rounded-full"
          />
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Welcome to SanWallet</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            The most secure and professional wallet for the SanCoin ecosystem. Manage, send, and receive SNC with ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/create-wallet">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold shadow-lg shadow-cyan-500/20"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create a New Wallet
              </Button>
            </Link>
            <Link href="/unlock">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-cyan-500 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 bg-transparent"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Access My Wallet
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <Link
              href="/import-wallet"
              className="text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Import an existing wallet</span>
            </Link>
            <Link
              href="/explorer"
              className="text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Or explore the SanCoin blockchain with SanScan</span>
            </Link>
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Blocks</CardTitle>
              <Blocks className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : stats?.totalBlocks.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : stats?.totalTransactions.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Supply</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : `${stats?.totalSupply.toLocaleString()} SNC`}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Active Addresses</CardTitle>
              <Users className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "..." : stats?.activeAddresses.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
