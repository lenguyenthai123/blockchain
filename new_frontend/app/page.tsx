"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  Wallet,
  PlusCircle,
  Search,
  Download,
  TrendingUp,
  Users,
  Activity,
  Blocks,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react"
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
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] animate-pulse rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[40rem] w-[40rem] animate-pulse rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-500/15 to-cyan-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-pink-500/10 blur-3xl" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/4 left-1/4 h-2 w-2 animate-bounce rounded-full bg-cyan-400/60 blur-sm"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          />
          <div
            className="absolute top-3/4 right-1/4 h-1 w-1 animate-bounce rounded-full bg-emerald-400/60 blur-sm"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          />
          <div
            className="absolute top-1/2 right-1/3 h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400/60 blur-sm"
            style={{ animationDelay: "2s", animationDuration: "5s" }}
          />
        </div>
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 md:py-28">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          {/* Logo with glow effect */}
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 blur-xl opacity-30" />
            <Image
              src="/logo.png?height=100&width=100"
              alt="SanWallet Logo"
              width={100}
              height={100}
              className="relative rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900 to-gray-800 p-4 shadow-2xl"
            />
          </div>

          {/* Main heading with animated gradient */}
          <h1 className="mb-6 bg-gradient-to-r from-cyan-200 via-emerald-300 to-teal-200 bg-clip-text text-6xl font-black tracking-tight text-transparent md:text-7xl lg:text-8xl">
            <span className="inline-block animate-pulse"></span>
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
             SanWallet
            </span>
          </h1>

          {/* Subtitle with enhanced styling */}
          <p className="mx-auto mb-4 max-w-3xl text-lg text-gray-300 md:text-xl lg:text-2xl">
            The most{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text font-semibold text-transparent">
              secure
            </span>{" "}
            and{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text font-semibold text-transparent">
              professional
            </span>{" "}
            wallet for the SanCoin ecosystem
          </p>
          <p className="mx-auto max-w-2xl text-base text-gray-400 md:text-lg">
            Manage, send, and receive SNC with military-grade security and lightning-fast transactions
          </p>

          {/* Feature badges */}
          <div className="mb-10 mt-6 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 backdrop-blur">
              <Shield className="h-4 w-4" />
              <span>Military Grade Security</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300 backdrop-blur">
              <Zap className="h-4 w-4" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              <span>Next Generation</span>
            </div>
          </div>

          {/* Enhanced CTA buttons */}
          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/create-wallet">
              <Button
                size="lg"
                className="group relative w-full overflow-hidden bg-gradient-to-r from-cyan-500 to-emerald-500 px-8 py-4 text-lg font-bold text-gray-900 shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-emerald-400 hover:shadow-cyan-500/40 sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <PlusCircle className="mr-3 h-6 w-6" />
                Create New Wallet
              </Button>
            </Link>
            <Link href="/unlock">
              <Button
                size="lg"
                variant="outline"
                className="group relative w-full overflow-hidden border-2 border-cyan-400/50 bg-white/5 px-8 py-4 text-lg font-semibold text-cyan-300 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-cyan-400 hover:bg-white/10 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/20 sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Wallet className="mr-3 h-6 w-6" />
                Access My Wallet
              </Button>
            </Link>
          </div>

          {/* Enhanced secondary links */}
          <div className="space-y-4">
            <Link
              href="/import-wallet"
              className="group inline-flex items-center justify-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:text-cyan-300"
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="border-b border-transparent transition-all duration-300 group-hover:border-cyan-300">
                Import an existing wallet
              </span>
            </Link>
            <div className="text-gray-500">or</div>
            <Link
              href="/explorer"
              className="group inline-flex items-center justify-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:text-emerald-300"
            >
              <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="border-b border-transparent transition-all duration-300 group-hover:border-emerald-300">
                Explore the SanCoin blockchain with SanScan
              </span>
            </Link>
          </div>
        </div>

        {/* Enhanced Network Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-cyan-300">
                Total Blocks
              </CardTitle>
              <div className="rounded-lg bg-cyan-500/10 p-2 transition-all duration-300 group-hover:bg-cyan-500/20 group-hover:scale-110">
                <Blocks className="h-4 w-4 text-cyan-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white transition-all duration-300 group-hover:scale-105">
                {loading ? (
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-700" />
                ) : (
                  stats?.totalBlocks.toLocaleString()
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">Network blocks mined</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-emerald-300">
                Total Transactions
              </CardTitle>
              <div className="rounded-lg bg-emerald-500/10 p-2 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-110">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white transition-all duration-300 group-hover:scale-105">
                {loading ? (
                  <div className="h-8 w-24 animate-pulse rounded bg-gray-700" />
                ) : (
                  stats?.totalTransactions.toLocaleString()
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">Processed transactions</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-violet-400/30 hover:shadow-lg hover:shadow-violet-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-violet-300">
                Total Supply
              </CardTitle>
              <div className="rounded-lg bg-violet-500/10 p-2 transition-all duration-300 group-hover:bg-violet-500/20 group-hover:scale-110">
                <TrendingUp className="h-4 w-4 text-violet-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white transition-all duration-300 group-hover:scale-105">
                {loading ? (
                  <div className="h-8 w-28 animate-pulse rounded bg-gray-700" />
                ) : (
                  `${stats?.totalSupply.toLocaleString()} SNC`
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">Coins in circulation</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl transition-all duration-300 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 transition-colors duration-300 group-hover:text-amber-300">
                Active Addresses
              </CardTitle>
              <div className="rounded-lg bg-amber-500/10 p-2 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:scale-110">
                <Users className="h-4 w-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white transition-all duration-300 group-hover:scale-105">
                {loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-700" />
                ) : (
                  stats?.activeAddresses.toLocaleString()
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">Network participants</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional decorative elements */}
        <div className="mt-16 text-center">
          <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <p className="mt-4 text-sm text-gray-500">Powered by cutting-edge blockchain technology</p>
        </div>
      </div>
    </div>
  )
}
