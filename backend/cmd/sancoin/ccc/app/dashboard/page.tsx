"use client"

import { useWallet } from "@/contexts/wallet-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { TransactionHistory } from "@/components/transaction-history"
import { SendDialog } from "@/components/send-dialog"
import { ReceiveDialog } from "@/components/receive-dialog"
import { DebugPanel } from "@/components/debug-panel"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const {
    isConnected,
    address,
    balance,
    getPortfolioValue,
    getTransactionHistory,
    networkStatus,
    lastSync,
    isLoading,
    error,
  } = useWallet()

  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({
    transactionsSent: 0,
    transactionsReceived: 0,
    pendingTransactions: 0,
  })

  useEffect(() => {
    if (isConnected && address) {
      loadTransactionData()
    }
  }, [isConnected, address])

  const loadTransactionData = async () => {
    try {
      const txHistory = await getTransactionHistory()
      setTransactions(txHistory)

      // Calculate stats
      const sent = txHistory.filter((tx) => tx.from === address).length
      const received = txHistory.filter((tx) => tx.to === address).length
      const pending = txHistory.filter((tx) => tx.status === "pending").length

      setStats({
        transactionsSent: sent,
        transactionsReceived: received,
        pendingTransactions: pending,
      })
    } catch (error) {
      console.error("Failed to load transaction data:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">No wallet connected</h2>
          <p className="text-gray-400 mb-4">Please create or import a wallet to continue</p>
        </div>
      </div>
    )
  }

  const portfolioValue = getPortfolioValue()

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              networkStatus === "online"
                ? "bg-green-500"
                : networkStatus === "connecting"
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          ></div>
          <span className="text-sm text-gray-400">
            {networkStatus === "online" ? "Online" : networkStatus === "connecting" ? "Connecting..." : "Offline"}
          </span>
          {lastSync && <span className="text-xs text-gray-500">Last sync: {lastSync.toLocaleTimeString()}</span>}
        </div>

        <Button variant="outline" size="sm" onClick={() => setShowDebugPanel(!showDebugPanel)}>
          Debug
        </Button>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && <DebugPanel />}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Portfolio Value"
          value={`$${portfolioValue.toFixed(2)}`}
          subtitle={`${balance.toFixed(4)} SNC`}
          icon="💰"
          isLoading={isLoading}
        />
        <StatCard
          title="Transactions Sent"
          value={stats.transactionsSent.toString()}
          subtitle="+12 this month"
          icon="📤"
          isLoading={isLoading}
        />
        <StatCard
          title="Transactions Received"
          value={stats.transactionsReceived.toString()}
          subtitle="+5 this month"
          icon="📥"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Transactions"
          value={stats.pendingTransactions.toString()}
          subtitle={`Totaling ${stats.pendingTransactions * 1.25} SNC`}
          icon="⏳"
          isLoading={isLoading}
        />
      </div>

      {/* Portfolio Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
        <PortfolioChart />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={() => setShowSendDialog(true)} className="flex-1">
          Send SNC
        </Button>
        <Button onClick={() => setShowReceiveDialog(true)} variant="outline" className="flex-1">
          Receive SNC
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <TransactionHistory transactions={transactions} />
      </div>

      {/* Dialogs */}
      <SendDialog open={showSendDialog} onOpenChange={setShowSendDialog} />
      <ReceiveDialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog} />
    </div>
  )
}
