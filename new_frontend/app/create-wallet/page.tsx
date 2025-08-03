"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Copy, Check, AlertTriangle, Shield, Key, RefreshCw, Lock, Zap } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { validatePassword, generateSecurePassword } from "@/lib/security"

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
  const passwordValidation = validatePassword(password)
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <form onSubmit={handleCreatePassword}>
            <CardHeader className="text-center">
              <Image
                src="/logo.png"
                alt="SanWallet Logo"
                width={64}
                height={64}
                className="mx-auto mb-4 rounded-full"
              />
              <CardTitle className="text-2xl">Secure Your Wallet</CardTitle>
              <CardDescription>Create a strong password to protect your wallet</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 h-12 pr-10"
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 h-12 pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
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
                className="w-full border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 bg-transparent"
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Secure Password
              </Button>

              {/* Password Strength */}
              {password && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Password Strength</span>
                    <span
                      className={`${passwordValidation.score >= 4 ? "text-green-400" : passwordValidation.score >= 2 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {passwordValidation.score >= 4 ? "Strong" : passwordValidation.score >= 2 ? "Medium" : "Weak"}
                    </span>
                  </div>
                  <Progress value={(passwordValidation.score / 5) * 100} className="h-2" />
                </div>
              )}

              {/* Password Requirements */}
              {password && passwordValidation.errors.length > 0 && (
                <div className="space-y-1">
                  {passwordValidation.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {/* Password Match Check */}
              {confirmPassword && (
                <div
                  className={`text-sm flex items-center gap-2 ${passwordsMatch ? "text-green-400" : "text-red-400"}`}
                >
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </div>
              )}

              {error && (
                <Alert className="bg-red-900/30 border-red-700/50 text-red-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={!passwordValidation.isValid || !passwordsMatch}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 disabled:opacity-50"
              >
                <Lock className="h-4 w-4 mr-2" />
                Continue
              </Button>

              <Link href="/" className="text-center">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Back to Home
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  // Step 2: Confirm Security
  if (step === 2) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
            <CardTitle className="text-2xl">Secure Your Wallet</CardTitle>
            <CardDescription>Your wallet will be protected with military-grade encryption</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <Key className="h-5 w-5 text-cyan-400" />
                <div>
                  <div className="text-sm font-medium text-white">Password Protection</div>
                  <div className="text-xs text-gray-400">Your wallet is encrypted with your password</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <Shield className="h-5 w-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">Secure Storage</div>
                  <div className="text-xs text-gray-400">Data is encrypted before saving to device</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                <RefreshCw className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-white">Recovery Phrase</div>
                  <div className="text-xs text-gray-400">12-word phrase for wallet recovery</div>
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-900/30 border-yellow-700/50 text-yellow-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> You will receive a 12-word recovery phrase. Write it down and store it
                safely. This is the only way to recover your wallet if you forget your password.
              </AlertDescription>
            </Alert>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800"
              />
              <label htmlFor="terms" className="text-sm text-gray-300">
                I understand that I am responsible for keeping my recovery phrase safe
              </label>
            </div>

            {error && (
              <Alert className="bg-red-900/30 border-red-700/50 text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={handleSecureWallet}
              disabled={!agreedToTerms || isCreating}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-gray-900"
            >
              {isCreating ? "Creating..." : "Secure My Wallet"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Step 3: Show Recovery Phrase
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="text-center">
          <Key className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <CardTitle className="text-2xl">Your Recovery Phrase</CardTitle>
          <CardDescription>Write down these 12 words in the exact order shown</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="bg-red-900/30 border-red-700/50 text-red-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ CRITICAL:</strong> This is your only way to recover your wallet. Store it safely and never share
              it with anyone.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-3 gap-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            {generatedMnemonic.split(" ").map((word, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded text-center">
                <span className="text-xs text-gray-400 w-4">{index + 1}</span>
                <span className="text-sm font-mono text-white flex-1">{word}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={copyMnemonic}
            variant="outline"
            className="w-full border-cyan-600 text-cyan-400 hover:bg-cyan-900/30 bg-transparent"
          >
            {copiedMnemonic ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Recovery Phrase
              </>
            )}
          </Button>

          <Alert className="bg-green-900/30 border-green-700/50 text-green-300">
            <Check className="h-4 w-4" />
            <AlertDescription>
              ✅ Your wallet has been created successfully and is secured with your password.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button onClick={handleFinish} className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">
            Continue to Wallet
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
