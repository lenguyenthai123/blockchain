"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  Key,
  RefreshCw,
  Lock,
  Zap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { validatePasswordStrength, generateSecurePassword } from "@/lib/security"

export default function CreateWalletPage() {
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generatedMnemonic, setGeneratedMnemonic] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [copiedMnemonic, setCopiedMnemonic] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { createWallet } = useWallet()

  // Password validation
  const passwordValidation = validatePasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword !== ""

  const handleGeneratePassword = () => {
    const securePassword = generateSecurePassword()
    setPassword(securePassword)
    setConfirmPassword(securePassword)
  }

  const handleCreatePassword = (e: React.FormEvent) => {
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

    setStep(2)
  }

  const handleSecureWallet = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    try {
      setIsCreating(true)
      setError("")

      console.log("🔨 Creating wallet with secure password...")

      // Tạo wallet với password
      const result = await createWallet(password)

      setGeneratedMnemonic(result.mnemonic)
      setStep(3)

      console.log("✅ Wallet created successfully")
    } catch (error) {
      console.error("❌ Failed to create wallet:", error)
      setError("Failed to create wallet. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const copyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(generatedMnemonic)
      setCopiedMnemonic(true)
      setTimeout(() => setCopiedMnemonic(false), 2000)
    } catch (error) {
      console.error("Failed to copy mnemonic:", error)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  // Step 1: Set Password
  if (step === 1) {
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
          {Array.from({ length: 50 }).map((_, i) => (
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
          <div className="w-full max-w-md">
            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-sm font-semibold text-white shadow-lg">
                1
              </div>
              <div className="h-0.5 w-12 bg-gray-600" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold text-gray-400">
                2
              </div>
              <div className="h-0.5 w-12 bg-gray-600" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold text-gray-400">
                3
              </div>
            </div>

            <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleCreatePassword}>
                <CardHeader className="space-y-6 text-center">
                  <div className="relative mx-auto">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-20 blur-xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 backdrop-blur-sm">
                      <Lock className="h-10 w-10 text-cyan-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold">
                      <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                        Create Your Wallet
                      </span>
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-300">
                      Set a strong password to secure your digital assets
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Password Input */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Key className="h-4 w-4 text-cyan-400" />
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 border-white/20 bg-white/10 pr-12 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
                        placeholder="Enter a strong password"
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

                  {/* Confirm Password */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="confirmPassword"
                      className="flex items-center gap-2 text-sm font-medium text-gray-200"
                    >
                      <Shield className="h-4 w-4 text-emerald-400" />
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 border-white/20 bg-white/10 pr-12 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-emerald-400/50 focus:bg-white/15 focus:ring-2 focus:ring-emerald-400/20"
                        placeholder="Confirm your password"
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

                  {/* Generate Password Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="w-full border-cyan-400/40 bg-white/5 text-cyan-300 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/60 hover:bg-white/10 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/25"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Secure Password
                  </Button>

                  {/* Password Strength */}
                  {password && (
                    <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-300">
                          <Shield className="h-3 w-3" />
                          Password Strength
                        </span>
                        <span
                          className={`font-medium ${
                            passwordValidation.score >= 4
                              ? "text-emerald-400"
                              : passwordValidation.score >= 2
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {passwordValidation.score >= 4 ? "Strong" : passwordValidation.score >= 2 ? "Medium" : "Weak"}
                        </span>
                      </div>
                      <Progress value={(passwordValidation.score / 5) * 100} className="h-2 bg-white/10" />
                    </div>
                  )}

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

                  {/* Password Match Check */}
                  {confirmPassword && (
                    <div
                      className={`flex items-center gap-2 rounded-lg border p-3 text-sm backdrop-blur-sm ${
                        passwordsMatch
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/20 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {passwordsMatch ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      {passwordsMatch ? "Passwords match perfectly!" : "Passwords do not match"}
                    </div>
                  )}

                  {error && (
                    <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={!passwordValidation.isValid || !passwordsMatch}
                    className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-cyan-400 hover:to-emerald-400 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Continue to Security Setup
                  </Button>

                  <Link href="/" className="w-full text-center">
                    <Button variant="ghost" size="sm" className="text-gray-400 transition-colors hover:text-white">
                      ← Back to Home
                    </Button>
                  </Link>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Confirm Security
  if (step === 2) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Background Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-transparent blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-transparent blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-sm font-semibold text-white shadow-lg">
                ✓
              </div>
              <div className="h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-sm font-semibold text-white shadow-lg">
                2
              </div>
              <div className="h-0.5 w-12 bg-gray-600" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold text-gray-400">
                3
              </div>
            </div>

            <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
              <CardHeader className="space-y-6 text-center">
                <div className="relative mx-auto">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm">
                    <Shield className="h-10 w-10 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                      Security Overview
                    </span>
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-300">
                    Your wallet will be protected with military-grade encryption
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="group rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500/20 to-emerald-500/20">
                        <Key className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Password Protection</div>
                        <div className="text-sm text-gray-400">Your wallet is encrypted with your password</div>
                      </div>
                    </div>
                  </div>

                  <div className="group rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20">
                        <Shield className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Secure Storage</div>
                        <div className="text-sm text-gray-400">Data is encrypted before saving to device</div>
                      </div>
                    </div>
                  </div>

                  <div className="group rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500/20 to-cyan-500/20">
                        <RefreshCw className="h-6 w-6 text-teal-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">Recovery Phrase</div>
                        <div className="text-sm text-gray-400">12-word phrase for wallet recovery</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="border-yellow-500/20 bg-yellow-500/10 text-yellow-300 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> You will receive a 12-word recovery phrase. Write it down and store it
                    safely. This is the only way to recover your wallet if you forget your password.
                  </AlertDescription>
                </Alert>

                <div className="flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
                  />
                  <label htmlFor="terms" className="flex-1 text-sm text-gray-300">
                    I understand that I am responsible for keeping my recovery phrase safe and secure. I acknowledge
                    that losing my recovery phrase may result in permanent loss of access to my wallet.
                  </label>
                </div>

                {error && (
                  <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-white/20 text-gray-300 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleSecureWallet}
                  disabled={!agreedToTerms || isCreating}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-400 hover:to-cyan-400 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create My Wallet
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Show Recovery Phrase
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-500/20 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-500/20 to-transparent blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Success Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <Sparkles
            key={i}
            className="absolute animate-bounce text-emerald-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              fontSize: `${8 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-sm font-semibold text-white shadow-lg">
              ✓
            </div>
            <div className="h-0.5 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-sm font-semibold text-white shadow-lg">
              ✓
            </div>
            <div className="h-0.5 w-12 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white shadow-lg">
              3
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardHeader className="space-y-6 text-center">
              <div className="relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm">
                  <Key className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Your Recovery Phrase
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Write down these 12 words in the exact order shown
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>⚠️ CRITICAL:</strong> This is your only way to recover your wallet. Store it safely and never
                  share it with anyone.
                </AlertDescription>
              </Alert>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-3">
                  {generatedMnemonic.split(" ").map((word, index) => (
                    <div
                      key={index}
                      className="group relative rounded-lg border border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                    >
                      <span className="absolute left-2 top-1 text-xs font-mono text-gray-400">{index + 1}</span>
                      <span className="block pt-2 font-mono text-sm font-medium text-white">{word}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={copyMnemonic}
                variant="outline"
                className="w-full border-cyan-400/40 bg-white/5 text-cyan-300 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/60 hover:bg-white/10 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/25"
              >
                {copiedMnemonic ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-emerald-400" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Recovery Phrase
                  </>
                )}
              </Button>

              <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-300 backdrop-blur-sm">
                <Check className="h-4 w-4" />
                <AlertDescription>
                  ✅ Your wallet has been created successfully and is secured with your password.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleFinish}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-emerald-400 hover:to-teal-400 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Continue to Wallet
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
