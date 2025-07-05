"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Bell, Settings, Sparkles, TrendingUp } from "lucide-react"
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
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="relative overflow-hidden">
      {/* Background with Thai gradient */}
      <div className="absolute inset-0 thai-gradient opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full floating"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full floating"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full floating"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 text-sm border-b border-white/20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
              <TrendingUp className="h-4 w-4 text-white" />
              <span className="text-white/90 font-medium">THC Price:</span>
              <span className="font-bold text-white text-glow">${priceData?.price || "12.45"}</span>
              <Badge
                variant={priceData?.change >= 0 ? "default" : "destructive"}
                className={`text-xs ${priceData?.change >= 0 ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"} backdrop-blur-sm`}
              >
                {priceData?.change >= 0 ? "+" : ""}
                {priceData?.changePercent || "+2.15"}%
              </Badge>
            </div>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
              <span className="text-white/90">Gas:</span>
              <span className="font-semibold text-white">{networkStats?.gasPrice || "15"} Gwei</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              className="glass hover:bg-white/20 text-white border-white/20 interactive"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="glass hover:bg-white/20 text-white border-white/20 interactive relative"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full pulse-glow"></div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="glass hover:bg-white/20 text-white border-white/20 interactive"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 thai-gradient rounded-2xl flex items-center justify-center shadow-2xl pulse-glow">
                <span className="text-white font-bold text-2xl text-glow">T</span>
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-6 w-6 text-yellow-300 sparkle" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-1 shimmer-text">ThaiCoin Explorer</h1>
              <p className="text-white/80 text-lg font-medium">🇹🇭 Blockchain Explorer & Wallet</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right glass rounded-xl p-4">
              <div className="text-sm text-white/80 mb-1">Network Status</div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 status-online rounded-full"></div>
                <span className="text-sm font-bold text-white text-glow">Online</span>
                <div className="text-xs text-white/60">{networkStats?.blockHeight || "145,892"} blocks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
