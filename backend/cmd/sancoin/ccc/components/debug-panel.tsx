"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useWallet } from "@/contexts/wallet-context"

export function DebugPanel() {
  const { address, refreshBalance, syncWithNetwork } = useWallet()
  const [testAddress, setTestAddress] = useState("")
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true)
    try {
      const result = await testFn()
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: false, error: error.message },
      }))
    }
    setIsLoading(false)
  }

  const tests = [
    {
      name: "Health Check",
      fn: () => api.healthCheck(),
    },
    {
      name: "Network Stats",
      fn: () => api.getNetworkStats(),
    },
    {
      name: "Latest Blocks",
      fn: () => api.getLatestBlocks(3),
    },
    {
      name: "Mempool",
      fn: () => api.getMempool(),
    },
    {
      name: "Balance (Current)",
      fn: () => (address ? api.getBalance(address) : Promise.reject("No address")),
    },
    {
      name: "Balance (Test)",
      fn: () => (testAddress ? api.getBalance(testAddress) : Promise.reject("No test address")),
    },
    {
      name: "UTXOs (Current)",
      fn: () => (address ? api.getUTXOs(address) : Promise.reject("No address")),
    },
    {
      name: "Transaction History",
      fn: () => (address ? api.getTransactionHistory(address) : Promise.reject("No address")),
    },
  ]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Address Input */}
        <div className="flex space-x-2">
          <Input
            placeholder="Test address for balance/UTXOs check"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => refreshBalance()} disabled={isLoading}>
            Refresh Balance
          </Button>
          <Button size="sm" onClick={() => syncWithNetwork()} disabled={isLoading}>
            Sync Network
          </Button>
        </div>

        {/* API Tests */}
        <div className="grid grid-cols-2 gap-2">
          {tests.map((test) => (
            <Button
              key={test.name}
              size="sm"
              variant="outline"
              onClick={() => runTest(test.name, test.fn)}
              disabled={isLoading}
              className="text-xs"
            >
              {test.name}
            </Button>
          ))}
        </div>

        {/* Test Results */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Object.entries(testResults).map(([testName, result]: [string, any]) => (
            <div
              key={testName}
              className={`p-3 rounded text-xs ${
                result.success ? "bg-green-900/50 border border-green-500" : "bg-red-900/50 border border-red-500"
              }`}
            >
              <div className="font-semibold mb-1">{testName}</div>
              {result.success ? (
                <pre className="text-green-200 whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
              ) : (
                <div className="text-red-200">{result.error}</div>
              )}
            </div>
          ))}
        </div>

        {/* Current State */}
        <div className="text-xs text-gray-400 space-y-1">
          <div>API Base: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}</div>
          <div>Current Address: {address || "None"}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
        </div>
      </CardContent>
    </Card>
  )
}
