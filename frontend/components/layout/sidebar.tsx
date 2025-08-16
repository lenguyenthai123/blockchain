"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ArrowUpCircle, History, Settings, LogOut, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

const navItems = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Send", href: "/dashboard/send", icon: ArrowUpCircle },
  { name: "Transactions", href: "/dashboard/transactions", icon: History },
]

export default function Sidebar() {
  const pathname = usePathname()

  // Safe destructuring with fallbacks
  const walletContext = useWallet()
  const {
    wallet = null,
    balance = 0,
    transactions = [],
    isLoading = false,
    isInitializing = false,
    isOnline = true,
    lastSyncTime = null,
    refreshAll = () => Promise.resolve(),
    getPortfolioValue = () => 0,
  } = walletContext || {}

  const portfolioValue = getPortfolioValue()

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-950 p-4 flex flex-col border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <h1 className="text-xl font-bold text-white">SanWallet</h1>
      </div>

      {/* Network Status */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-400 border-red-400 text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={refreshAll} disabled={isLoading || !wallet} className="h-6 w-6 p-0">
          <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Portfolio Card */}
      <div className="relative rounded-lg p-4 text-white mb-6 overflow-hidden bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-800/30">
        <div className="relative z-10">
          <p className="text-xs text-gray-300 uppercase tracking-wide">Portfolio Value</p>
          {isInitializing || isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-20 mt-1 mb-1"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          ) : wallet ? (
            <>
              <p className="text-2xl font-bold mt-1">${portfolioValue.toFixed(2)}</p>
              <p className="text-sm text-cyan-300 font-mono">{balance.toFixed(4)} SNC</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold mt-1">$0.00</p>
              <p className="text-sm text-cyan-300 font-mono">0.0000 SNC</p>
            </>
          )}

          {/* Quick Stats */}
          {wallet && (
            <div className="flex justify-between mt-3 pt-3 border-t border-cyan-800/30">
              <div className="text-center">
                <p className="text-xs text-gray-400">Transactions</p>
                <p className="text-sm font-semibold">{transactions.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Last Sync</p>
                <p className="text-xs">{lastSyncTime ? lastSyncTime.toLocaleTimeString().slice(0, 5) : "Never"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white",
              pathname === item.href && "bg-cyan-500/10 text-cyan-300 border-r-2 border-cyan-500",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
            {item.name === "Transactions" && transactions.length > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {transactions.length}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 pt-4 space-y-2">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white",
            pathname === "/dashboard/settings" && "bg-cyan-500/10 text-cyan-300",
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Link>
      </div>
    </aside>
  )
}
