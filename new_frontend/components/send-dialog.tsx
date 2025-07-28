"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Send, AlertCircle, Loader2 } from "lucide-react"

interface SendDialogProps {
  onClose: () => void
}

export default function SendDialog({ onClose }: SendDialogProps) {
  const { wallet, balance, sendTransaction, isLoading } = useWallet()
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSend = async () => {
    try {
      setError("")
      setSuccess("")

      // Validation
      if (!recipient.trim()) {
        setError("Please enter recipient address")
        return
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError("Please enter valid amount")
        return
      }

      const sendAmount = Number(amount)
      const fee = 0.0001

      if (sendAmount + fee > balance) {
        setError("Insufficient balance")
        return
      }

      if (!recipient.startsWith("SNC")) {
        setError("Invalid SanCoin address format")
        return
      }

      // Send transaction via API
      const txHash = await sendTransaction(recipient, sendAmount)
      setSuccess(`Transaction sent successfully! Hash: ${txHash.slice(0, 10)}...`)

      // Clear form
      setRecipient("")
      setAmount("")

      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Send failed:", error)
      setError(error instanceof Error ? error.message : "Failed to send transaction")
    }
  }

  const maxAmount = Math.max(0, balance - 0.0001)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send SanCoin
              </CardTitle>
              <CardDescription className="text-gray-400">Send SNC to another wallet address</CardDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance Display */}
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <div className="text-sm text-gray-400">Available Balance</div>
            <div className="text-lg font-semibold text-white">{balance.toFixed(4)} SNC</div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-300">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              type="text"
              placeholder="SNC1234567890abcdef..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Amount (SNC)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.0001"
                placeholder="0.0000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-16"
                max={maxAmount}
              />
              <Button
                onClick={() => setAmount(maxAmount.toString())}
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 text-xs text-cyan-400 hover:text-cyan-300"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Transaction Fee */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Transaction Fee:</span>
              <span className="text-white">0.0001 SNC</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Total:</span>
              <span className="text-white font-semibold">
                {amount ? (Number(amount) + 0.0001).toFixed(4) : "0.0001"} SNC
              </span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg">
              <span className="text-green-400 text-sm">{success}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !recipient || !amount}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send SNC
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
