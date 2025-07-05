"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, Wallet, Send, History, Search } from "lucide-react"
import CreateWallet from "@/components/create-wallet"
import WalletDashboard from "@/components/wallet-dashboard"
import SendTransaction from "@/components/send-transaction"
import TransactionHistory from "@/components/transaction-history"
import BlockchainExplorer from "@/components/blockchain-explorer"
import Header from "@/components/header"

export default function Home() {
  const [activeWallet, setActiveWallet] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("explorer")

  const handleWalletCreated = (wallet: any) => {
    setActiveWallet(wallet)
    setActiveTab("dashboard")
  }

  const handleWalletImported = (wallet: any) => {
    setActiveWallet(wallet)
    setActiveTab("dashboard")
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-2 border border-white/20">
            <TabsTrigger
              value="explorer"
              className="flex items-center gap-3 rounded-xl font-semibold text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg interactive"
            >
              <Search className="h-5 w-5" />
              Explorer
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="flex items-center gap-3 rounded-xl font-semibold text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg interactive"
            >
              <Coins className="h-5 w-5" />
              Create Wallet
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              disabled={!activeWallet}
              className="flex items-center gap-3 rounded-xl font-semibold text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg interactive disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="h-5 w-5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="send"
              disabled={!activeWallet}
              className="flex items-center gap-3 rounded-xl font-semibold text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg interactive disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              Send
            </TabsTrigger>
            <TabsTrigger
              value="history"
              disabled={!activeWallet}
              className="flex items-center gap-3 rounded-xl font-semibold text-base py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg interactive disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <History className="h-5 w-5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorer" className="mt-0">
            <BlockchainExplorer />
          </TabsContent>

          <TabsContent value="create" className="mt-0">
            <CreateWallet onWalletCreated={handleWalletCreated} onWalletImported={handleWalletImported} />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            {activeWallet && <WalletDashboard wallet={activeWallet} />}
          </TabsContent>

          <TabsContent value="send" className="mt-0">
            {activeWallet && <SendTransaction wallet={activeWallet} />}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {activeWallet && <TransactionHistory wallet={activeWallet} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
