"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TransactionsTable from "@/components/transactions-table"
import { sanCoinAPI, type TransactionWithDirection } from "@/lib/utxo-api"
import { useWallet } from "@/contexts/wallet-context"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  Coins,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "all" | "sent" | "received" | "mining"
type SortField = "timestamp" | "amount" | "block"
type SortOrder = "asc" | "desc"

export default function TransactionsPage() {
  const { wallet, isLoading: walletLoading } = useWallet()
  const [transactions, setTransactions] = useState<TransactionWithDirection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Fetch transactions
  const fetchTransactions = async (showRefresh = false) => {
    if (!wallet?.address) return

    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      setError(null)
      const txHistory = await sanCoinAPI.getTransactionHistory(wallet.address, 100)
      setTransactions(txHistory)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transactions. Please try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (wallet?.address && !walletLoading) {
      fetchTransactions()
    }
  }, [wallet?.address, walletLoading])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((tx) => {
        switch (filterType) {
          case "sent":
            return tx.direction === "sent"
          case "received":
            return tx.direction === "received" && tx.type !== "coinbase"
          case "mining":
            return tx.type === "coinbase"
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(query) ||
          tx.blockIndex.toString().includes(query) ||
          tx.counterpartyAddress?.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case "timestamp":
          aValue = a.timestamp
          bValue = b.timestamp
          break
        case "amount":
          aValue = Math.abs(a.netAmount)
          bValue = Math.abs(b.netAmount)
          break
        case "block":
          aValue = a.blockIndex
          bValue = b.blockIndex
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [transactions, filterType, searchQuery, sortField, sortOrder])

  // Calculate statistics
  const stats = useMemo(() => {
    const sent = transactions.filter((tx) => tx.direction === "sent")
    const received = transactions.filter((tx) => tx.direction === "received" && tx.type !== "coinbase")
    const mining = transactions.filter((tx) => tx.type === "coinbase")

    return {
      total: transactions.length,
      sent: {
        count: sent.length,
        amount: sent.reduce((sum, tx) => sum + Math.abs(tx.netAmount), 0),
      },
      received: {
        count: received.length,
        amount: received.reduce((sum, tx) => sum + tx.netAmount, 0),
      },
      mining: {
        count: mining.length,
        amount: mining.reduce((sum, tx) => sum + tx.netAmount, 0),
      },
    }
  }, [transactions])

  // Export to CSV
  const exportToCSV = () => {
    if (filteredAndSortedTransactions.length === 0) return

    const headers = [
      "Transaction Hash",
      "Type",
      "Direction",
      "Block",
      "Timestamp",
      "Amount (SNC)",
      "Fee (SNC)",
      "Counterparty Address",
    ]

    const csvData = filteredAndSortedTransactions.map((tx) => [
      tx.hash,
      tx.type,
      tx.direction,
      tx.blockIndex,
      new Date(tx.timestamp).toISOString(),
      tx.netAmount.toFixed(8),
      tx.fee.toFixed(8),
      tx.counterpartyAddress || "",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `transactions-${wallet?.address?.substring(0, 8)}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setFilterType("all")
    setSortField("timestamp")
    setSortOrder("desc")
  }

  const hasActiveFilters = searchQuery || filterType !== "all" || sortField !== "timestamp" || sortOrder !== "desc"

  // Loading state for wallet
  if (walletLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No wallet state
  if (!wallet?.address) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wallet Connected</h3>
            <p className="text-gray-500 text-center">
              Please create or import a wallet to view your transaction history.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-gray-500 mt-1">View and manage your SanCoin transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchTransactions(true)} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredAndSortedTransactions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Coins className="h-3 w-3 mr-1" />
              All time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.sent.count}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              {stats.sent.amount.toFixed(3)} SNC
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.received.count}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.received.amount.toFixed(3)} SNC
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Mining Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.mining.count}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Coins className="h-3 w-3 mr-1" />
              {stats.mining.amount.toFixed(3)} SNC
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by hash, block, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="sent">Sent Only</SelectItem>
                <SelectItem value="received">Received Only</SelectItem>
                <SelectItem value="mining">Mining Rewards</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortField}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-") as [SortField, SortOrder]
                setSortField(field)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp-desc">Newest First</SelectItem>
                <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                <SelectItem value="amount-desc">Highest Amount</SelectItem>
                <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                <SelectItem value="block-desc">Latest Block</SelectItem>
                <SelectItem value="block-asc">Earliest Block</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              {filterType !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Type: {filterType}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType("all")} />
                </Badge>
              )}
              {(sortField !== "timestamp" || sortOrder !== "desc") && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sort: {sortField} ({sortOrder})
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSortField("timestamp")
                      setSortOrder("desc")
                    }}
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions
        </span>
        {filterType !== "all" && (
          <span>
            Filtered by:{" "}
            <Badge variant="outline" className="ml-1">
              {filterType}
            </Badge>
          </span>
        )}
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {filteredAndSortedTransactions.length} of {transactions.length} transactions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                Sorted by {sortField} ({sortOrder})
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-400">Error Loading Transactions</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => fetchTransactions()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-400">No Transactions Found</h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria"
                  : "Your transaction history will appear here when you make transactions"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <TransactionsTable transactions={filteredAndSortedTransactions} userAddress={wallet.address} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
