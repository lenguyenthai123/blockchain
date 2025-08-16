"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Bug, RefreshCw } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { wallet, balance, transactions, utxos, isLoading, networkStatus, lastSyncTime, refreshAll } = useWallet()

  const debugInfo = {
    wallet: {
      address: wallet?.address || "Not connected",
      publicKey: wallet?.publicKey ? `${wallet.publicKey.slice(0, 10)}...` : "N/A",
      privateKey: wallet?.privateKey ? "***HIDDEN***" : "N/A",
    },
    state: {
      balance,
      transactionCount: transactions.length,
      utxoCount: utxos.length,
      isLoading,
      networkStatus,
      lastSync: lastSyncTime?.toISOString() || "Never",
    },
    network: {
      endpoint: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      status: networkStatus,
    },
  }

  return (
    <Card className="mt-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <CardTitle className="text-lg">Debug Panel</CardTitle>
                <Badge variant="outline" className="text-xs">
                  Development
                </Badge>
              </div>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
            <CardDescription>Wallet and network debugging information</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Debug Information</h4>
              <Button variant="outline" size="sm" onClick={refreshAll} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Wallet Info */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Wallet Information</h5>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-x-auto">{JSON.stringify(debugInfo.wallet, null, 2)}</pre>
              </div>
            </div>

            {/* State Info */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Application State</h5>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-x-auto">{JSON.stringify(debugInfo.state, null, 2)}</pre>
              </div>
            </div>

            {/* Network Info */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Network Information</h5>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-x-auto">{JSON.stringify(debugInfo.network, null, 2)}</pre>
              </div>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Recent Transactions (Last 3)</h5>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(transactions.slice(0, 3), null, 2)}</pre>
                </div>
              </div>
            )}

            {/* UTXOs */}
            {utxos.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-muted-foreground">Available UTXOs (Last 3)</h5>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(utxos.slice(0, 3), null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Environment Variables */}
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-muted-foreground">Environment</h5>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(
                    {
                      NODE_ENV: process.env.NODE_ENV,
                      API_URL: process.env.NEXT_PUBLIC_API_URL,
                      BUILD_TIME: new Date().toISOString(),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default DebugPanel
