import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ExternalLink, Hash, Timer, Box, Zap } from "lucide-react"
import { notFound } from "next/navigation"
import { explorerApi } from "@/lib/explorer-api"
import { CopyButton } from "@/components/copy-button"
import { FancyBackground } from "@/components/decor/fancy-background"
import { MetricCard } from "@/components/ui/metric-card"

function formatDateTime(ts: number) {
  if (!ts) return "—"
  const d = new Date(ts)
  return `${d.toLocaleString()}`
}
function formatRelative(ts: number) {
  if (!ts) return "—"
  const diff = Date.now() - ts
  const sec = Math.max(0, Math.floor(diff / 1000))
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}

export default async function BlockDetailsPage({
  params,
}: {
  params: { number: string }
}) {
  const blockIndex = Number.parseInt(params.number, 10)
  if (Number.isNaN(blockIndex)) {
    notFound()
  }

  let block: Awaited<ReturnType<typeof explorerApi.getBlockByIndex>>
  try {
    block = await explorerApi.getBlockByIndex(blockIndex)
  } catch {
    notFound()
  }

  const txCount = block.transactions.length
  const coinbaseCount = block.transactions.filter((t) => t.type === "coinbase").length
  const transferCount = txCount - coinbaseCount

  return (
    <FancyBackground>
      <div className="space-y-6">
        {/* Hero */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur">
              <Hash className="h-3 w-3 text-cyan-400" />
              Block
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
                #{block.index.toLocaleString()}
              </span>
            </h1>
          </div>
          <Badge variant="outline" className="bg-emerald-900/40 text-emerald-300 border-emerald-800/60">
            Difficulty {block.difficulty}
          </Badge>
          <div className="ml-auto flex items-center gap-2">
            <Link href={`/explorer/block/${block.index - 1}`} prefetch={false}>
              <Button variant="outline" size="icon" className="border-white/15 bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/explorer/block/${block.index + 1}`} prefetch={false}>
              <Button variant="outline" size="icon" className="border-white/15 bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Transactions" value={txCount} icon={<Box className="h-4 w-4" />} color="cyan" />
          <MetricCard label="Coinbase" value={coinbaseCount} icon={<Zap className="h-4 w-4" />} color="emerald" />
          <MetricCard
            label="Transfers"
            value={transferCount}
            icon={<ExternalLink className="h-4 w-4" />}
            color="violet"
          />
          <MetricCard
            label="Age"
            value={formatRelative(block.timestamp)}
            icon={<Timer className="h-4 w-4" />}
            color="amber"
            hint={formatDateTime(block.timestamp)}
          />
        </div>

        {/* Block details */}
        <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Block Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-sm text-gray-400 min-w-28">Block Hash:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-sm break-all">{block.hash}</span>
                    <CopyButton value={block.hash} />
                  </div>
                </div>

                <div className="flex justify-between items-start gap-3">
                  <span className="text-sm text-gray-400 min-w-28">Parent Hash:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <Link
                      href={`/explorer/block/${block.index - 1}`}
                      className="font-mono text-sm text-cyan-300 hover:underline break-all"
                      prefetch={false}
                    >
                      {block.previousHash}
                    </Link>
                    <CopyButton value={block.previousHash} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Timestamp:</span>
                  <span className="text-sm">{formatDateTime(block.timestamp)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Age:</span>
                  <span className="text-sm">{formatRelative(block.timestamp)}</span>
                </div>

                <div className="flex justify-between items-start gap-3">
                  <span className="text-sm text-gray-400 min-w-28">Merkle Root:</span>
                  <span className="text-xs md:text-sm font-mono break-all">{block.merkleRoot}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Nonce:</span>
                  <span className="text-sm">{block.nonce}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Difficulty:</span>
                  <span className="text-sm">{block.difficulty}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions in this Block ({txCount})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {txCount === 0 ? (
              <div className="text-sm text-gray-400">No transactions found in this block.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="text-left font-medium py-2">Hash</th>
                    <th className="text-left font-medium py-2">Type</th>
                    <th className="text-left font-medium py-2">Timestamp</th>
                    <th className="text-left font-medium py-2">Age</th>
                    <th className="text-left font-medium py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {block.transactions
                    .slice()
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((tx) => (
                      <tr key={tx.hash} className="border-t border-white/10 hover:bg-white/5">
                        <td className="py-2">
                          <Link
                            href={`/explorer/tx/${tx.hash}`}
                            className="font-mono text-cyan-300 hover:underline"
                            prefetch={false}
                          >
                            {tx.hash}
                          </Link>
                        </td>
                        <td className="py-2">
                          <Badge
                            variant="outline"
                            className={
                              tx.type === "coinbase"
                                ? "bg-emerald-900/30 text-emerald-300 border-emerald-800/60"
                                : "bg-amber-900/30 text-amber-300 border-amber-800/60"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-2">{formatDateTime(tx.timestamp)}</td>
                        <td className="py-2 text-gray-400">{formatRelative(tx.timestamp)}</td>
                        <td className="py-2">
                          <Link
                            href={`/explorer/tx/${tx.hash}`}
                            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:underline"
                            prefetch={false}
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </FancyBackground>
  )
}
