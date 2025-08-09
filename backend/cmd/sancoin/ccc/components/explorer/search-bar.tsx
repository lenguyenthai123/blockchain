"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function ExplorerSearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const query = searchQuery.trim()

    // Determine search type based on input format
    if (query.match(/^0x[a-fA-F0-9]{64}$/)) {
      // Transaction hash (64 hex characters)
      router.push(`/explorer/tx/${query}`)
    } else if (query.match(/^[0-9]+$/)) {
      // Block number
      router.push(`/explorer/block/${query}`)
    } else if (query.match(/^(0x[a-fA-F0-9]{40}|san1[a-zA-Z0-9]+)$/)) {
      // Address (Ethereum format or SanCoin format)
      router.push(`/explorer/address/${query}`)
    } else {
      alert("Invalid search format. Please enter a valid address, transaction hash, or block number.")
    }
  }

  return (
    <div className="relative text-center bg-gray-950/50 p-8 rounded-lg border border-gray-800">
      <h1 className="text-2xl font-bold text-white mb-2">The SanCoin Blockchain Explorer</h1>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search by Address / Txn Hash / Block"
              className="w-full h-14 pl-5 pr-16 rounded-lg bg-gray-800 border-gray-700 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-10 w-10 bg-cyan-500 hover:bg-cyan-600"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
