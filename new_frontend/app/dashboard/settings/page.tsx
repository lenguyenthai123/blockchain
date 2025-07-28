"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Copy, Eye, EyeOff, Shield, Trash2, AlertTriangle, CheckCircle, Wallet } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { wallet, disconnect, exportWallet, balance, transactions, utxos } = useWallet()
  const router = useRouter()

  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [exportData, setExportData] = useState("")
  const [confirmDelete, setConfirmDelete] = useState("")

  const handleExportWallet = () => {
    const data = exportWallet()
    if (data) {
      setExportData(data)
      // Also download as file
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sanwallet-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    alert(`${type} copied to clipboard!`)
  }

  const handleDeleteWallet = () => {
    if (confirmDelete === "DELETE") {
      disconnect()
      router.push("/")
    }
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No wallet connected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet Settings</h1>
        <p className="text-gray-400 mt-1">Manage your wallet security and backup options</p>
      </div>

      {/* Wallet Information */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Information
          </CardTitle>
          <CardDescription>Basic information about your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Address</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={wallet.address} readOnly className="bg-gray-800 border-gray-600 font-mono text-sm" />
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(wallet.address, "Address")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Balance</Label>
              <div className="mt-1">
                <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                  {balance.toFixed(4)} SNC
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-400">Transactions</Label>
              <p className="text-lg font-semibold mt-1">{transactions.length}</p>
            </div>
            <div>
              <Label className="text-gray-400">UTXOs</Label>
              <p className="text-lg font-semibold mt-1">{utxos.length}</p>
            </div>
            <div>
              <Label className="text-gray-400">Portfolio Value</Label>
              <p className="text-lg font-semibold mt-1">${(balance * 250).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Backup */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Backup
          </CardTitle>
          <CardDescription>Backup your wallet and manage security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Private Key */}
          <div>
            <Label className="text-gray-400">Private Key</Label>
            <Alert className="bg-red-900/20 border-red-700/50 text-red-300 mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Never share your private key with anyone. Anyone with access to your private key can control your funds.
              </AlertDescription>
            </Alert>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type={showPrivateKey ? "text" : "password"}
                value={wallet.getPrivateKeyHex()}
                readOnly
                className="bg-gray-800 border-gray-600 font-mono text-sm"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(wallet.getPrivateKeyHex(), "Private key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Export Wallet */}
          <div>
            <Label className="text-gray-400">Export Wallet</Label>
            <p className="text-sm text-gray-500 mt-1">Download a backup file containing your wallet information</p>
            <Button onClick={handleExportWallet} className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-gray-900">
              <Download className="h-4 w-4 mr-2" />
              Export Wallet Backup
            </Button>

            {exportData && (
              <Alert className="bg-green-900/20 border-green-700/50 text-green-300 mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Wallet backup exported successfully! Keep this file safe and secure.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-900/20 border-red-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that will affect your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-900/30 border-red-700/50 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Deleting your wallet will remove all local data. Make sure you have backed up
              your private key or wallet file before proceeding.
            </AlertDescription>
          </Alert>

          <div>
            <Label className="text-gray-400">Delete Wallet</Label>
            <p className="text-sm text-gray-500 mt-1">Type "DELETE" to confirm wallet deletion</p>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Type DELETE to confirm"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
              <Button variant="destructive" onClick={handleDeleteWallet} disabled={confirmDelete !== "DELETE"}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
