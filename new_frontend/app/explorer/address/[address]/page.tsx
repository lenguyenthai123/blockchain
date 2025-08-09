"use client"

import { use, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Loader2, RefreshCw, User } from "lucide-react"
import TransactionsTable from "@/components/transactions-table"
import { sanCoinAPI, type TransactionWithDirection } from "@/lib/utxo-api"
import { FancyBackground } from "@/components/decor/fancy-background"
import { MetricCard } from "@/components/ui/metric-card"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

type BalanceResponse = {
  success: boolean
  data: {
    address: string
    balance: number
  }
}

export default function AddressDetailsPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)

  const [balance, setBalance] = useState<number | null>(null)
  const [transactions, setTransactions] = useState<TransactionWithDirection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      // ignore
    }
  }

  async function loadData() {
    setError(null)
    setIsLoading(true)
    try {
      const balRes = await fetch(`${API_BASE_URL}/api/blockchain/balance/${address}`, {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      if (!balRes.ok) {
        const text = await balRes.text().catch(() => "")
        throw new Error(`Balance error ${balRes.status}: ${text || balRes.statusText}`)
      }
      const balJson = (await balRes.json()) as BalanceResponse
      const bal = typeof balJson?.data?.balance === "number" ? balJson.data.balance : 0
      setBalance(bal)

      // Pull typed transactions same as dashboard implementation (direction aware)
      const txs = await sanCoinAPI.getTransactionHistory(address, 50)
      setTransactions(txs)
    } catch (e: any) {
      setError(e?.message || "Failed to load address data")
    } finally {
      setIsLoading(false)
    }
  }

  async function refresh() {
    setIsRefreshing(true)
    await loadData().finally(() => setIsRefreshing(false))
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  const stats = useMemo(() => {
    const sent = transactions.filter((t) => t.direction === "sent")
    const received = transactions.filter((t) => t.direction === "received")
    const self = transactions.filter((t) => t.direction === "self")
    const totalSent = sent.reduce((sum, t) => sum + (t.netAmount || 0), 0)
    const totalReceived = received.reduce((sum, t) => sum + (t.netAmount || 0), 0)
    return {
      totalTxs: transactions.length,
      sentCount: sent.length,
      receivedCount: received.length,
      selfCount: self.length,
      totalSent,
      totalReceived,
      netFlow: totalReceived - totalSent,
    }
  }, [transactions])

  return (
    <FancyBackground>
      <div className="space-y-6">
        {/* Hero */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur">
            <User className="h-3 w-3 text-cyan-400" />
            Address
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
              {address.slice(0, 10)}...{address.slice(-8)}
            </span>
          </h1>
          <Badge variant="outline" className="bg-emerald-900/40 text-emerald-300 border-emerald-700/40">
            Live
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="border-white/15 bg-transparent"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Balance"
            value={
              isLoading || balance === null
                ? "—"
                : `${balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} SNC`
            }
            color="emerald"
          />
          <MetricCard label="Total TXs" value={isLoading ? "—" : stats.totalTxs} color="cyan" />
          <MetricCard label="Received" value={isLoading ? "—" : stats.receivedCount} color="violet" />
          <MetricCard label="Sent" value={isLoading ? "—" : stats.sentCount} color="amber" />
        </div>

        {/* Overview card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Address Overview
              <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy address">
                <Copy className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-900/20 text-red-300 px-4 py-2 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-mono text-sm break-all">{address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Net Flow (last 50 txs)</p>
                  <p className={stats.netFlow >= 0 ? "text-green-400" : "text-red-400"}>
                    {stats.netFlow >= 0 ? "+" : "-"}
                    {Math.abs(stats.netFlow).toLocaleString(undefined, { maximumFractionDigits: 6 })} SNC
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-gray-400">Total Received</p>
                  <p className="mt-1 text-lg font-semibold text-green-400">
                    {isLoading ? "—" : stats.totalReceived.toLocaleString(undefined, { maximumFractionDigits: 6 })} SNC
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-gray-400">Total Sent</p>
                  <p className="mt-1 text-lg font-semibold text-red-400">
                    {isLoading ? "—" : stats.totalSent.toLocaleString(undefined, { maximumFractionDigits: 6 })} SNC
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-400 py-8">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading transactions...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-sm text-gray-400 py-6">
                No transactions found for this address in the latest window.
              </div>
            ) : (
              <TransactionsTable transactions={transactions} userAddress={address} />
            )}
            <p className="text-xs text-gray-500 mt-4">
              Transactions follow the same direction rules as the dashboard (derived relative to this address).
            </p>
          </CardContent>
        </Card>
      </div>
    </FancyBackground>
  )
}
