"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-sm">
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              Create Wallet
            </TabsTrigger>
            <TabsTrigger value="dashboard" disabled={!activeWallet} className="flex items-center gap-2">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="send" disabled={!activeWallet} className="flex items-center gap-2">
              Send
            </TabsTrigger>
            <TabsTrigger value="history" disabled={!activeWallet} className="flex items-center gap-2">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorer">
            <BlockchainExplorer />
          </TabsContent>

          <TabsContent value="create">
            <CreateWallet onWalletCreated={handleWalletCreated} onWalletImported={handleWalletImported} />
          </TabsContent>

          <TabsContent value="dashboard">{activeWallet && <WalletDashboard wallet={activeWallet} />}</TabsContent>

          <TabsContent value="send">{activeWallet && <SendTransaction wallet={activeWallet} />}</TabsContent>

          <TabsContent value="history">{activeWallet && <TransactionHistory wallet={activeWallet} />}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
