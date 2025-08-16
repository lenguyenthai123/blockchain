import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export default function ExplorerHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/explorer" className="flex items-center gap-2 mr-8">
          <Image src="/logo.png" alt="SanScan Logo" width={28} height={28} className="rounded-full" />
          <span className="font-bold text-lg">SanScan</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Blockchain
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Tokens
          </Link>
          <Link href="#" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Developers
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <Link href="/dashboard">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-gray-900">
              <Wallet className="mr-2 h-4 w-4" />
              Open Wallet
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
