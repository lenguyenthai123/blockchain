"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Search, ExternalLink, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"
import { getTransactionHistory, getTransactionDetails } from "@/lib/blockchain"

interface TransactionHistoryProps {
  wallet: any
}

export default function TransactionHistory({ wallet }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadTransactions = async () => {
      if (!wallet?.address) {
        setError("Invalid wallet address")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError("")
        const txHistory = await getTransactionHistory(wallet.address)
        setTransactions(txHistory || [])
        setFilteredTransactions(txHistory || [])
      } catch (error) {
        console.error("Failed to load transaction history:", error)
        setError("Failed to load transaction history")
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [wallet?.address])

  useEffect(() => {
    if (!transactions) return

    const filtered = transactions.filter(
      (tx) =>
        tx.tx_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from_address?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredTransactions(filtered)
  }, [searchTerm, transactions])

  const handleTransactionClick = async (txHash: string) => {
    try {
      const txDetails = await getTransactionDetails(txHash)
      setSelectedTx(txDetails)
    } catch (error) {
      console.error("Failed to load transaction details:", error)
      alert("Failed to load transaction details")
    }
  }

  const getTransactionType = (tx: any) => {
    if (!wallet?.address || !tx.from_address) return "unknown"
    return tx.from_address?.toLowerCase() === wallet.address.toLowerCase() ? "sent" : "received"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Show error state
  if (error) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-6 w-6 text-purple-600" />
            Transaction History
          </CardTitle>
          <CardDescription className="text-base">View all your ThaiCoin transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by transaction hash or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Transaction Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Hash</TableHead>
                    <TableHead>From/To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="h-4 w-4 animate-spin" />
                          Loading transactions...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const type = getTransactionType(tx)
                      return (
                        <TableRow key={tx.tx_hash} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {type === "sent" ? (
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-green-500" />
                              )}
                              <span className="capitalize">{type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{formatAddress(tx.tx_hash)}</code>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm">
                              {formatAddress(type === "sent" ? tx.to_address : tx.from_address)}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className={type === "sent" ? "text-red-600" : "text-green-600"}>
                              {type === "sent" ? "-" : "+"}
                              {typeof tx.value === "number" ? tx.value.toFixed(4) : "0.0000"} THC
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(tx.status)}>{tx.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">{formatDate(tx.timestamp)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleTransactionClick(tx.tx_hash)}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Detailed information about the selected transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction Hash</label>
                <code className="block text-sm bg-gray-100 p-2 rounded mt-1 break-all">{selectedTx.tx_hash}</code>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Block Number</label>
                <div className="text-sm mt-1">{selectedTx.block_number || "Pending"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">From</label>
                <code className="block text-sm bg-gray-100 p-2 rounded mt-1 break-all">{selectedTx.from_address}</code>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">To</label>
                <code className="block text-sm bg-gray-100 p-2 rounded mt-1 break-all">{selectedTx.to_address}</code>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <div className="text-lg font-semibold mt-1">
                  {typeof selectedTx.value === "number" ? selectedTx.value.toFixed(4) : "0.0000"} THC
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gas Used</label>
                <div className="text-sm mt-1">
                  {selectedTx.gas_used || 0} / {selectedTx.gas_limit || 0}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gas Price</label>
                <div className="text-sm mt-1">{selectedTx.gas_price || 0} Gwei</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction Fee</label>
                <div className="text-sm mt-1">
                  {typeof selectedTx.transaction_fee === "number" ? selectedTx.transaction_fee.toFixed(6) : "0.000000"}{" "}
                  THC
                </div>
              </div>
            </div>

            {selectedTx.message && (
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="text-sm bg-gray-100 p-2 rounded mt-1">{selectedTx.message}</div>
              </div>
            )}

            <Button onClick={() => setSelectedTx(null)} className="w-full">
              Close Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
