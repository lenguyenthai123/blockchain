"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Wallet, PlusCircle, Search, Download, TrendingUp, Users, Activity, Blocks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-cyan-500/10 to-transparent blur-3xl" />
      </div>

      {/* Subtle background image */}
      <div className="absolute inset-0 -z-10 opacity-[0.18]">
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Decorative abstract background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 md:py-20">
        {/* Hero */}
        <div className="mb-12 text-center">
          <Image
            src="/placeholder.svg?height=80&width=80"
            alt="SanWallet Logo"
            width={80}
            height={80}
            className="mx-auto mb-5 rounded-2xl"
          />
          <h1 className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-6xl">
            Welcome to SanWallet
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-300 md:text-lg">
            Secure and professional wallet for the SanCoin ecosystem. Manage, send, and receive SNC with ease.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/create-wallet">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-400 to-emerald-400 font-semibold text-gray-900 shadow-lg shadow-cyan-500/20 hover:from-cyan-300 hover:to-emerald-300 sm:w-auto"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create a New Wallet
              </Button>
            </Link>
            <Link href="/unlock">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-cyan-400/40 bg-white/5 text-cyan-300 backdrop-blur hover:bg-white/10 hover:text-cyan-200 sm:w-auto"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Access My Wallet
              </Button>
            </Link>
          </div>

          {/* Secondary links */}
          <div className="mt-6 space-y-3">
            <Link
              href="/import-wallet"
              className="inline-flex items-center justify-center gap-2 text-sm text-gray-300 transition-colors hover:text-cyan-300"
            >
              <Download className="h-4 w-4" />
              <span>Import an existing wallet</span>
            </Link>
            <div className="text-gray-500">or</div>
            <Link
              href="/explorer"
              className="inline-flex items-center justify-center gap-2 text-sm text-gray-300 transition-colors hover:text-cyan-300"
            >
              <Search className="h-4 w-4" />
              <span>Explore the SanCoin blockchain with SanScan</span>
            </Link>
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Blocks</CardTitle>
              <Blocks className="h-4 w-4 text-cyan-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{loading ? "…" : stats?.totalBlocks.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-cyan-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "…" : stats?.totalTransactions.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Supply</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "…" : `${stats?.totalSupply.toLocaleString()} SNC`}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Active Addresses</CardTitle>
              <Users className="h-4 w-4 text-cyan-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? "…" : stats?.activeAddresses.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
