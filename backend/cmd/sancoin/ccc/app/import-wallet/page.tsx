"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ImportWalletPage() {
  const [step, setStep] = useState(1)
  const [phrase, setPhrase] = useState(Array(12).fill(""))
  const router = useRouter()

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrase = [...phrase]
    newPhrase[index] = value.trim()
    setPhrase(newPhrase)
  }

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate the phrase here.
    // For this simulation, we'll just check if all fields are filled.
    if (phrase.every((word) => word !== "")) {
      console.log("Phrase validated, proceeding to password creation.")
      setStep(2)
    } else {
      alert("Please fill in all 12 words of your recovery phrase.")
    }
  }

  const handleCreatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    // Password validation logic would go here.
    console.log("Password created, wallet imported successfully.")
    setStep(3)
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
              <div className="grid grid-cols-3 gap-4">
                {phrase.map((_, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-5 top-2.5 text-xs text-gray-500">{index + 1}.</span>
                    <Input
                      type="text"
                      className="bg-gray-800"
                      onChange={(e) => handlePhraseChange(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                Confirm Secret Recovery Phrase
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
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password (8 characters min)</Label>
                <Input id="new-password" type="password" className="bg-gray-800" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" className="bg-gray-800" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900">
                Import Wallet
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
              <CardDescription>You can now access your wallet on this device.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900"
              >
                Go to My Wallet
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
