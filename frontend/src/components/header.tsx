"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Bell, Settings } from "lucide-react"
import { getNetworkStats, getMyCoinPrice } from "@/lib/blockchain"

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const [networkStats, setNetworkStats] = useState<any>(null)
  const [priceData, setPriceData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const stats = await getNetworkStats()
      const price = await getMyCoinPrice()
      setNetworkStats(stats)
      setPriceData(price)
    }

    loadData()
    const interval = setInterval(loadData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">MYC Price:</span>
              <span className="font-semibold text-blue-600">${priceData?.price || "12.45"}</span>
              <Badge variant={priceData?.change >= 0 ? "default" : "destructive"} className="text-xs">
                {priceData?.change >= 0 ? "+" : ""}
                {priceData?.changePercent || "+2.15"}%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Gas:</span>
              <span className="font-semibold">{networkStats?.gasPrice || "15"} Gwei</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MyCoin Explorer</h1>
              <p className="text-sm text-gray-500">Blockchain Explorer & Wallet</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Network Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
