"use client"

import { useState, useEffect } from "react"
import {
  Search,
  RefreshCw,
  Blocks,
  Activity,
  Cpu,
  Gauge,
  Database,
  TrendingUp,
  Clock,
  Hash,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import LatestBlocks from "@/components/explorer/latest-blocks"
import LatestTransactions from "@/components/explorer/latest-transactions"
import { ExplorerStatCard } from "@/components/explorer/stat-card"
import { explorerApi, type BackendStats } from "@/lib/explorer-api"

type SearchMode = "auto" | "address" | "transaction" | "block"

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mode, setMode] = useState<SearchMode>("auto")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [stats, setStats] = useState<BackendStats | null>(null)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const s = await explorerApi.getStats()
      setStats(s)
    } catch (err: any) {
      console.error("Failed to load stats:", err)
      setError(err?.message || "Failed to load network stats.")
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Patterns
  const isAddress = (v: string) => /^SNC[0-9a-z]+$/i.test(v)

  // Block hash: 64 hex with exactly 6 leading zeros. Optional 0x.
  const isBlockHash = (v: string) => /^(?:0x|0X)?0{6}[1-9A-Fa-f][0-9A-Fa-f]{57}$/.test(v)

  // Tx hash: generic 64-hex, but NOT a block hash
  const isTxHash = (v: string) => /^(0x)?[a-fA-F0-9]{64}$/.test(v) && !isBlockHash(v)

  const isBlockNumber = (v: string) => /^[0-9]+$/.test(v)

  const cleanHex = (v: string) => (v.startsWith("0x") ? v.slice(2) : v)

  const goToAddress = (addr: string) => (window.location.href = `/explorer/address/${addr}`)
  const goToTx = (hash: string) => (window.location.href = `/explorer/tx/${cleanHex(hash)}`)
  const goToBlockNumber = (num: string | number) => (window.location.href = `/explorer/block/${num}`)

  // Preflight checks (best-effort; align these if your API paths differ)
  const checkAddressExists = async (addr: string) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/blockchain/balance/${addr}`)
      return r.ok
    } catch {
      return false
    }
  }

  const checkTxExists = async (hash: string) => {
    const h = cleanHex(hash)
    const candidates = [
      `/api/blockchain/transaction/${h}`,
      `/api/blockchain/transactions/${h}`,
      `/api/blockchain/tx/${h}`,
    ]
    for (const url of candidates) {
      try {
        const r = await fetch(`${API_BASE_URL}${url}`)
        if (r.ok) return true
      } catch {}
    }
    return false
  }

  const resolveBlockNumberFromHash = async (hash: string): Promise<number | null> => {
    const h = cleanHex(hash)
    const candidates = [
      `/api/blockchain/block/hash/${h}`,
    ]
    for (const url of candidates) {
      try {
        const r = await fetch(`${API_BASE_URL}${url}`)
        if (!r.ok) continue
        const data = await r.json().catch(() => null)
        const numberLike = data.data.index
        if (typeof numberLike === "number") return numberLike
      } catch {}
    }
    return null
  }

  const checkBlockNumberExists = async (num: string) => {
    const candidates = [
      `/api/blockchain/block/${num}`,
      `/api/blockchain/blocks/${num}`,
      `/api/blockchain/blockByNumber/${num}`,
    ]
    for (const url of candidates) {
      try {
        const r = await fetch(`${API_BASE_URL}${url}`)
        if (r.ok) return true
      } catch {}
    }
    return false
  }

  const handleSearch = async () => {
    const q = searchQuery.trim()
    if (!q) return

    setValidationError(null)
    setIsLoading(true)

    try {
      // Explicit modes validate only their kind
      if (mode === "address") {
        if (!isAddress(q)) return setValidationError("Invalid address. Expected format like san1abc…")
        const exists = await checkAddressExists(q)
        if (!exists) return setValidationError("Address not found.")
        return goToAddress(q)
      }

      if (mode === "transaction") {
        if (!isTxHash(q)) return setValidationError("Invalid transaction hash. Expected 64 hex chars (0x… optional).")
        const exists = await checkTxExists(q)
        if (!exists) return setValidationError("Transaction not found.")
        return goToTx(q)
      }

      if (mode === "block") {
        // Accept number or block-hash with 6 leading zeros
        if (isBlockNumber(q)) {
          const ok = await checkBlockNumberExists(q)
          if (!ok) return setValidationError("Block not found.")
          return goToBlockNumber(q)
        }
        if (isBlockHash(q)) {
          const num = await resolveBlockNumberFromHash(q)
          if (num == null) return setValidationError("Block not found by hash.")
          return goToBlockNumber(num)
        }
        return setValidationError("Invalid block. Enter a number or a hash starting with 000000…")
      }

      // AUTO MODE: infer type purely from format (no prefix necessary)
      // Priority: block-hash (6 zeros) → tx-hash → address → block-number
      if (isBlockHash(q)) {
        const num = await resolveBlockNumberFromHash(q)
        if (num == null) return setValidationError("Block not found by hash.")
        return goToBlockNumber(num)
      }
      if (isTxHash(q)) {
        const exists = await checkTxExists(q)
        if (!exists) return setValidationError("Transaction not found.")
        return goToTx(q)
      }
      if (isAddress(q)) {
        const exists = await checkAddressExists(q)
        if (!exists) return setValidationError("Address not found.")
        return goToAddress(q)
      }
      if (isBlockNumber(q)) {
        const ok = await checkBlockNumberExists(q)
        if (!ok) return setValidationError("Block not found.")
        return goToBlockNumber(q)
      }

      // Fallback
      setValidationError("Could not detect type. Try an address (san1…), a 64‑char hash, or a block number.")
    } finally {
      setIsLoading(false)
    }
  }

  // Formatters
  const formatNumber = (num: number | undefined): string => {
    if (typeof num !== "number" || isNaN(num)) return "0"
    return num.toLocaleString()
  }

  const networkHashRate = stats?.networkHashRate ?? "0 H/s"
  const difficulty = typeof stats?.difficulty === "number" ? stats?.difficulty : 0

  const dynamicPlaceholder =
    mode === "auto"
      ? "Search Address / Tx Hash / Block — auto-detected"
      : mode === "address"
        ? "Enter address (e.g., san1abc…)"
        : mode === "transaction"
          ? "Enter 64‑char transaction hash (0x… optional)"
          : "Enter block number or hash starting with 000000…"

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-cyan-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="mx-auto mb-6 max-w-7xl px-4 pt-10 text-center">
          <h1 className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-5xl">
            The SanCoin Blockchain Explorer
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
            Search addresses, transactions, and blocks. Auto mode intelligently detects the type.
          </p>

          {/* Search + Mode */}
          <div className="mx-auto mt-6 max-w-4xl">
            <Card className="border-white/10 bg-white/5 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={dynamicPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="h-12 rounded-xl border-white/10 bg-gray-900/50 pl-12 text-base md:h-14 md:text-lg text-white placeholder-gray-400"
                        aria-label="Search by selected type"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                    <ToggleGroup
                      type="single"
                      value={mode}
                      onValueChange={(v) => v && setMode(v as SearchMode)}
                      className="justify-center"
                      aria-label="Select search type"
                    >
                      <ToggleGroupItem
                        value="auto"
                        className="data-[state=on]:bg-cyan-500/20 data-[state=on]:text-cyan-200"
                        aria-label="Auto detect"
                      >
                        Auto
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="address"
                        className="gap-1 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-200"
                        aria-label="Address"
                      >
                        <Wallet className="h-4 w-4" />
                        Address
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="transaction"
                        className="gap-1 data-[state=on]:bg-fuchsia-500/20 data-[state=on]:text-fuchsia-200"
                        aria-label="Transaction"
                      >
                        <Hash className="h-4 w-4" />
                        Tx
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="block"
                        className="gap-1 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-200"
                        aria-label="Block"
                      >
                        <Blocks className="h-4 w-4" />
                        Block
                      </ToggleGroupItem>
                    </ToggleGroup>

                    <Button
                      onClick={handleSearch}
                      disabled={isLoading || !searchQuery.trim()}
                      className="h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 text-gray-900 hover:from-cyan-300 hover:to-emerald-300 md:h-14"
                      aria-label="Search"
                    >
                      <Search className="mr-1 h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Inline errors */}
                {validationError && (
                  <p className="mt-2 text-sm text-rose-300" role="alert">
                    {validationError}
                  </p>
                )}
                {error && (
                  <div className="mt-2 text-left text-sm text-red-300">
                    Failed to load network stats. {error}{" "}
                    <button
                      onClick={loadStats}
                      className="underline decoration-red-300/50 underline-offset-4 hover:text-red-200"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Network Statistics */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <ExplorerStatCard
              title="Total Blocks"
              value={formatNumber(stats?.totalBlocks)}
              icon={<Blocks className="h-6 w-6" />}
              change={undefined}
              trend="up"
            />
            <ExplorerStatCard
              title="Total Transactions"
              value={formatNumber(stats?.totalTransactions)}
              icon={<Activity className="h-6 w-6" />}
              change={undefined}
              trend="up"
            />
            <ExplorerStatCard
              title="Pending Transactions"
              value={formatNumber(stats?.pendingTransactions)}
              icon={<Gauge className="h-6 w-6" />}
              change={undefined}
              trend="up"
            />
            <ExplorerStatCard
              title="Total UTXOs"
              value={formatNumber(stats?.totalUTXOs)}
              icon={<Database className="h-6 w-6" />}
              change={undefined}
              trend="up"
            />
            <ExplorerStatCard
              title="Network Hash Rate"
              value={networkHashRate}
              icon={<TrendingUp className="h-6 w-6" />}
              change={undefined}
              trend="up"
            />
            <ExplorerStatCard
              title="Difficulty"
              value={String(difficulty)}
              icon={<Cpu className="h-6 w-6" />}
              change={undefined}
              trend="up"
            />
          </div>
        </div>

        {/* Latest Blocks and Transactions */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Latest Blocks</CardTitle>
                <CardDescription className="text-gray-400">Most recent blocks mined</CardDescription>
              </div>
              <Button
                onClick={loadStats}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
                aria-label="Refresh stats"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <LatestBlocks />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Latest Transactions</CardTitle>
                <CardDescription className="text-gray-400">Most recent network transactions</CardDescription>
              </div>
              <Button
                onClick={loadStats}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-white"
                aria-label="Refresh stats"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent>
              <LatestTransactions />
            </CardContent>
          </Card>
        </div>

        {/* Network Health */}
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Network Health</CardTitle>
              <CardDescription className="text-gray-400">
                Current network status and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-900/30">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">Network Status</h3>
                  <p className="text-green-400">Online</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-900/30">
                    <Hash className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="font-semibold text-white">Latest Block</h3>
                  <p className="text-blue-300">#{stats?.latestBlock?.index ?? 0}</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-900/30">
                    <Clock className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="font-semibold text-white">Average Block Time</h3>
                  <p className="text-purple-300">{stats?.averageBlockTime ?? "—"}</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/30">
                    <Activity className="h-8 w-8 text-emerald-300" />
                  </div>
                  <h3 className="font-semibold text-white">Circulating Supply</h3>
                  <p className="text-emerald-300">{formatNumber(stats?.circulatingSupply)} SNC</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="text-center">
                  <h3 className="font-semibold text-white">Total Supply</h3>
                  <p className="text-gray-300">{stats?.totalSupply ?? "—"}</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-white">Network Hash Rate</h3>
                  <p className="text-gray-300">{networkHashRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
