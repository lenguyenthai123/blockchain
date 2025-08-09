import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Wallet } from "lucide-react"

export default function SendPage() {
  return (
    <div className="flex justify-center items-start pt-10">
      <Card className="w-full max-w-2xl bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Send SanCoin</CardTitle>
          <CardDescription>Transfer SNC to another wallet address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="Enter wallet address, e.g., san1q..."
              className="bg-gray-800 border-gray-700 h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input id="amount" type="number" placeholder="0.00" className="bg-gray-800 border-gray-700 h-12 pr-20" />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <span className="px-3 text-sm font-bold text-cyan-400">SNC</span>
              </div>
            </div>
            <div className="flex justify-end text-xs text-gray-400 items-center gap-2 pt-1">
              <Wallet className="h-3 w-3" />
              <span>Balance: 12.3456 SNC</span>
              <Button variant="link" className="h-auto p-0 text-cyan-400">
                Max
              </Button>
            </div>
          </div>
          <Alert className="bg-gray-800 border-cyan-800/50 text-cyan-300">
            <Info className="h-4 w-4 !text-cyan-300" />
            <AlertTitle>Estimated Network Fee</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>0.000021 SNC</span>
              <span className="text-xs text-gray-500">$0.011</span>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-6 text-base">
            Review & Send
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
