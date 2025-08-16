"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Copy, Settings, Bell } from "lucide-react"
import TransactionHistory from "./transaction-history"
import SendDialog from "./send-dialog"
import ReceiveDialog from "./receive-dialog"
import Image from "next/image"
import { useWallet } from "@/contexts/wallet-context"

export default function WalletDashboard() {
  const { wallet, balance, isLoading, isInitializing } = useWallet()

  if (isInitializing) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full bg-gray-900 border-gray-700 shadow-lg shadow-cyan-500/10">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-400 text-center">Initializing wallet...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full bg-gray-900 border-gray-700 shadow-lg shadow-cyan-500/10">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <p className="text-gray-400 text-center mb-4">No wallet connected</p>
            <p className="text-sm text-gray-500 text-center">Please create or import a wallet to continue</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(wallet.address)
    alert("Address copied to clipboard!")
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <header className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="SanWallet Logo" width={32} height={32} />
          <h1 className="text-xl font-bold">SanWallet</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Card className="w-full bg-gray-900 border-gray-700 shadow-lg shadow-cyan-500/10">
        <CardHeader className="text-center">
          <CardDescription className="text-gray-400">My Account</CardDescription>
          <div className="flex items-center justify-center gap-2 mt-1">
            <CardTitle className="text-sm font-mono text-gray-300">
              {`${wallet.address.substring(0, 8)}...${wallet.address.substring(wallet.address.length - 4)}`}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-6 w-6 text-gray-400 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-700 rounded w-32 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-16 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-5xl font-bold tracking-tighter">{balance.toFixed(4)}</p>
                <p className="text-lg font-semibold text-cyan-400">SNC</p>
              </>
            )}
          </div>

          <div className="flex w-full gap-4">
            <SendDialog />
            <ReceiveDialog walletAddress={wallet.address} />
          </div>
        </CardContent>

        <Separator className="bg-gray-700" />

        <CardFooter className="p-0">
          <TransactionHistory />
        </CardFooter>
      </Card>
    </div>
  )
}
