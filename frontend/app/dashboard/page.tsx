"use client"

import { useWallet } from "@/contexts/wallet-context"
import StatCard from "@/components/dashboard/stat-card"
import PortfolioChart from "@/components/dashboard/portfolio-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Send, Download, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import SendDialog from "@/components/send-dialog"
import ReceiveDialog from "@/components/receive-dialog"

export default function DashboardPage() {
  const {
    wallet,
    balance,
    transactions,
    isLoading,
    isInitializing,
    networkStatus,
    refreshAll,
    getPortfolioValue,
    formatAddress,
  } = useWallet()

  const [showBalance, setShowBalance] = useState(true)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing wallet...</p>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h2>
            <p className="text-gray-400 mb-6">Create or import a wallet to get started</p>
            <div className="flex gap-3">
              <Button
                onClick={() => (window.location.href = "/create-wallet")}
                className="bg-cyan-500 hover:bg-cyan-600 text-gray-900"
              >
                Create Wallet
              </Button>
              <Button
                onClick={() => (window.location.href = "/import-wallet")}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Import Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const portfolioValue = getPortfolioValue()
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's your wallet overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              networkStatus === "online"
                ? "bg-green-900/30 text-green-400"
                : networkStatus === "syncing"
                  ? "bg-yellow-900/30 text-yellow-400"
                  : "bg-red-900/30 text-red-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                networkStatus === "online"
                  ? "bg-green-400"
                  : networkStatus === "syncing"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            ></div>
            {networkStatus === "online" ? "Online" : networkStatus === "syncing" ? "Syncing" : "Offline"}
          </div>
          <Button
            onClick={refreshAll}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Wallet Info Card */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">My Wallet</CardTitle>
              <CardDescription className="text-gray-300">{wallet.address}</CardDescription>
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(wallet.address)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              Copy Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-white">
                  {showBalance ? `${balance.toFixed(4)} SNC` : "••••••••"}
                </span>
                <Button
                  onClick={() => setShowBalance(!showBalance)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-1"
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-gray-400">≈ ${portfolioValue.toFixed(2)} USD</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowSendDialog(true)} className="bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button
                onClick={() => setShowReceiveDialog(true)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Receive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Balance"
          value={`${balance.toFixed(4)} SNC`}
          change="+2.5%"
          trend={{ value: 2.5, isPositive: true }}
        />
        <StatCard
          title="Portfolio Value"
          value={`$${portfolioValue.toFixed(2)}`}
          change="+5.2%"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Total Transactions"
          value={transactions.length.toString()}
          change="+12"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Portfolio Chart */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Portfolio Performance</CardTitle>
          <CardDescription className="text-gray-400">Your portfolio value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioChart />
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-400">Your latest transaction activity</CardDescription>
            </div>
            <Button
              onClick={() => (window.location.href = "/dashboard/transactions")}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.hash} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "send" ? "bg-red-900/30" : "bg-green-900/30"
                      }`}
                    >
                      {tx.type === "send" ? (
                        <Send className="h-5 w-5 text-red-400" />
                      ) : (
                        <Download className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{tx.type === "send" ? "Sent" : "Received"}</p>
                      <p className="text-gray-400 text-sm">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === "send" ? "text-red-400" : "text-green-400"}`}>
                      {tx.type === "send" ? "-" : "+"}
                      {tx.amount.toFixed(4)} SNC
                    </p>
                    <p className="text-gray-400 text-sm">{formatAddress(tx.type === "send" ? tx.to : tx.from)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-gray-500 text-sm mt-1">Your transaction history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showSendDialog && <SendDialog onClose={() => setShowSendDialog(false)} />}
      {showReceiveDialog && wallet && (
        <ReceiveDialog walletAddress={wallet.address} onClose={() => setShowReceiveDialog(false)} />
      )}
    </div>
  )
}
