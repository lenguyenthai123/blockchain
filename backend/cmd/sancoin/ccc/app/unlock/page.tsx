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
import { Eye, EyeOff } from "lucide-react"

export default function UnlockPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would use this password to decrypt the locally stored
    // encrypted seed phrase from browser storage (e.g., localStorage).
    // If decryption is successful, you proceed.
    // For this simulation, we'll just check if the password is not empty.
    if (password) {
      console.log("Wallet unlocked!")
      router.push("/dashboard")
    } else {
      alert("Please enter your password.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <form onSubmit={handleUnlock}>
          <CardHeader className="text-center">
            <Image src="/logo.png" alt="SanWallet Logo" width={64} height={64} className="mx-auto mb-4 rounded-full" />
            <CardTitle className="text-2xl">Unlock Your Wallet</CardTitle>
            <CardDescription>Enter your password to access your SanWallet.</CardDescription>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">
              Unlock
            </Button>
            <Link href="/import-wallet" className="text-sm text-cyan-400 hover:underline">
              Forgot password? Import using Secret Recovery Phrase.
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
