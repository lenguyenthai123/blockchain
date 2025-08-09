import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Wallet, PlusCircle, Search, Download } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center p-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?width=1920&height=1080"
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-30"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      </div>
      <div className="relative z-10">
        <Image src="/logo.png" alt="SanWallet Logo" width={80} height={80} className="mb-4 mx-auto rounded-full" />
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Welcome to SanWallet</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          The most secure and professional wallet for the SanCoin ecosystem. Manage, send, and receive SNC with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/create-wallet">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold shadow-lg shadow-cyan-500/20"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create a New Wallet
            </Button>
          </Link>
          <Link href="/unlock">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-cyan-500 text-cyan-400 hover:bg-cyan-900/50 hover:text-cyan-300 bg-transparent"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Access My Wallet
            </Button>
          </Link>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href="/import-wallet"
            className="text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Import an existing wallet</span>
          </Link>
          <Link
            href="/explorer"
            className="text-sm text-gray-400 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span>Or explore the SanCoin blockchain with SanScan</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
