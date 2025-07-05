"use client"

import { useState } from "react"
import Header from "@/components/header"
import BlockchainExplorer from "@/components/blockchain-explorer"
import CreateWallet from "@/components/create-wallet"
import WalletDashboard from "@/components/wallet-dashboard"
import SendTransaction from "@/components/send-transaction"
import TransactionHistory from "@/components/transaction-history"

export default function Home() {
  const [activeTab, setActiveTab] = useState("explorer")
  const [wallet, setWallet] = useState<any>(null)

  const renderContent = () => {
    switch (activeTab) {
      case "explorer":
        return <BlockchainExplorer />
      case "create-wallet":
        return <CreateWallet onWalletCreated={setWallet} />
      case "dashboard":
        return wallet ? (
          <WalletDashboard wallet={wallet} />
        ) : (
          <div className="thai-card p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No Wallet Connected</h3>
            <p className="text-gray-600 mb-4">Please create or connect a wallet to view your dashboard.</p>
            <button
              onClick={() => setActiveTab("create-wallet")}
              className="thai-button px-6 py-2 rounded-lg text-white font-medium"
            >
              Create Wallet
            </button>
          </div>
        )
      case "send":
        return wallet ? (
          <SendTransaction wallet={wallet} />
        ) : (
          <div className="thai-card p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No Wallet Connected</h3>
            <p className="text-gray-600 mb-4">Please create or connect a wallet to send transactions.</p>
            <button
              onClick={() => setActiveTab("create-wallet")}
              className="thai-button px-6 py-2 rounded-lg text-white font-medium"
            >
              Create Wallet
            </button>
          </div>
        )
      case "history":
        return wallet ? (
          <TransactionHistory wallet={wallet} />
        ) : (
          <div className="thai-card p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No Wallet Connected</h3>
            <p className="text-gray-600 mb-4">Please create or connect a wallet to view transaction history.</p>
            <button
              onClick={() => setActiveTab("create-wallet")}
              className="thai-button px-6 py-2 rounded-lg text-white font-medium"
            >
              Create Wallet
            </button>
          </div>
        )
      default:
        return <BlockchainExplorer />
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="thai-card p-2 mb-8 rounded-2xl">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("explorer")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "explorer"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Explorer
            </button>

            <button
              onClick={() => setActiveTab("create-wallet")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "create-wallet"
                  ? "bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Wallet
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("send")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "send"
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out">{renderContent()}</div>
      </div>

      {/* Wallet Status Indicator */}
      {wallet && (
        <div className="fixed bottom-6 right-6 thai-card p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full pulse-glow"></div>
            <div>
              <div className="text-sm font-medium">Wallet Connected</div>
              <div className="text-xs text-gray-500">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
