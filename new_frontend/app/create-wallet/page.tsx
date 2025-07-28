"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Copy, Eye, ShieldAlert, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/wallet-context"

const MOCK_PHRASE = "apple banana cherry date elderberry fig grape honey kiwi lemon mango nectarine"

export default function CreateWalletPage() {
  const [step, setStep] = useState(1)
  const [phraseVisible, setPhraseVisible] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()
  const { createWallet } = useWallet()

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_PHRASE)
    alert("Secret Recovery Phrase copied to clipboard!")
  }

  const handleCreateWallet = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!")
      return
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters!")
      return
    }

    try {
      await createWallet()
      setStep(4)
    } catch (error) {
      console.error("Failed to create wallet:", error)
      alert("Failed to create wallet. Please try again.")
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
                Before we start, watch this short video about your Secret Recovery Phrase and how to keep your wallet
                safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">[Wallet Security Tutorial Video]</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900" onClick={() => setStep(2)}>
                Secure My Wallet
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
                Write down this 12-word phrase on a piece of paper and store it in a safe place.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-red-900/30 border-red-700/50 text-red-300">
                <ShieldAlert className="h-4 w-4 !text-red-300" />
                <AlertTitle>NEVER share this phrase with anyone.</AlertTitle>
                <AlertDescription>Anyone with this phrase can take your SanCoin forever.</AlertDescription>
              </Alert>
              <div className="relative border-2 border-dashed border-gray-700 rounded-lg p-4">
                <div className={`grid grid-cols-3 gap-x-4 gap-y-2 font-mono text-lg ${!phraseVisible && "blur-md"}`}>
                  {MOCK_PHRASE.split(" ").map((word, index) => (
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
              <Button variant="outline" className="w-full bg-transparent" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" /> Copy to clipboard
              </Button>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900" onClick={() => setStep(3)}>
                Next
              </Button>
            </CardFooter>
          </>
        )
      case 3: // Create Password
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Create a Password</CardTitle>
              <CardDescription>
                This password will unlock your SanWallet only on this device. You will need your Secret Recovery Phrase
                to restore your wallet on a new device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password (8 characters min)</Label>
                <Input
                  id="new-password"
                  type="password"
                  className="bg-gray-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900" onClick={handleCreateWallet}>
                Create Wallet
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
                You've successfully protected your wallet. Remember to keep your Secret Recovery Phrase in a safe place.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center">
              <p className="text-gray-400">
                You passed the test. Keep your Secret Recovery Phrase safe, it's your responsibility!
              </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900"
                onClick={() => router.push("/dashboard")}
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
      <Card className="w-full max-w-xl bg-gray-900/50 border-gray-800 backdrop-blur-sm">{renderStep()}</Card>
    </div>
  )
}
