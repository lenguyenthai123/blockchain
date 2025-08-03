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
import { Eye, EyeOff, AlertTriangle, Trash2, Clock } from "lucide-react"
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Image src="/logo.png" alt="SanWallet Logo" width={64} height={64} className="mx-auto mb-4 rounded-full" />
            <h2 className="text-xl font-semibold text-white mb-2">No Wallet Found</h2>
            <p className="text-gray-400 mb-6">Create a new wallet or import an existing one to get started.</p>
            <div className="flex gap-3 w-full">
              <Link href="/create-wallet" className="flex-1">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">Create Wallet</Button>
              </Link>
              <Link href="/import-wallet" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                >
                  Import Wallet
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <form onSubmit={handleUnlock}>
          <CardHeader className="text-center">
            <Image src="/logo.png" alt="SanWallet Logo" width={64} height={64} className="mx-auto mb-4 rounded-full" />
            <CardTitle className="text-2xl">Unlock Your Wallet</CardTitle>
            <CardDescription>Enter your password to access your secure SanWallet.</CardDescription>

            {/* Wallet Info */}
            <div className="text-xs text-gray-500 mt-3 p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-3 w-3" />
                <span>Wallet Information</span>
              </div>
              <div>Created: {new Date(walletInfo.createdAt).toLocaleDateString()}</div>
              <div>Last access: {new Date(walletInfo.lastAccess).toLocaleDateString()}</div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 h-12 pr-10"
                  placeholder="Enter your wallet password"
                  autoFocus
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

            {/* Error Alert */}
            {error && (
              <Alert className="bg-red-900/30 border-red-700/50 text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Forgot Password Warning */}
            {showForgotPassword && (
              <Alert className="bg-yellow-900/30 border-yellow-700/50 text-yellow-300">
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
              <div className="text-center text-sm text-gray-400">Failed attempts: {attemptCount}</div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isUnlocking || !password}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 disabled:opacity-50"
            >
              {isUnlocking ? "Unlocking..." : "Unlock Wallet"}
            </Button>

            <div className="flex flex-col gap-2 w-full">
              {/* Forgot Password Button */}
              {!showForgotPassword && attemptCount < 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-400 hover:text-cyan-400"
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
                  className="text-sm border-red-600 text-red-400 hover:bg-red-900/30 bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Wallet & Restore from Recovery Phrase
                </Button>
              )}

              {/* Import Different Wallet */}
              <Link href="/import-wallet" className="text-center">
                <Button variant="ghost" size="sm" className="text-sm text-gray-400 hover:text-cyan-400">
                  Import a different wallet
                </Button>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
