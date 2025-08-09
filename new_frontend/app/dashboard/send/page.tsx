"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Send, ArrowLeft, CheckCircle, AlertCircle, ExternalLink, Wallet, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SendPage() {
  const { wallet, balance, sendTransaction, isLoading: walletLoading } = useWallet()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ hash: string } | null>(null)

  const handleSend = async () => {
    if (!wallet) {
      setError("No wallet connected")
      return
    }

    // Validation
    if (!recipient.trim()) {
      setError("Please enter a recipient address")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const sendAmount = Number.parseFloat(amount)
    const estimatedFee = 0.001 // 0.001 SAN fee
    const totalRequired = sendAmount + estimatedFee

    if (totalRequired > balance) {
      setError(`Insufficient balance. Required: ${totalRequired} SAN, Available: ${balance} SAN`)
      return
    }

    if (recipient === wallet.address) {
      setError("Cannot send to your own address")
      return
    }

    // Basic address validation (should start with 'san1')
    if (!recipient.startsWith("SNC") || recipient.length < 20) {
      setError("Invalid recipient address format")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("🚀 Sending transaction:", {
        from: wallet.address,
        to: recipient,
        amount: sendAmount,
        fee: estimatedFee,
      })

      const result = await sendTransaction(recipient, sendAmount)

      if (result) {
        console.log("✅ Transaction sent successfully:", result)
        setSuccess({ hash: result })
        setRecipient("")
        setAmount("")
      } else {
        throw new Error("Transaction failed")
      }
    } catch (err) {
      console.error("❌ Send transaction error:", err)
      setError(err instanceof Error ? err.message : "Failed to send transaction")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSuccess(null)
    setError(null)
    setRecipient("")
    setAmount("")
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Wallet className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Wallet Connected</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet to send transactions</p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="bg-cyan-500 hover:bg-cyan-600 text-gray-900"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">Transaction Sent</h1>
        </div>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-4">Transaction Successful!</h2>
            <p className="text-gray-400 mb-6">Your transaction has been broadcast to the network</p>

            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <Label className="text-sm text-gray-400">Transaction Hash</Label>
              <div className="flex items-center justify-between mt-2">
                <code className="text-sm text-cyan-400 font-mono break-all">{success.hash}</code>
                <Link
                  href={`/explorer/tx/${success.hash}`}
                  className="ml-3 text-cyan-400 hover:text-cyan-300 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                Send Another
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard/transactions")}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900"
              >
                View Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const estimatedFee = 0.001
  const sendAmount = Number.parseFloat(amount) || 0
  const totalAmount = sendAmount + estimatedFee

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Send SanCoin</h1>
      </div>

      {/* Balance Card */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm text-gray-400">Available Balance</Label>
              <p className="text-2xl font-bold text-white">
                {walletLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${balance.toFixed(6)} SAN`
                )}
              </p>
            </div>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400">
              {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Send Form */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Send className="h-5 w-5" />
            Send Transaction
          </CardTitle>
          <CardDescription>Enter the recipient address and amount to send</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-white">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              placeholder="SNC1234567890abcdef..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Amount (SAN)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              min="0"
              placeholder="0.000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max: {(balance - estimatedFee).toFixed(6)} SAN</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAmount((balance - estimatedFee).toFixed(6))}
                className="text-cyan-400 hover:text-cyan-300 h-auto p-0"
                disabled={isLoading || balance <= estimatedFee}
              >
                Use Max
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Transaction Summary */}
          <div className="space-y-3 bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-white">Transaction Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">{sendAmount.toFixed(6)} SAN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Network Fee:</span>
                <span className="text-white">{estimatedFee.toFixed(6)} SAN</span>
              </div>
              <Separator className="bg-gray-600" />
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total:</span>
                <span className="text-white">{totalAmount.toFixed(6)} SAN</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={
              isLoading ||
              walletLoading ||
              !recipient ||
              !amount ||
              Number.parseFloat(amount) <= 0 ||
              totalAmount > balance
            }
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Transaction...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Transaction
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
