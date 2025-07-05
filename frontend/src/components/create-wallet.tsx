"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Download, Eye, EyeOff, Shield, Key, Sparkles, Wallet, FileKey } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateWallet = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    if (!password) {
      alert("Please enter a password!")
      return
    }

    setIsLoading(true)
    try {
      const wallet = await generateWallet(password)
      const mappedWallet = {
        address: wallet.address,
        privateKey: wallet.privateKey || wallet.private_key,
        mnemonic: wallet.mnemonic,
        createdAt: wallet.createdAt || wallet.created_at,
      }
      setNewWallet(mappedWallet)
    } catch (error) {
      console.error("Failed to create wallet:", error)
      alert("Failed to create wallet! Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportFromPrivateKey = async () => {
    if (!importPrivateKey || !password) {
      alert("Please fill in all fields!")
      return
    }

    try {
      const wallet = await importWalletFromPrivateKey(importPrivateKey, password)
      onWalletImported(wallet)
    } catch (error) {
      console.error("Import error:", error)
      alert("Invalid private key!")
    }
  }

  const handleImportFromMnemonic = async () => {
    if (!importMnemonic || !password) {
      alert("Please fill in all fields!")
      return
    }

    try {
      const wallet = await importWalletFromMnemonic(importMnemonic, password)
      onWalletImported(wallet)
    } catch (error) {
      console.error("Import error:", error)
      alert("Invalid mnemonic phrase!")
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("✨ Copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
      alert("Failed to copy to clipboard!")
    }
  }

  const downloadWallet = () => {
    if (!newWallet) {
      alert("No wallet data to download!")
      return
    }

    try {
      const walletData = {
        address: newWallet.address,
        private_key: newWallet.privateKey,
        mnemonic: newWallet.mnemonic,
        created_at: newWallet.createdAt || new Date().toISOString(),
        coin: "ThaiCoin",
        version: "1.0.0",
      }

      const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `thaicoin-wallet-${newWallet.address.slice(0, 8)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert("🎉 Wallet downloaded successfully!")
    } catch (error) {
      console.error("Download failed:", error)
      alert("Failed to download wallet!")
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-2">
          <TabsTrigger
            value="create"
            className="rounded-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Create New Wallet
          </TabsTrigger>
          <TabsTrigger
            value="import-key"
            className="rounded-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
          >
            Import Private Key
          </TabsTrigger>
          <TabsTrigger
            value="import-mnemonic"
            className="rounded-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
          >
            Import Mnemonic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="thai-card card-hover">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-white/20 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <span className="text-thai-gradient">Create New Wallet</span>
                <Sparkles className="h-6 w-6 text-yellow-400 sparkle" />
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                🇹🇭 Generate a new ThaiCoin wallet with private key and mnemonic phrase
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {!newWallet ? (
                <>
                  <div className="space-y-4">
                    <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                      🔐 Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a strong password"
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
                      🔒 Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleCreateWallet}
                    className="w-full h-14 text-lg font-bold thai-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Generating Magic...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-6 w-6 mr-3" />✨ Generate Wallet
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  <Alert className="border-green-200 bg-green-50">
                    <Shield className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium">
                      🎉 Your wallet has been created successfully! Please save your private key and mnemonic phrase
                      securely.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-6">
                    <div className="glass rounded-xl p-6">
                      <Label className="text-base font-semibold text-gray-700 mb-3 block">📍 Wallet Address</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          value={newWallet.address || "Error: No address"}
                          readOnly
                          className="font-mono text-sm h-12 bg-gray-50 border-2"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(newWallet.address)}
                          disabled={!newWallet.address}
                          className="h-12 px-4 interactive"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                      <Label className="text-base font-semibold text-gray-700 mb-3 block">🔑 Private Key</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type={showPrivateKey ? "text" : "password"}
                          value={newWallet.privateKey || "Error: No private key"}
                          readOnly
                          className="font-mono text-sm h-12 bg-gray-50 border-2"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                          className="h-12 px-4 interactive"
                        >
                          {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(newWallet.privateKey)}
                          disabled={!newWallet.privateKey}
                          className="h-12 px-4 interactive"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="glass rounded-xl p-6">
                      <Label className="text-base font-semibold text-gray-700 mb-3 block">📝 Mnemonic Phrase</Label>
                      <div className="flex items-center gap-3">
                        <Textarea
                          value={newWallet.mnemonic || "Error: No mnemonic"}
                          readOnly
                          className="min-h-[100px] font-mono text-sm bg-gray-50 border-2 resize-none"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(newWallet.mnemonic)}
                          disabled={!newWallet.mnemonic}
                          className="h-12 px-4 interactive"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={downloadWallet}
                      variant="outline"
                      className="flex-1 h-14 text-lg font-semibold bg-white hover:bg-gray-50 border-2 border-gray-300 interactive"
                    >
                      <Download className="h-6 w-6 mr-3" />💾 Download Wallet
                    </Button>
                    <Button
                      onClick={() => onWalletCreated(newWallet)}
                      className="flex-1 h-14 text-lg font-bold thai-button"
                    >
                      <Wallet className="h-6 w-6 mr-3" />🚀 Access Wallet
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-key">
          <Card className="thai-card card-hover">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                  <Key className="h-8 w-8 text-white" />
                </div>
                <span className="text-thai-gradient">Import from Private Key</span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Import an existing wallet using your private key
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Label htmlFor="privateKey" className="text-base font-semibold text-gray-700">
                  🔑 Private Key
                </Label>
                <Input
                  id="privateKey"
                  type="password"
                  value={importPrivateKey}
                  onChange={(e) => setImportPrivateKey(e.target.value)}
                  placeholder="Enter your private key"
                  className="h-12 text-lg border-2 border-gray-200 focus:border-green-400 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="importPassword" className="text-base font-semibold text-gray-700">
                  🔐 Password
                </Label>
                <Input
                  id="importPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter wallet password"
                  className="h-12 text-lg border-2 border-gray-200 focus:border-green-400 rounded-xl"
                />
              </div>
              <Button
                onClick={handleImportFromPrivateKey}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white interactive"
              >
                <FileKey className="h-6 w-6 mr-3" />🔓 Import Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-mnemonic">
          <Card className="thai-card card-hover">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <FileKey className="h-8 w-8 text-white" />
                </div>
                <span className="text-thai-gradient">Import from Mnemonic</span>
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Import an existing wallet using your mnemonic phrase
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Label htmlFor="mnemonic" className="text-base font-semibold text-gray-700">
                  📝 Mnemonic Phrase
                </Label>
                <Textarea
                  id="mnemonic"
                  value={importMnemonic}
                  onChange={(e) => setImportMnemonic(e.target.value)}
                  placeholder="Enter your 12-word mnemonic phrase"
                  className="min-h-[120px] text-lg border-2 border-gray-200 focus:border-orange-400 rounded-xl font-mono resize-none"
                />
              </div>
              <div className="space-y-4">
                <Label htmlFor="mnemonicPassword" className="text-base font-semibold text-gray-700">
                  🔐 Password
                </Label>
                <Input
                  id="mnemonicPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter wallet password"
                  className="h-12 text-lg border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                />
              </div>
              <Button
                onClick={handleImportFromMnemonic}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white interactive"
              >
                <Key className="h-6 w-6 mr-3" />📥 Import Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
