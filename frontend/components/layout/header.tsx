"use client"

import { Bell, Search, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/contexts/wallet-context"

export default function Header() {
  const walletContext = useWallet()
  const { wallet = null, balance = 0, isOnline = true } = walletContext || {}

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      {/* Left side - Search */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search transactions, addresses..." className="pl-10 w-64 bg-gray-50 border-gray-200" />
        </div>
      </div>

      {/* Right side - User actions */}
      <div className="flex items-center space-x-4">
        {/* Network Status */}
        <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
          {isOnline ? "Online" : "Offline"}
        </Badge>

        {/* Balance Display */}
        {wallet && <div className="text-sm font-medium text-gray-700">{balance.toFixed(4)} SNC</div>}

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">3</Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">SanWallet User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : "No wallet"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
