"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wallet, TrendingUp, Activity, Clock, Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWalletBalance, getWalletStats, getNetworkStats } from "@/lib/blockchain"

interface WalletDashboardProps {
  wallet: any
}

export default function WalletDashboard({ wallet }: WalletDashboardProps) {
  const [balance, setBalance] = useState<number>(0)
  const [stats, setStats] = useState<any>(null)
  const [networkStats, setNetworkStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      if (!wallet?.address) {
        setError("Invalid wallet address")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError("")

        console.log("Loading wallet data for:", wallet.address)

        const [walletBalance, walletStats, netStats] = await Promise.all([
          getWalletBalance(wallet.address),
          getWalletStats(wallet.address),
          getNetworkStats(),
        ])

        console.log("Wallet balance:", walletBalance)
        console.log("Wallet stats:", walletStats)
        console.log("Network stats:", netStats)

        setBalance(walletBalance || 0)
        setStats(
          walletStats || {
            totalTransactions: 0,
            totalSent: 0,
            totalReceived: 0,
            firstTransaction: null,
          },
        )
        setNetworkStats(netStats)
      } catch (error) {
        console.error("Failed to load wallet data:", error)
        setError("Failed to load wallet data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [wallet?.address])

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
      alert("Address copied to clipboard!")
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading wallet data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-6 w-6 text-green-600" />
            Wallet Overview
          </CardTitle>
          <CardDescription className="text-base">Your ThaiCoin wallet statistics and balance</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                    {wallet?.address || "No address"}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyAddress} disabled={!wallet?.address}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Balance</label>
                <div className="text-3xl font-bold text-blue-600 mt-1">
                  {typeof balance === "number" ? balance.toFixed(4) : "0.0000"} THC
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {stats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Transactions</span>
                    <span className="font-medium">{stats.totalTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Sent</span>
                    <span className="font-medium">
                      {typeof stats.totalSent === "number" ? stats.totalSent.toFixed(4) : "0.0000"} THC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Received</span>
                    <span className="font-medium">
                      {typeof stats.totalReceived === "number" ? stats.totalReceived.toFixed(4) : "0.0000"} THC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">First Transaction</span>
                    <span className="font-medium">{stats.firstTransaction || "N/A"}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Hash Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.hashRate || "1.2"} TH/s</div>
            <p className="text-xs text-muted-foreground">+2.1% from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Block Height</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.blockHeight || "145,892"}</div>
            <p className="text-xs text-muted-foreground">Latest block mined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Block Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.avgBlockTime || "10.2"}s</div>
            <p className="text-xs text-muted-foreground">Target: 10s</p>
          </CardContent>
        </Card>
      </div>

      {/* Mining/Staking Status */}
      <Card>
        <CardHeader>
          <CardTitle>Consensus Participation</CardTitle>
          <CardDescription>Your participation in network consensus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Proof of Work Mining</p>
              <p className="text-sm text-muted-foreground">Currently not mining</p>
            </div>
            <Badge variant="secondary">Inactive</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Proof of Stake</p>
              <p className="text-sm text-muted-foreground">
                Staking {typeof balance === "number" ? (balance * 0.1).toFixed(4) : "0.0000"} THC
              </p>
            </div>
            <Badge variant="default">Active</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Staking Progress</span>
              <span>67%</span>
            </div>
            <Progress value={67} className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
