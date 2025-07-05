"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  TrendingUp,
  Activity,
  Clock,
  CuboidIcon as Cube,
  ArrowUpRight,
  Search,
  Globe,
  Zap,
  DollarSign,
} from "lucide-react"
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
    const interval = setInterval(loadData, 10000)
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

  return (
    <div className="space-y-8">
      {/* Network Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="thai-card card-hover floating">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">THAICOIN PRICE</CardTitle>
            <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-thai-gradient mb-2">${priceData?.price || "12.45"}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">@ 0.00521 BTC</span>
              <Badge
                variant={priceData?.change >= 0 ? "default" : "destructive"}
                className={`text-xs ${priceData?.change >= 0 ? "bg-green-500 shadow-glow" : "bg-red-500"}`}
              >
                {priceData?.change >= 0 ? "+" : ""}
                {priceData?.changePercent || "+2.15"}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="thai-card card-hover floating" style={{ animationDelay: "0.5s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">TRANSACTIONS</CardTitle>
            <div className="p-2 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-glow mb-2">{networkStats?.totalTransactions || "2,847.61"} M</div>
            <p className="text-xs text-gray-500">
              <Zap className="inline h-3 w-3 mr-1" />({networkStats?.tps || "18.2"} TPS)
            </p>
          </CardContent>
        </Card>

        <Card className="thai-card card-hover floating" style={{ animationDelay: "1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">MED GAS PRICE</CardTitle>
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
              <Globe className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">{networkStats?.gasPrice || "15"} Gwei</div>
            <p className="text-xs text-gray-500">($0.32)</p>
          </CardContent>
        </Card>

        <Card className="thai-card card-hover floating" style={{ animationDelay: "1.5s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">MARKET CAP</CardTitle>
            <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">${priceData?.marketCap || "298B"}</div>
            <p className="text-xs text-gray-500">Total Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Block and Transaction Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="thai-card card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">LAST FINALIZED BLOCK</CardTitle>
            <div className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg glowing">
              <Cube className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 text-glow">
              #{networkStats?.lastFinalizedBlock || "22817956"}
            </div>
          </CardContent>
        </Card>

        <Card className="thai-card card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">LAST SAFE BLOCK</CardTitle>
            <div className="p-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">#{networkStats?.lastSafeBlock || "22817988"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Chart */}
      <Card className="thai-card">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <CardTitle className="text-xl text-thai-gradient flex items-center gap-2">
            📊 TRANSACTION HISTORY IN 14 DAYS
          </CardTitle>
        </CardHeader>
        <CardContent className="chart-container">
          <NetworkChart />
        </CardContent>
      </Card>

      {/* Enhanced Search Bar */}
      <Card className="thai-card">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="🔍 Search by Address / Txn Hash / Block / Token"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl"
              />
            </div>
            <Button className="thai-button h-12 px-8 text-white font-semibold rounded-xl">Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest Blocks and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Blocks */}
        <Card className="thai-card">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div>
              <CardTitle className="text-xl text-thai-gradient">🧱 Latest Blocks</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="interactive bg-transparent">
              View all blocks
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {latestBlocks.map((block, index) => (
              <div key={block.number} className="flex items-center justify-between p-4 glass rounded-xl interactive">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Cube className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-blue-600 text-lg">#{block.number}</div>
                    <div className="text-sm text-gray-500">{formatTimeAgo(block.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm mb-1">
                    Miner <span className="text-blue-600 font-mono">{formatAddress(block.miner)}</span>
                  </div>
                  <div className="text-sm text-gray-500">{block.transactionCount} txns in 12 secs</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-thai-gradient">{block.reward} THC</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest Transactions */}
        <Card className="thai-card">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
            <div>
              <CardTitle className="text-xl text-thai-gradient">💸 Latest Transactions</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="interactive bg-transparent">
              View all transactions
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {latestTransactions.map((tx, index) => (
              <div key={tx.hash} className="flex items-center justify-between p-4 glass rounded-xl interactive">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-mono text-sm text-blue-600 font-semibold">{formatAddress(tx.hash)}</div>
                    <div className="text-sm text-gray-500">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm mb-1">
                    From <span className="text-blue-600 font-mono">{formatAddress(tx.from)}</span>
                  </div>
                  <div className="text-sm">
                    To <span className="text-blue-600 font-mono">{formatAddress(tx.to)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-thai-gradient">{tx.value} THC</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
