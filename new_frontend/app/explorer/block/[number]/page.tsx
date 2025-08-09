import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { notFound } from "next/navigation"
import { explorerApi } from "@/lib/explorer-api"
import { CopyButton } from "@/components/copy-button"

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
  } catch (e) {
    // If the backend doesn't have this block, show 404
    notFound()
  }

  const txCount = block.transactions.length
  const coinbaseCount = block.transactions.filter((t) => t.type === "coinbase").length
  const transferCount = txCount - coinbaseCount

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Block #{block.index.toLocaleString()}</h1>
          <Badge variant="outline" className="bg-emerald-900/40 text-emerald-300 border-emerald-800">
            Difficulty {block.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/explorer/block/${block.index - 1}`} prefetch={false}>
            <Button variant="outline" size="icon" aria-label="Previous block">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/explorer/block/${block.index + 1}`} prefetch={false}>
            <Button variant="outline" size="icon" aria-label="Next block">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Block Information */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Block Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
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
                    className="font-mono text-sm text-cyan-400 hover:underline break-all"
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

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Merkle Root:</span>
                <span className="text-xs md:text-sm font-mono break-all">{block.merkleRoot}</span>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transactions:</span>
                <span className="text-sm font-semibold">{txCount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Coinbase:</span>
                <span className="text-sm">{coinbaseCount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Transfers:</span>
                <span className="text-sm">{transferCount}</span>
              </div>

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
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transactions in this Block ({txCount})</CardTitle>
          <div className="text-xs text-gray-400">{"Includes coinbase and transfer transactions"}</div>
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
                    <tr key={tx.hash} className="border-t border-gray-800">
                      <td className="py-2">
                        <Link
                          href={`/explorer/tx/${tx.hash}`}
                          className="font-mono text-cyan-400 hover:underline"
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
                              ? "bg-emerald-900/30 text-emerald-300 border-emerald-800"
                              : "bg-amber-900/30 text-amber-300 border-amber-800"
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
                          className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
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
  )
}
