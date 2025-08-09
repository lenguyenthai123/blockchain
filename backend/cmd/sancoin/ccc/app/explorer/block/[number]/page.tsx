"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import TransactionsTable from "@/components/transactions-table"

// Mock data for demonstration
const mockBlockData = {
  number: 123456,
  hash: "0xabc123def456789abcdef123456789abcdef123456789abcdef123456789abcdef",
  parentHash: "0xdef456abc789def456abc789def456abc789def456abc789def456abc789def456",
  timestamp: "2025-01-27 21:45:32 UTC",
  miner: "BuilderNet",
  difficulty: "15.5T",
  totalDifficulty: "58.7P",
  size: "125,432 bytes",
  gasUsed: "29,842,156",
  gasLimit: "30,000,000",
  baseFee: "12.5 Gwei",
  txCount: 217,
  reward: "2.5 SNC",
}

const mockTransactions = [
  {
    hash: "0xabc123def456...",
    method: "Transfer",
    block: 123456,
    age: "2 mins ago",
    from: "san1q...a3x4",
    to: "san1q...b9y5",
    value: 2.5,
    status: "Completed",
  },
  {
    hash: "0xdef456ghi789...",
    method: "Contract Call",
    block: 123456,
    age: "2 mins ago",
    from: "san1q...c1z6",
    to: "san1q...d7w8",
    value: 0.8,
    status: "Completed",
  },
]

export default function BlockDetailsPage({ params }: { params: { number: string } }) {
  const blockNumber = Number.parseInt(params.number)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Block #{blockNumber.toLocaleString()}</h1>
          <Badge variant="outline" className="bg-green-900/50 text-green-300">
            Finalized
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/explorer/block/${blockNumber - 1}`}>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/explorer/block/${blockNumber + 1}`}>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Block Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400 min-w-24">Block Hash:</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm break-all">{mockBlockData.hash}</span>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(mockBlockData.hash)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400 min-w-24">Parent Hash:</span>
                <div className="flex items-center gap-2 flex-1">
                  <Link
                    href={`/explorer/block/${blockNumber - 1}`}
                    className="font-mono text-sm text-cyan-400 hover:underline break-all"
                  >
                    {mockBlockData.parentHash}
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(mockBlockData.parentHash)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Timestamp:</span>
                <span className="text-sm">{mockBlockData.timestamp}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Miner:</span>
                <span className="text-sm text-cyan-400">{mockBlockData.miner}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Block Reward:</span>
                <span className="text-sm font-semibold">{mockBlockData.reward}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transactions:</span>
                <span className="text-sm font-semibold">{mockBlockData.txCount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Difficulty:</span>
                <span className="text-sm">{mockBlockData.difficulty}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Difficulty:</span>
                <span className="text-sm">{mockBlockData.totalDifficulty}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Size:</span>
                <span className="text-sm">{mockBlockData.size}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Gas Used:</span>
                <span className="text-sm">
                  {mockBlockData.gasUsed} (
                  {(
                    (Number.parseInt(mockBlockData.gasUsed.replace(/,/g, "")) /
                      Number.parseInt(mockBlockData.gasLimit.replace(/,/g, ""))) *
                    100
                  ).toFixed(1)}
                  %)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Gas Limit:</span>
                <span className="text-sm">{mockBlockData.gasLimit}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Base Fee:</span>
                <span className="text-sm">{mockBlockData.baseFee}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Transactions in this Block ({mockBlockData.txCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={mockTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
