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
import { Eye, EyeOff, AlertTriangle, Trash2, Clock, Unlock, Shield, Key, Sparkles } from "lucide-react"
import { SecureWalletStorage } from "@/lib/wallet-storage"
import { useWallet } from "@/contexts/wallet-context"

export default function UnlockPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const router = useRouter()
  const { unlockWallet } = useWallet()

  // Kiểm tra xem có wallet không
  const walletInfo = SecureWalletStorage.getWalletInfo()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password) {
      setError("Please enter your password")
      return
    }

    try {
      setIsUnlocking(true)
      console.log("🔓 Attempting to unlock wallet...")

      // Thử unlock wallet với password
      const success = await unlockWallet(password)

      if (!success) {
        setAttemptCount((prev) => prev + 1)
        setError(`Invalid password. Please try again. (Attempt ${attemptCount + 1})`)

        // Clear password field after failed attempt
        setPassword("")

        // Show forgot password option after 3 failed attempts
        if (attemptCount >= 2) {
          setShowForgotPassword(true)
        }
        return
      }

      console.log("✅ Wallet unlocked successfully")
      router.push("/dashboard")
    } catch (error) {
      console.error("❌ Failed to unlock wallet:", error)
      setError("Failed to unlock wallet. Please try again.")
      setAttemptCount((prev) => prev + 1)
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleForgotPassword = () => {
    if (
      confirm(
        "⚠️ WARNING: This will permanently delete your current wallet!\n\n" +
          "You will need your 12-word recovery phrase to restore access to your funds.\n\n" +
          "Make sure you have your recovery phrase before proceeding.\n\n" +
          "Are you sure you want to continue?",
      )
    ) {
      SecureWalletStorage.deleteWallet()
      alert("✅ Wallet deleted successfully. You can now import your wallet using your recovery phrase.")
      router.push("/import-wallet")
    }
  }

  if (!walletInfo.hasWallet) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Animated Background Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-gray-500/20 via-slate-500/10 to-transparent blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-slate-500/10 via-gray-500/10 to-transparent blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400 to-slate-400 opacity-20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-gray-500/20 to-slate-500/20 backdrop-blur-sm">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="SanWallet Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-gray-300 via-slate-300 to-gray-200 bg-clip-text text-transparent">
                    No Wallet Found
                  </span>
                </h2>
                <p className="text-gray-400">Create a new wallet or import an existing one to get started.</p>
              </div>

              <div className="flex w-full gap-3">
                <Link href="/create-wallet" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-cyan-400 hover:to-emerald-400 hover:shadow-xl hover:shadow-cyan-500/30">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Wallet
                  </Button>
                </Link>
                <Link href="/import-wallet" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-gray-300 transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 bg-transparent"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Import Wallet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
        {Array.from({ length: 30 }).map((_, i) => (
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
        <Card className="w-full max-w-md border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleUnlock}>
            <CardHeader className="space-y-6 text-center">
              <div className="relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 backdrop-blur-sm">
                  <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="SanWallet Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                    Unlock Your Wallet
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Enter your password to access your secure SanWallet
                </CardDescription>
              </div>

              {/* Wallet Info Card */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">Wallet Information</span>
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="text-white">{new Date(walletInfo.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last access:</span>
                    <span className="text-white">{new Date(walletInfo.lastAccess).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-white/20 bg-white/10 pr-12 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
                    placeholder="Enter your wallet password"
                    autoFocus
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

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-500/20 bg-red-500/10 text-red-300 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Forgot Password Warning */}
              {showForgotPassword && (
                <Alert className="border-yellow-500/20 bg-yellow-500/10 text-yellow-300 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Multiple failed attempts detected!</strong>
                    <br />
                    If you forgot your password, you can delete this wallet and restore it using your 12-word recovery
                    phrase.
                    <br />
                    <strong className="text-red-400">⚠️ Make sure you have your recovery phrase!</strong>
                  </AlertDescription>
                </Alert>
              )}

              {/* Attempt Counter */}
              {attemptCount > 0 && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                  <span className="text-sm text-red-400">Failed attempts: {attemptCount}</span>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isUnlocking || !password}
                className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-cyan-400 hover:to-emerald-400 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isUnlocking ? (
                  <>
                    <Shield className="mr-2 h-4 w-4 animate-pulse" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock Wallet
                  </>
                )}
              </Button>

              <div className="flex w-full flex-col gap-3">
                {/* Forgot Password Button */}
                {!showForgotPassword && attemptCount < 3 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-gray-400 transition-colors hover:text-cyan-400"
                  >
                    Forgot password?
                  </Button>
                )}

                {/* Delete Wallet Button */}
                {showForgotPassword && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleForgotPassword}
                    className="border-red-500/50 text-sm text-red-400 transition-all duration-300 hover:bg-red-500/10 bg-transparent"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Wallet & Restore from Recovery Phrase
                  </Button>
                )}

                {/* Import Different Wallet */}
                <Link href="/import-wallet" className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-gray-400 transition-colors hover:text-cyan-400"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Import a different wallet
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
