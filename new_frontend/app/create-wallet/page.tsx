"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/wallet-context"
import { validatePassword, generateSecurePassword } from "@/lib/security"
import { SecureWalletStorage } from "@/lib/wallet-storage"

export default function CreateWalletPage() {
  const [step, setStep] = useState(1)
  const [phraseVisible, setPhraseVisible] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [generatedMnemonic, setGeneratedMnemonic] = useState("")
  const [generatedWallet, setGeneratedWallet] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const router = useRouter()
  const { createWallet } = useWallet()

  const handleCopy = () => {
    if (generatedMnemonic) {
      navigator.clipboard.writeText(generatedMnemonic)
      alert("Secret Recovery Phrase copied to clipboard!")
    }
  }

  const handleGeneratePhrase = async () => {
    try {
      setIsGenerating(true)
      console.log("🎲 Generating new secure wallet...")

      // Tạo wallet mới và lấy mnemonic thật
      const { wallet, mnemonic } = await createWallet()
      setGeneratedMnemonic(mnemonic)
      setGeneratedWallet(wallet)

      console.log("✅ Secure wallet generated successfully")
      setStep(2)
    } catch (error) {
      console.error("❌ Failed to generate wallet:", error)
      alert("Failed to generate wallet. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    const validation = validatePassword(value)
    setPasswordErrors(validation.errors)
  }

  const handleGeneratePassword = () => {
    const securePassword = generateSecurePassword(16)
    setPassword(securePassword)
    setConfirmPassword(securePassword)
    setPasswordErrors([])
    setShowPassword(true)
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    const validation = validatePassword(password)
    if (!validation.isValid) {
      setPasswordErrors(validation.errors)
      return
    }

    try {
      console.log("🔐 Securing wallet with password...")

      // Lưu wallet với mã hóa
      SecureWalletStorage.saveWallet(generatedWallet, generatedMnemonic, password)

      console.log("✅ Wallet secured successfully")
      setStep(4)
    } catch (error) {
      console.error("❌ Failed to secure wallet:", error)
      alert("Failed to secure wallet. Please try again.")
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Secure your wallet
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Secure Your Wallet</CardTitle>
              <CardDescription>
                Create a new secure wallet with a randomly generated 12-word recovery phrase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ShieldAlert className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Your wallet will be protected with:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• 12-word recovery phrase (BIP39 standard)</li>
                    <li>• Password encryption (PBKDF2 + 100k iterations)</li>
                    <li>• Secure local storage</li>
                    <li>• Session timeout protection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900"
                onClick={handleGeneratePhrase}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Secure Wallet...
                  </>
                ) : (
                  "Create Secure Wallet"
                )}
              </Button>
            </CardFooter>
          </>
        )
      case 2: // Reveal Phrase
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Secret Recovery Phrase</CardTitle>
              <CardDescription>
                Write down this 12-word phrase on paper and store it safely. This is the ONLY way to recover your
                wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-red-900/30 border-red-700/50 text-red-300">
                <ShieldAlert className="h-4 w-4 !text-red-300" />
                <AlertTitle>CRITICAL: Never share this phrase!</AlertTitle>
                <AlertDescription>
                  Anyone with this phrase can steal all your SanCoin. SanWallet will never ask for it.
                </AlertDescription>
              </Alert>
              <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-4">
                <div className={`grid grid-cols-3 gap-x-4 gap-y-2 font-mono text-lg ${!phraseVisible && "blur-md"}`}>
                  {generatedMnemonic.split(" ").map((word, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-gray-500 w-8 text-right pr-2">{index + 1}.</span>
                      <span className="text-white">{word}</span>
                    </div>
                  ))}
                </div>
                {!phraseVisible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                    <Button type="button" variant="secondary" onClick={() => setPhraseVisible(true)}>
                      <Eye className="mr-2 h-4 w-4" /> Reveal Phrase
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={handleCopy}
                  disabled={!generatedMnemonic}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy to clipboard
                </Button>
                <Button variant="outline" className="bg-transparent" onClick={() => setPhraseVisible(!phraseVisible)}>
                  {phraseVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900" onClick={() => setStep(3)}>
                I've Saved My Recovery Phrase
              </Button>
            </CardFooter>
          </>
        )
      case 3: // Create Password
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Create Secure Password</CardTitle>
              <CardDescription>
                This password encrypts your wallet on this device. Choose a strong password you'll remember.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="bg-gray-800 pr-20"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="text-xs bg-transparent"
                >
                  Generate Secure Password
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  className="bg-gray-800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {passwordErrors.length > 0 && (
                <Alert className="bg-yellow-900/30 border-yellow-700/50 text-yellow-300">
                  <AlertTitle>Password Requirements:</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="bg-blue-900/30 border-blue-700/50 text-blue-300">
                <AlertTitle>Security Features:</AlertTitle>
                <AlertDescription className="text-sm">
                  • Password is encrypted with PBKDF2 (100,000 iterations)
                  <br />• Wallet data is encrypted before storage
                  <br />• Session automatically expires after 30 minutes
                  <br />• If you forget your password, you can restore with your 12-word phrase
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900"
                onClick={handleCreatePassword}
                disabled={passwordErrors.length > 0 || !password || password !== confirmPassword}
              >
                Secure My Wallet
              </Button>
            </CardFooter>
          </>
        )
      case 4: // Success
        return (
          <>
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-2xl">Wallet Created Successfully!</CardTitle>
              <CardDescription>
                Your wallet is now secured with military-grade encryption. Keep your recovery phrase safe!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                <h4 className="font-semibold text-green-400 mb-2">Security Summary:</h4>
                <ul className="text-sm text-green-300 space-y-1">
                  <li>✅ 12-word recovery phrase generated</li>
                  <li>✅ Wallet encrypted with your password</li>
                  <li>✅ Secure storage configured</li>
                  <li>✅ Session timeout protection enabled</li>
                </ul>
              </div>
              <p className="text-gray-400 text-sm">
                Remember: Your recovery phrase is the master key to your wallet. Store it safely offline!
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900"
                onClick={() => router.push("/dashboard")}
              >
                Access My Secure Wallet
              </Button>
            </CardFooter>
          </>
        )
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-xl bg-gray-900/50 border-gray-800 backdrop-blur-sm">{renderStep()}</Card>
    </div>
  )
}
