import Link from "next/link"
import { explorerApi } from "@/lib/explorer-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { ArrowRight, Layers, Hash, Boxes, Timer } from "lucide-react"
import { FancyBackground } from "@/components/decor/fancy-background"
import { MetricCard } from "@/components/ui/metric-card"

function formatTime(ts: number) {
  if (!ts) return "—"
  try {
    const d = new Date(ts)
    return `${d.toUTCString()}`
  } catch {
    return "—"
  }
}
function sumOutputs(outputs: Array<{ amount: number }> = []) {
  return outputs.reduce((s, o) => s + (Number(o.amount) || 0), 0)
}

export default async function TransactionDetailsPage({ params }: { params: { hash: string } }) {
  const { hash } = params
  const data = await explorerApi.getTransactionByHash(hash)
  const tx = data.transaction
  const block = data.block
  const status = data.status
  const outputs = Array.isArray(tx.outputs) ? tx.outputs : []
  const totalValue = sumOutputs(outputs)
  const isCoinbase = (tx.type || "").toLowerCase() === "coinbase"

  // derive sender label if available
  const senderLabel = isCoinbase ? "Coinbase" : tx.inputs?.[0]?.publicKey ? "Sender (derived)" : "unknown"

  return (
    <FancyBackground>
      <div className="space-y-6">
        {/* Hero */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300 backdrop-blur">
              <Hash className="h-3 w-3 text-cyan-400" />
              Transaction
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
                {hash.slice(0, 18)}...{hash.slice(-12)}
              </span>
            </h1>
          </div>
          <Badge
            variant="outline"
            className={
              status === "confirmed"
                ? "bg-emerald-900/50 text-emerald-300 border-emerald-800/60"
                : status === "pending"
                  ? "bg-amber-900/50 text-amber-300 border-amber-800/60"
                  : "bg-gray-800 text-gray-300 border-white/10"
            }
          >
            {status}
          </Badge>
          <Badge variant="secondary" className="capitalize bg-white/10 text-white border-white/10">
            {tx.type}
          </Badge>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Outputs"
            value={`${outputs.length}`}
            icon={<Boxes className="h-4 w-4" />}
            color="cyan"
          />
          <MetricCard
            label="Total Value"
            value={`${totalValue.toLocaleString()} SNC`}
            icon={<Layers className="h-4 w-4" />}
            color="emerald"
          />
          <MetricCard
            label="Block"
            value={block?.index ? `#${block.index}` : "—"}
            icon={<Hash className="h-4 w-4" />}
            color="violet"
          />
          <MetricCard
            label="Timestamp"
            value={formatTime(tx.timestamp)}
            icon={<Timer className="h-4 w-4" />}
            color="amber"
          />
        </div>

        {/* Core info */}
        <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Transaction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400 min-w-32">Transaction Hash:</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm break-all">{tx.hash}</span>
                  <CopyButton text={tx.hash} ariaLabel="Copy transaction hash" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Status:</span>
                <Badge
                  variant="outline"
                  className={
                    status === "confirmed"
                      ? "bg-emerald-900/50 text-emerald-300 border-emerald-800/60"
                      : status === "pending"
                        ? "bg-amber-900/50 text-amber-300 border-amber-800/60"
                        : "bg-gray-800 text-gray-300 border-white/10"
                  }
                >
                  {status}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Block:</span>
                {block?.index ? (
                  <Link href={`/explorer/block/${block.index}`} className="text-cyan-300 hover:underline">
                    #{block.index}
                  </Link>
                ) : (
                  <span className="text-sm">—</span>
                )}
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400 min-w-32">Block Hash:</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm break-all">{block?.hash || "—"}</span>
                  {block?.hash ? <CopyButton text={block.hash} ariaLabel="Copy block hash" /> : null}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Timestamp:</span>
                <span className="text-sm">{formatTime(tx.timestamp)}</span>
              </div>

              {/* From / To */}
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-400 min-w-32">From:</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm break-all">{senderLabel}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-2 bg-gray-800/60 rounded-full">
                  <ArrowRight className="h-4 w-4 text-cyan-300" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-400">To:</span>
                <div className="space-y-2">
                  {outputs.length === 0 ? (
                    <div className="text-sm">—</div>
                  ) : (
                    outputs.map((o, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/explorer/address/${o.address}`}
                            className="font-mono text-sm text-cyan-300 hover:underline break-all"
                          >
                            {o.address}
                          </Link>
                          <CopyButton text={o.address} ariaLabel="Copy recipient address" />
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(o.amount ?? 0).toLocaleString()} SNC</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Output Value:</span>
                <div className="text-right">
                  <p className="font-semibold">{totalValue.toLocaleString()} SNC</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Inputs:</span>
                <span className="text-sm">{tx.inputs?.length ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Outputs:</span>
                <span className="text-sm">{tx.outputs?.length ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs / Outputs breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tx.inputs?.length ? (
                tx.inputs.map((inp, idx) => (
                  <div key={idx} className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Prev Tx:</span>
                      <Link
                        href={`/explorer/tx/${inp.previousTxHash}`}
                        className="font-mono text-xs text-cyan-300 hover:underline break-all"
                      >
                        {inp.previousTxHash}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Output Index:</span>
                      <span className="text-xs">{inp.outputIndex}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No inputs (coinbase)</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Outputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {outputs.length ? (
                outputs.map((out, idx) => (
                  <div key={idx} className="space-y-1 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">Address:</span>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/explorer/address/${out.address}`}
                          className="font-mono text-xs text-cyan-300 hover:underline break-all"
                        >
                          {out.address}
                        </Link>
                        <CopyButton text={out.address} ariaLabel="Copy output address" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Amount:</span>
                      <span className="text-xs font-semibold">{(out.amount ?? 0).toLocaleString()} SNC</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400">No outputs</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </FancyBackground>
  )
}
