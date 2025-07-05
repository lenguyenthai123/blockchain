"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { sendTransaction, estimateTransactionFee } from "@/lib/blockchain"

interface SendTransactionProps {
  wallet: any
}

export default function SendTransaction({ wallet }: SendTransactionProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [gasPrice, setGasPrice] = useState("20")
  const [estimatedFee, setEstimatedFee] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")
  const [error, setError] = useState("")

  const handleEstimateFee = async () => {
    if (!recipient || !amount) {
      setError("Please enter recipient and amount first")
      return
    }

    try {
      setError("")
      const fee = await estimateTransactionFee(recipient, Number.parseFloat(amount), Number.parseInt(gasPrice))
      setEstimatedFee(fee || 0)
    } catch (err) {
      console.error("Fee estimation error:", err)
      setError("Failed to estimate transaction fee")
    }
  }

  const handleSendTransaction = async () => {
    if (!recipient || !amount) {
      setError("Please fill in all required fields")
      return
    }

    if (!wallet?.address) {
      setError("Invalid wallet")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const txHash = await sendTransaction({
        from: wallet.address,
        to: recipient,
        amount: Number.parseFloat(amount),
        gasPrice: Number.parseInt(gasPrice),
        message: message,
        privateKey: wallet.privateKey || wallet.private_key,
      })

      setTransactionHash(txHash)
      setRecipient("")
      setAmount("")
      setMessage("")
      setEstimatedFee(0)
    } catch (err) {
      console.error("Transaction error:", err)
      setError("Transaction failed. Please check your inputs and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if wallet is valid
  if (!wallet?.address) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Invalid wallet. Please create or import a wallet first.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Send className="h-6 w-6 text-orange-600" />
            Send ThaiCoin
          </CardTitle>
          <CardDescription className="text-base">Send ThaiCoin to another wallet address</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {transactionHash && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Transaction sent successfully! Hash: {transactionHash}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (THC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
            <Input
              id="gasPrice"
              type="number"
              value={gasPrice}
              onChange={(e) => setGasPrice(e.target.value)}
              placeholder="20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to your transaction"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEstimateFee} variant="outline" className="flex-1 bg-transparent">
              Estimate Fee
            </Button>
            <Button onClick={handleSendTransaction} disabled={isLoading || !recipient || !amount} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Transaction
                </>
              )}
            </Button>
          </div>

          {estimatedFee > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimated Fee:</span>
                <Badge variant="secondary">{estimatedFee.toFixed(6)} THC</Badge>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Total Cost:</span>
                <Badge variant="default">{(Number.parseFloat(amount || "0") + estimatedFee).toFixed(6)} THC</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Send Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Send</CardTitle>
          <CardDescription>Common transaction amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[0.1, 0.5, 1.0, 5.0].map((value) => (
              <Button key={value} variant="outline" onClick={() => setAmount(value.toString())} className="text-sm">
                {value} THC
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
