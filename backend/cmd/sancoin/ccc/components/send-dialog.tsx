"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpCircle, Loader2, AlertTriangle, CheckCircle, Copy } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TransactionPreview {
  toAddress: string
  amount: number
  fee: number
  total: number
  utxosUsed: number
  change: number
}

export default function SendDialog() {
  const { balance, utxos, sendTransaction, isLoading, wallet } = useWallet()
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"form" | "preview" | "sending" | "success">("form")
  const [txPreview, setTxPreview] = useState<TransactionPreview | null>(null)
  const [txHash, setTxHash] = useState("")

  const fee = 0.001 // Fixed fee for now

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStep("form")
      setToAddress("")
      setAmount("")
      setError("")
      setSuccess("")
      setTxPreview(null)
      setTxHash("")
    }
  }, [isOpen])

  // Validate address format
  const isValidAddress = (address: string): boolean => {
    return /^san1[a-zA-Z0-9]{32,}$/.test(address) || /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // Calculate transaction preview
  const calculatePreview = (toAddr: string, amt: number): TransactionPreview | null => {
    if (!isValidAddress(toAddr) || amt <= 0 || amt + fee > balance) {
      return null
    }

    // Simple UTXO selection (largest first)
    let totalInput = 0
    let utxosUsed = 0

    for (const utxo of utxos.sort((a, b) => b.amount - a.amount)) {
      totalInput += utxo.amount
      utxosUsed++
      if (totalInput >= amt + fee) break
    }

    const change = totalInput - amt - fee

    return {
      toAddress: toAddr,
      amount: amt,
      fee,
      total: amt + fee,
      utxosUsed,
      change,
    }
  }

  const handleNext = () => {
    setError("")

    // Validation
    if (!toAddress.trim()) {
      setError("Please enter recipient address")
      return
    }

    if (!isValidAddress(toAddress.trim())) {
      setError("Invalid address format")
      return
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter valid amount")
      return
    }

    const amountNum = Number.parseFloat(amount)

    if (amountNum + fee > balance) {
      setError(`Insufficient balance. Need ${(amountNum + fee).toFixed(4)} SNC (including ${fee} SNC fee)`)
      return
    }

    if (utxos.length === 0) {
      setError("No UTXOs available for spending")
      return
    }

    // Calculate preview
    const preview = calculatePreview(toAddress.trim(), amountNum)
    if (!preview) {
      setError("Unable to create transaction")
      return
    }

    setTxPreview(preview)
    setStep("preview")
  }

  const handleSend = async () => {
    if (!txPreview) return

    setStep("sending")
    try {
      const hash = await sendTransaction(txPreview.toAddress, txPreview.amount)
      setTxHash(hash)
      setStep("success")
    } catch (error: any) {
      setError(error.message || "Failed to send transaction")
      setStep("form")
    }
  }

  const handleMaxClick = () => {
    const maxAmount = Math.max(0, balance - fee)
    setAmount(maxAmount.toString())
  }

  const copyTxHash = () => {
    navigator.clipboard.writeText(txHash)
    alert("Transaction hash copied!")
  }

  const renderStep = () => {
    switch (step) {
      case "form":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Send SanCoin (SNC)</DialogTitle>
              <DialogDescription>Enter recipient address and amount to send.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="address">Recipient Address</Label>
                <Input
                  type="text"
                  id="address"
                  placeholder="san1q... or 0x..."
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  className="bg-gray-800 border-gray-600 focus:ring-cyan-500 font-mono text-sm"
                  disabled={isLoading}
                />
                {toAddress && !isValidAddress(toAddress) && (
                  <p className="text-xs text-red-400">Invalid address format</p>
                )}
              </div>

              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    id="amount"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.0001"
                    min="0"
                    max={balance - fee}
                    className="bg-gray-800 border-gray-600 focus:ring-cyan-500 pr-16"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="absolute right-1 top-1 h-8 px-2 text-cyan-400 hover:text-cyan-300"
                    disabled={isLoading}
                  >
                    MAX
                  </Button>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Available: {balance.toFixed(4)} SNC</span>
                  <span>UTXOs: {utxos.length}</span>
                </div>
                <p className="text-xs text-gray-400">Network fee: {fee} SNC</p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-700/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleNext} className="bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                Next
              </Button>
            </DialogFooter>
          </>
        )

      case "preview":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Transaction</DialogTitle>
              <DialogDescription>Please review the transaction details before sending.</DialogDescription>
            </DialogHeader>
            {txPreview && (
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">To:</span>
                    <span className="font-mono text-sm">
                      {txPreview.toAddress.substring(0, 10)}...
                      {txPreview.toAddress.substring(txPreview.toAddress.length - 6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-semibold">{txPreview.amount.toFixed(4)} SNC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee:</span>
                    <span>{txPreview.fee.toFixed(4)} SNC</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{txPreview.total.toFixed(4)} SNC</span>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">UTXOs Used:</span>
                      <span className="ml-2">{txPreview.utxosUsed}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Change:</span>
                      <span className="ml-2">{txPreview.change.toFixed(4)} SNC</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button onClick={handleSend} className="bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                Send Transaction
              </Button>
            </DialogFooter>
          </>
        )

      case "sending":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Processing Transaction</DialogTitle>
              <DialogDescription>Mining your transaction on the blockchain...</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mb-4" />
              <p className="text-gray-400 text-center">
                Your transaction is being processed and mined.
                <br />
                This may take a few moments...
              </p>
            </div>
          </>
        )

      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Transaction Sent!
              </DialogTitle>
              <DialogDescription>Your transaction has been successfully mined.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Transaction Hash:</span>
                  <Button variant="ghost" size="sm" onClick={copyTxHash} className="h-6 w-6 p-0">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-mono text-sm mt-1 break-all">{txHash}</p>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  Confirmed
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsOpen(false)} className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                Done
              </Button>
            </DialogFooter>
          </>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-6 text-base">
          <ArrowUpCircle className="mr-2 h-5 w-5" /> Send
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">{renderStep()}</DialogContent>
    </Dialog>
  )
}
