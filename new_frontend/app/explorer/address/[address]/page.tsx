"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import TransactionsTable from "@/components/transactions-table"

// Mock data for demonstration
const mockAddressData = {
  address: "san1qyzx7rf9g87gpdqf6jsc8j2zpkq9hg8tq5a3x4",
  balance: "12.3456 SNC",
  balanceUSD: "$3,086.42",
  txCount: 1247,
  firstSeen: "2024-01-15",
  lastActivity: "2 mins ago",
}

const mockTransactions = [
  {
    hash: "0xabc123def456...",
    method: "Transfer",
    block: 123456,
    age: "2 mins ago",
    from: "san1qyzx7rf9g87gpdqf6jsc8j2zpkq9hg8tq5a3x4",
    to: "san1q...b9y5",
    value: 2.5,
    status: "Completed",
  },
  {
    hash: "0xdef456ghi789...",
    method: "Transfer",
    block: 123455,
    age: "10 mins ago",
    from: "san1q...c1z6",
    to: "san1qyzx7rf9g87gpdqf6jsc8j2zpkq9hg8tq5a3x4",
    value: 0.8,
    status: "Completed",
  },
]

export default function AddressDetailsPage({ params }: { params: { address: string } }) {
  const { address } = params

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
    alert("Address copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Address Details</h1>
        <Badge variant="outline" className="bg-green-900/50 text-green-300">
          Active
        </Badge>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Address Overview
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Balance</p>
                <p className="text-xl font-bold">{mockAddressData.balance}</p>
                <p className="text-sm text-gray-500">{mockAddressData.balanceUSD}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Transactions</p>
                <p className="text-lg font-semibold">{mockAddressData.txCount.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">First Seen</p>
                <p className="text-sm">{mockAddressData.firstSeen}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Activity</p>
                <p className="text-sm">{mockAddressData.lastActivity}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={mockTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
