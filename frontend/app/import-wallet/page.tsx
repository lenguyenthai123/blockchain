"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  ShieldAlert,
  Download,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Key,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useWallet } from "@/contexts/wallet-context"
import { validatePasswordStrength } from "@/lib/security"

export default function ImportWalletPage() {
  const [step, setStep] = useState(1)
  const [phrase, setPhrase] = useState(Array(12).fill(""))
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { importWallet } = useWallet()

  // Password validation
  const passwordValidation = validatePasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrase = [...phrase]
    newPhrase[index] = value.trim()
    setPhrase(newPhrase)
  }

  const handleVerifyPhrase = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check if all fields are filled
    if (!phrase.every((word) => word !== "")) {
      setError("Please fill in all 12 words of your recovery phrase.")
      return
    }

    console.log("🔍 Recovery phrase verified, proceeding to password creation...")
    setStep(2)
  }

  const handleImportWallet = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passwordValidation.isValid) {
      setError("Please fix password requirements")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsImporting(true)
      console.log("🔄 Importing wallet with recovery phrase and password...")

      // Join the phrase and use wallet context to import with password
      const mnemonicPhrase = phrase.join(" ")
      await importWallet(mnemonicPhrase, password)

      console.log("✅ Wallet imported successfully")
      setStep(3)
    } catch (error) {
      console.error("❌ Failed to import wallet:", error)
      setError("Invalid recovery phrase. Please check your words and try again.")
    } finally {
      setIsImporting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1: // Enter Phrase
        return (
          <form onSubmit={handleVerifyPhrase}>
            <CardHeader className="space-y-6 text-center">
              <div className="relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 backdrop-blur-sm">
                  <Download className="h-10 w-10 text-cyan-400" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                    Import Your Wallet
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Enter your 12-word Secret Recovery Phrase to restore your wallet
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>This is a sensitive operation</AlertTitle>
                <AlertDescription>Ensure you are in a private and secure environment.</AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <Key className="h-4 w-4 text-cyan-400" />
                  Recovery Phrase (12 words)
                </Label>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="grid grid-cols-3 gap-3">
                    {phrase.map((word, index) => (
                      <div key={index} className="relative">
                        <span className="absolute -left-6 top-3 text-xs font-mono text-gray-400">{index + 1}.</span>
                        <Input
                          type="text"
                          value={word}
                          className="border-white/20 bg-white/10 text-center font-mono text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
                          onChange={(e) => handlePhraseChange(index, e.target.value)}
                          placeholder="word"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-cyan-400 hover:to-emerald-400 hover:shadow-xl hover:shadow-cyan-500/30"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Verify Recovery Phrase
              </Button>
            </CardFooter>
          </form>
        )

      case 2: // Create Password
        return (
          <form onSubmit={handleImportWallet}>
            <CardHeader className="space-y-6 text-center">
              <div className="relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm">
                  <Lock className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                    Create a New Password
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  This password will unlock your imported wallet on this device
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="new-password" className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <Lock className="h-4 w-4 text-emerald-400" />
                  New Password (8 characters min)
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-white/20 bg-white/10 pr-12 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-emerald-400/50 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/20"
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirm-password" className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <Lock className="h-4 w-4 text-cyan-400" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 border-white/20 bg-white/10 pr-12 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition-colors hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && passwordValidation.errors.length > 0 && (
                <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 backdrop-blur-sm">
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-300">
                      <AlertTriangle className="h-3 w-3" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm backdrop-blur-sm ${
                    passwordsMatch && passwordValidation.isValid
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-red-500/20 bg-red-500/10 text-red-300"
                  }`}
                >
                  {passwordsMatch && passwordValidation.isValid ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  {passwordsMatch && passwordValidation.isValid
                    ? "Passwords match and meet requirements!"
                    : !passwordsMatch
                      ? "Passwords do not match"
                      : "Password does not meet requirements"}
                </div>
              )}

              {error && (
                <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 border-white/20 text-gray-300 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={!passwordValidation.isValid || !passwordsMatch || isImporting}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-400 hover:to-cyan-400 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <Download className="mr-2 h-4 w-4 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Import Wallet
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )

      case 3: // Success
        return (
          <>
            <CardHeader className="space-y-6 text-center">
              <div className="relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm">
                  <CheckCircle className="h-12 w-12 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Wallet Imported Successfully!
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  You can now access your wallet on this device with your new password
                </CardDescription>
              </div>

              {/* Success Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 backdrop-blur-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-emerald-300">Wallet successfully restored</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 backdrop-blur-sm">
                  <Lock className="h-5 w-5 text-cyan-400" />
                  <span className="text-sm text-cyan-300">Password protection enabled</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-teal-500/20 bg-teal-500/10 p-3 backdrop-blur-sm">
                  <Key className="h-5 w-5 text-teal-400" />
                  <span className="text-sm text-teal-300">Ready to manage your assets</span>
                </div>
              </div>
            </CardHeader>

            <CardFooter>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-400 hover:to-teal-400 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Go to My Wallet
              </Button>
            </CardFooter>
          </>
        )
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-cyan-500/30 via-emerald-500/20 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-transparent blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[24rem] w-[24rem] rounded-full bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shadow-lg ${
                step >= 1 ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white" : "bg-gray-700 text-gray-400"
              }`}
            >
              {step > 1 ? "✓" : "1"}
            </div>
            <div
              className={`h-0.5 w-12 ${step >= 2 ? "bg-gradient-to-r from-cyan-500 to-emerald-500" : "bg-gray-600"}`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shadow-lg ${
                step >= 2 ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white" : "bg-gray-700 text-gray-400"
              }`}
            >
              {step > 2 ? "✓" : "2"}
            </div>
            <div
              className={`h-0.5 w-12 ${step >= 3 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gray-600"}`}
            />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shadow-lg ${
                step >= 3 ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-gray-700 text-gray-400"
              }`}
            >
              3
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">{renderStep()}</Card>
        </div>
      </div>
    </div>
  )
}
