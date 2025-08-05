"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, ShieldAlert, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWallet } from "@/contexts/wallet-context"
import { validateMnemonic } from "@/lib/crypto"

export default function ImportWalletPage() {
  const [step, setStep] = useState(1)
  const [phrase, setPhrase] = useState(Array(12).fill(""))
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { importWallet } = useWallet()

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrase = [...phrase]
    newPhrase[index] = value.trim().toLowerCase()
    setPhrase(newPhrase)
    setError("")
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if all fields are filled
      if (phrase.some((word) => word === "")) {
        setError("Please fill in all 12 words of your recovery phrase.")
        setIsLoading(false)
        return
      }

      // Join the phrase
      const mnemonicPhrase = phrase.join(" ")

      // Validate the mnemonic using our crypto library
      if (!validateMnemonic(mnemonicPhrase)) {
        setError("Invalid recovery phrase. Please check your words and try again.")
        setIsLoading(false)
        return
      }

      console.log("Mnemonic validated successfully, proceeding to password creation.")
      setStep(2)
    } catch (error) {
      console.error("Error validating mnemonic:", error)
      setError("Failed to validate recovery phrase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate password
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.")
        setIsLoading(false)
        return
      }

      // Import wallet using the mnemonic
      const mnemonicPhrase = phrase.join(" ")
      const success = await importWallet(mnemonicPhrase, password)

      if (success) {
        console.log("Wallet imported successfully.")
        // Automatically login with the imported mnemonic
        await importWallet(mnemonicPhrase, password)
        setStep(3)
      } else {
        setError("Failed to import wallet. Please check your recovery phrase and try again.")
      }
    } catch (error) {
      console.error("Error importing wallet:", error)
      setError("Failed to import wallet. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    // Go directly to dashboard since we're already logged in
    router.push("/dashboard")
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Enter Phrase
        return (
          <form onSubmit={handleImport}>
            <CardHeader>
              <CardTitle className="text-2xl">Import an Existing Wallet</CardTitle>
              <CardDescription>Enter your 12-word Secret Recovery Phrase to restore your wallet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-red-900/30 border-red-700/50 text-red-300">
                <ShieldAlert className="h-4 w-4 !text-red-300" />
                <AlertTitle>This is a sensitive operation.</AlertTitle>
                <AlertDescription>Ensure you are in a private and secure environment.</AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-700/50 text-red-300">
                  <AlertCircle className="h-4 w-4 !text-red-300" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-3 gap-4">
                {phrase.map((word, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-5 top-2.5 text-xs text-gray-500">{index + 1}.</span>
                    <Input
                      type="text"
                      value={word}
                      className="bg-gray-800"
                      onChange={(e) => handlePhraseChange(index, e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900" disabled={isLoading}>
                {isLoading ? "Validating..." : "Confirm Secret Recovery Phrase"}
              </Button>
            </CardFooter>
          </form>
        )
      case 2: // Create Password
        return (
          <form onSubmit={handleCreatePassword}>
            <CardHeader>
              <CardTitle className="text-2xl">Create a New Password</CardTitle>
              <CardDescription>This password will unlock your imported wallet only on this device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-red-700/50 text-red-300">
                  <AlertCircle className="h-4 w-4 !text-red-300" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password (8 characters min)</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="bg-gray-800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900" disabled={isLoading}>
                {isLoading ? "Importing..." : "Import Wallet"}
              </Button>
            </CardFooter>
          </form>
        )
      case 3: // Success
        return (
          <>
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <CardTitle className="text-2xl">Wallet Imported Successfully!</CardTitle>
              <CardDescription>Your wallet has been restored and is ready to use.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleGoToDashboard} className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                Go to Dashboard
              </Button>
            </CardFooter>
          </>
        )
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl bg-gray-900/50 border-gray-800 backdrop-blur-sm">{renderStep()}</Card>
    </div>
  )
}
