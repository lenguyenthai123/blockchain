"use client"

import { useState, useMemo } from "react"
import { ArrowUpRight, ArrowDownLeft, Clock, ExternalLink, Search, Filter } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

type FilterType = "all" | "sent" | "received" | "mining"

export default function TransactionHistory() {
  const { wallet, transactions, isLoading, refreshTransactions } = useWallet()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")

  const filteredTransactions = useMemo(() => {
    if (!wallet) return []

    let filtered = transactions.filter((tx) => {
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        return (
          tx.hash.toLowerCase().includes(term) ||
          tx.outputs?.some((output) => output.address.toLowerCase().includes(term)) ||
          tx.inputs?.some((input) => input.previousTxHash.toLowerCase().includes(term))
        )
      }
      return true
    })

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((tx) => {
        const isIncoming = tx.outputs?.some((output) => output.address === wallet.address)
        const isCoinbase = tx.type === "coinbase"

        switch (filterType) {
          case "sent":
            return !isIncoming && !isCoinbase
          case "received":
            return isIncoming && !isCoinbase
          case "mining":
            return isCoinbase
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => (b.blockTimestamp || b.timestamp) - (a.blockTimestamp || a.timestamp))
  }, [wallet, transactions, searchTerm, filterType])

  const formatRelativeTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) return `${diffSeconds}s ago`
    const diffMinutes = Math.round(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.round(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getTransactionInfo = (tx: any) => {
    if (!wallet) return { type: "Unknown", amount: 0, icon: Clock, colorClass: "text-gray-400" }

    const isIncoming = tx.outputs?.some((output: any) => output.address === wallet.address)
    const isCoinbase = tx.type === "coinbase"

    if (isCoinbase) {
      return {
        type: "Mining Reward",
        amount: tx.outputs?.[0]?.amount || 0,
        icon: Clock,
        colorClass: "text-blue-400",
      }
    } else if (isIncoming) {
      return {
        type: "Received",
        amount: tx.outputs?.find((output: any) => output.address === wallet.address)?.amount || 0,
        icon: ArrowDownLeft,
        colorClass: "text-green-400",
      }
    } else {
      return {
        type: "Sent",
        amount: tx.outputs?.find((output: any) => output.address !== wallet.address)?.amount || 0,
        icon: ArrowUpRight,
        colorClass: "text-red-400",
      }
    }
  }

  if (!wallet) {
    return (
      <div className="w-full p-4 text-center">
        <p className="text-gray-400">Connect wallet to view transactions</p>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {filteredTransactions.length} of {transactions.length}
          </Badge>
          <Button variant="ghost" size="sm" onClick={refreshTransactions} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600"
          />
        </div>
        <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="mining">Mining</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            {searchTerm || filterType !== "all" ? (
              <>
                <p className="text-gray-400">No transactions match your filters</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-400">No transactions found</p>
                <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
              </>
            )}
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const { type, amount, icon: Icon, colorClass } = getTransactionInfo(tx)

            return (
              <div
                key={tx.hash}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-gray-800`}>
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{type}</p>
                    <p className="text-xs text-gray-400">
                      {tx.blockTimestamp ? formatRelativeTime(tx.blockTimestamp) : "Pending"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {tx.hash.substring(0, 10)}...{tx.hash.substring(tx.hash.length - 6)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold font-mono text-sm ${colorClass}`}>
                    {type === "Sent" ? "-" : "+"} {amount.toFixed(4)} SNC
                  </p>
                  <p className="text-xs text-gray-500">${(amount * 250).toFixed(2)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      #{tx.blockIndex || "Pending"}
                    </Badge>
                    <Link
                      href={`/explorer/tx/${tx.hash}`}
                      className="text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
