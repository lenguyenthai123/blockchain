"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data for demonstration
const mockTxData = {
  hash: "0xabc123def456789...",
  status: "Success",
  block: 123456,
  timestamp: "2025-01-27 21:45:32 UTC",
  from: "san1qyzx7rf9g87gpdqf6jsc8j2zpkq9hg8tq5a3x4",
  to: "san1q8x7rf9g87gpdqf6jsc8j2zpkq9hg8tq5b9y5",
  value: "2.5 SNC",
  valueUSD: "$625.00",
  gasUsed: "21,000",
  gasPrice: "20 Gwei",
  txFee: "0.00042 SNC",
  nonce: 147,
  position: 23,
}

export default function TransactionDetailsPage({ params }: { params: { hash: string } }) {
  const { hash } = params

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <Badge variant="outline" className="bg-green-900/50 text-green-300">
          {mockTxData.status}
        </Badge>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-400 min-w-32">Transaction Hash:</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-sm break-all">{hash}</span>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(hash)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Status:</span>
              <Badge variant="outline" className="bg-green-900/50 text-green-300">
                {mockTxData.status}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Block:</span>
              <Link href={`/explorer/block/${mockTxData.block}`} className="text-cyan-400 hover:underline">
                {mockTxData.block}
              </Link>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Timestamp:</span>
              <span className="text-sm">{mockTxData.timestamp}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-400 min-w-32">From:</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/explorer/address/${mockTxData.from}`}
                  className="font-mono text-sm text-cyan-400 hover:underline break-all"
                >
                  {mockTxData.from}
                </Link>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(mockTxData.from)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="p-2 bg-gray-800 rounded-full">
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </div>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-400 min-w-32">To:</span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/explorer/address/${mockTxData.to}`}
                  className="font-mono text-sm text-cyan-400 hover:underline break-all"
                >
                  {mockTxData.to}
                </Link>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(mockTxData.to)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Value:</span>
              <div className="text-right">
                <p className="font-semibold">{mockTxData.value}</p>
                <p className="text-sm text-gray-500">{mockTxData.valueUSD}</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Transaction Fee:</span>
              <span className="text-sm">{mockTxData.txFee}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Gas Used:</span>
              <span className="text-sm">{mockTxData.gasUsed}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Gas Price:</span>
              <span className="text-sm">{mockTxData.gasPrice}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Nonce:</span>
              <span className="text-sm">{mockTxData.nonce}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Position in Block:</span>
              <span className="text-sm">{mockTxData.position}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
