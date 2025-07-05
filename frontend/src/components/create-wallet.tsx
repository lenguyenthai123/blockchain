"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Download, Eye, EyeOff, Shield, Key } from "lucide-react"
import { generateWallet, importWalletFromPrivateKey, importWalletFromMnemonic } from "@/lib/crypto"

interface CreateWalletProps {
  onWalletCreated: (wallet: any) => void
  onWalletImported: (wallet: any) => void
}

export default function CreateWallet({ onWalletCreated, onWalletImported }: CreateWalletProps) {
  const [newWallet, setNewWallet] = useState<any>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [importPrivateKey, setImportPrivateKey] = useState("")
  const [importMnemonic, setImportMnemonic] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleCreateWallet = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    const wallet = generateWallet(password)
    setNewWallet(wallet)
  }

  const handleImportFromPrivateKey = () => {
    try {
      const wallet = importWalletFromPrivateKey(importPrivateKey, password)
      onWalletImported(wallet)
    } catch (error) {
      alert("Invalid private key!")
    }
  }

  const handleImportFromMnemonic = () => {
    try {
      const wallet = importWalletFromMnemonic(importMnemonic, password)
      onWalletImported(wallet)
    } catch (error) {
      alert("Invalid mnemonic phrase!")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const downloadWallet = () => {
    if (!newWallet) return

    const walletData = {
      address: newWallet.address,
      privateKey: newWallet.privateKey,
      mnemonic: newWallet.mnemonic,
      createdAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mycoin-wallet-${newWallet.address.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create New Wallet</TabsTrigger>
          <TabsTrigger value="import-key">Import Private Key</TabsTrigger>
          <TabsTrigger value="import-mnemonic">Import Mnemonic</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-6 w-6 text-blue-600" />
                Create New Wallet
              </CardTitle>
              <CardDescription className="text-base">
                Generate a new MyCoin wallet with private key and mnemonic phrase
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!newWallet ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>
                  <Button onClick={handleCreateWallet} className="w-full">
                    Generate Wallet
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your wallet has been created successfully! Please save your private key and mnemonic phrase
                      securely.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <Label>Wallet Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={newWallet.address} readOnly />
                        <Button size="sm" onClick={() => copyToClipboard(newWallet.address)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Private Key</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type={showPrivateKey ? "text" : "password"} value={newWallet.privateKey} readOnly />
                        <Button size="sm" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                          {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" onClick={() => copyToClipboard(newWallet.privateKey)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Mnemonic Phrase</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Textarea value={newWallet.mnemonic} readOnly className="min-h-[80px]" />
                        <Button size="sm" onClick={() => copyToClipboard(newWallet.mnemonic)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={downloadWallet} variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download Wallet
                    </Button>
                    <Button onClick={() => onWalletCreated(newWallet)} className="flex-1">
                      Access Wallet
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-key">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Import from Private Key
              </CardTitle>
              <CardDescription>Import an existing wallet using your private key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key</Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={importPrivateKey}
                  onChange={(e) => setImportPrivateKey(e.target.value)}
                  placeholder="Enter your private key"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="importPassword">Password</Label>
                <Input
                  id="importPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter wallet password"
                />
              </div>
              <Button onClick={handleImportFromPrivateKey} className="w-full">
                Import Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-mnemonic">
          <Card>
            <CardHeader>
              <CardTitle>Import from Mnemonic</CardTitle>
              <CardDescription>Import an existing wallet using your mnemonic phrase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mnemonic">Mnemonic Phrase</Label>
                <Textarea
                  id="mnemonic"
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                  placeholder="Enter your 12-word mnemonic phrase"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mnemonicPassword">Password</Label>
                <Input
                  id="mnemonicPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter wallet password"
                />
              </div>
              <Button onClick={handleImportFromMnemonic} className="w-full">
                Import Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
