import { Bell, CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-gray-800 bg-gray-950 px-6">
      <Badge variant="outline" className="border-green-400 text-green-400">
        <span className="relative flex h-2 w-2 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        SanCoin Mainnet
      </Badge>
      <Button variant="ghost" size="icon">
        <Bell className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon">
        <CircleHelp className="h-5 w-5" />
      </Button>
    </header>
  )
}
