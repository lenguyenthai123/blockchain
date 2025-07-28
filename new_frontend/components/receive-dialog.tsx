"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Download, Copy, Check } from "lucide-react"

interface ReceiveDialogProps {
  walletAddress: string
  onClose: () => void
}

export default function ReceiveDialog({ walletAddress, onClose }: ReceiveDialogProps) {
  const [amount, setAmount] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy address:", error)
    }
  }

  const generateQRData = () => {
    if (amount && Number(amount) > 0) {
      return `sancoin:${walletAddress}?amount=${amount}`
    }
    return walletAddress
  }

  // Generate QR code URL using a real QR code service
  const getQRCodeURL = () => {
    const data = generateQRData()
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="h-5 w-5" />
                Receive SanCoin
              </CardTitle>
              <CardDescription className="text-gray-400">Share your address to receive SNC</CardDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={getQRCodeURL() || "/placeholder.svg"}
                alt="QR Code for wallet address"
                className="w-48 h-48"
                onError={(e) => {
                  // Fallback if QR service fails
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-48 h-48 flex items-center justify-center bg-gray-100">
                        <div class="text-center text-gray-600">
                          <div class="text-4xl mb-2">📱</div>
                          <div class="text-sm">QR Code</div>
                          <div class="text-xs mt-1">${amount ? `${amount} SNC` : "Address"}</div>
                        </div>
                      </div>
                    `
                  }
                }}
              />
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label className="text-gray-300">Your Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                value={walletAddress}
                readOnly
                className="bg-gray-800 border-gray-600 text-white font-mono text-sm"
              />
              <Button
                onClick={handleCopyAddress}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-3 bg-transparent"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Optional Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Amount (Optional)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.0001"
              placeholder="0.0000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400">Specify an amount to include in the QR code</p>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">How to receive SanCoin:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Share your wallet address with the sender</li>
              <li>• Or let them scan the QR code</li>
              <li>• Transactions will appear in your history</li>
              <li>• Always verify the amount before confirming</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Close
            </Button>
            <Button onClick={handleCopyAddress} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900">
              {copied ? "Copied!" : "Copy Address"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
