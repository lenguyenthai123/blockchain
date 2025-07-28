"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  onSearch,
  placeholder = "Search by Address / Txn Hash / Block",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    try {
      setIsLoading(true)

      if (onSearch) {
        onSearch(query)
      } else {
        // Default search behavior
        if (query.match(/^[0-9]+$/)) {
          // Block number
          window.location.href = `/explorer/block/${query}`
        } else if (query.startsWith("san1")) {
          // Address
          window.location.href = `/explorer/address/${query}`
        } else if (query.match(/^[a-fA-F0-9]{64}$/)) {
          // Transaction hash
          window.location.href = `/explorer/tx/${query}`
        } else {
          alert("Invalid search query. Please enter a block number, address, or transaction hash.")
        }
      }
    } catch (error) {
      console.error("Search failed:", error)
      alert("Search failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
      </div>
      <Button
        onClick={handleSearch}
        disabled={isLoading || !query.trim()}
        className="bg-cyan-500 hover:bg-cyan-600 text-gray-900"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
