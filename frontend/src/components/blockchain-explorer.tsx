"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingUp, Activity, Clock, CuboidIcon as Cube, ArrowUpRight, Search, Globe } from "lucide-react"
import { getNetworkStats, getLatestBlocks, getLatestTransactions, getMyCoinPrice } from "@/lib/blockchain"
import NetworkChart from "@/components/network-chart"

export default function BlockchainExplorer() {
  const [networkStats, setNetworkStats] = useState<any>(null)
  const [priceData, setPriceData] = useState<any>(null)
  const [latestBlocks, setLatestBlocks] = useState<any[]>([])
  const [latestTransactions, setLatestTransactions] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadData = async () => {
      const [stats, price, blocks, transactions] = await Promise.all([
        getNetworkStats(),
        getMyCoinPrice(),
        getLatestBlocks(),
        getLatestTransactions(),
      ])

      setNetworkStats(stats)
      setPriceData(price)
      setLatestBlocks(blocks)
      setLatestTransactions(transactions)
    }

    loadData()
    const interval = setInterval(loadData, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000)
    if (seconds < 60) return `${seconds} secs ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hours ago`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">THAICOIN PRICE</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${priceData?.price || "12.45"}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">@ 0.00521 BTC</span>
              <Badge variant={priceData?.change >= 0 ? "default" : "destructive"} className="text-xs">
                {priceData?.change >= 0 ? "+" : ""}
                {priceData?.changePercent || "+2.15"}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">TRANSACTIONS</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.totalTransactions || "2,847.61"} M</div>
            <p className="text-xs text-gray-500 mt-1">({networkStats?.tps || "18.2"} TPS)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">MED GAS PRICE</CardTitle>
            <Globe className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.gasPrice || "15"} Gwei</div>
            <p className="text-xs text-gray-500 mt-1">($0.32)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">MARKET CAP</CardTitle>
            <Globe className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${priceData?.marketCap || "298,054,191,819"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Block and Transaction Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">LAST FINALIZED BLOCK</CardTitle>
            <Cube className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.lastFinalizedBlock || "22817956"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">LAST SAFE BLOCK</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats?.lastSafeBlock || "22817988"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">TRANSACTION HISTORY IN 14 DAYS</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkChart />
        </CardContent>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Address / Txn Hash / Block / Token"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Blocks and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Blocks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Latest Blocks</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              View all blocks
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestBlocks.map((block, index) => (
              <div key={block.number} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Cube className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">#{block.number}</div>
                    <div className="text-sm text-gray-500">{formatTimeAgo(block.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    Miner <span className="text-blue-600">{formatAddress(block.miner)}</span>
                  </div>
                  <div className="text-sm text-gray-500">{block.transactionCount} txns in 12 secs</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{block.reward} THC</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Latest Transactions</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              View all transactions
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestTransactions.map((tx, index) => (
              <div key={tx.hash} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-blue-600">{formatAddress(tx.hash)}</div>
                    <div className="text-sm text-gray-500">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm">
                    From <span className="text-blue-600">{formatAddress(tx.from)}</span>
                  </div>
                  <div className="text-sm">
                    To <span className="text-blue-600">{formatAddress(tx.to)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{tx.value} THC</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
