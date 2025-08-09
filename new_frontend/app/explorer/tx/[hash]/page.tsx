import Link from "next/link"
import { explorerApi } from "@/lib/explorer-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { ArrowRight } from "lucide-react"
import {generateAddress} from "@/lib/crypto"

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

  // Fetch from backend
  const data = await explorerApi.getTransactionByHash(hash)
  const tx = data.transaction
  const block = data.block
  const status = data.status

  // Derive sender address from first input's public key, per your requirement
  let sender = "unknown"
  if (tx.type === "coinbase") {
    sender = "Coinbase"
  } else if (tx.inputs?.[0]?.publicKey) {
    sender = await generateAddress(Buffer.from(tx?.inputs?.[0]?.publicKey, "hex"))
  }

  // Recipients and total value
  const outputs = Array.isArray(tx.outputs) ? tx.outputs : []
  const totalValue = sumOutputs(outputs)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <Badge
          variant="outline"
          className={
            status === "confirmed"
              ? "bg-emerald-900/50 text-emerald-300"
              : status === "pending"
                ? "bg-amber-900/50 text-amber-300"
                : "bg-gray-800 text-gray-300"
          }
        >
          {status}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {tx.type}
        </Badge>
      </div>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Hash */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-400 min-w-32">Transaction Hash:</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-sm break-all">{tx.hash}</span>
                <CopyButton text={tx.hash} ariaLabel="Copy transaction hash" />
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Status:</span>
              <Badge
                variant="outline"
                className={
                  status === "confirmed"
                    ? "bg-emerald-900/50 text-emerald-300"
                    : status === "pending"
                      ? "bg-amber-900/50 text-amber-300"
                      : "bg-gray-800 text-gray-300"
                }
              >
                {status}
              </Badge>
            </div>

            {/* Block */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Block:</span>
              {block?.index ? (
                <Link href={`/explorer/block/${block.index}`} className="text-cyan-400 hover:underline">
                  #{block.index}
                </Link>
              ) : (
                <span className="text-sm">—</span>
              )}
            </div>

            {/* Block Hash */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-400 min-w-32">Block Hash:</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-sm break-all">{block?.hash || "—"}</span>
                {block?.hash ? <CopyButton text={block.hash} ariaLabel="Copy block hash" /> : null}
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Timestamp:</span>
              <span className="text-sm">{formatTime(tx.timestamp)}</span>
            </div>

            {/* From */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-400 min-w-32">From:</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-sm break-all">{sender === "Coinbase" ? "Coinbase" : sender}</span>
                {sender && sender !== "Coinbase" ? <CopyButton text={sender} ariaLabel="Copy sender address" /> : null}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="p-2 bg-gray-800 rounded-full">
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </div>
            </div>

            {/* To (list all outputs) */}
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
                          className="font-mono text-sm text-cyan-400 hover:underline break-all"
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

            {/* Total Value */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Output Value:</span>
              <div className="text-right">
                <p className="font-semibold">{totalValue.toLocaleString()} SNC</p>
              </div>
            </div>

            {/* Counts */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Inputs:</span>
              <span className="text-sm">{tx.inputs?.length ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Outputs:</span>
              <span className="text-sm">{tx.outputs?.length ?? 0}</span>
            </div>
          </div>

          {/* Inputs and Outputs breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Card className="bg-gray-900/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-base">Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tx.inputs?.length ? (
                  tx.inputs.map((inp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Prev Tx:</span>
                        <Link
                          href={`/explorer/tx/${inp.previousTxHash}`}
                          className="font-mono text-xs text-cyan-400 hover:underline break-all"
                        >
                          {inp.previousTxHash}
                        </Link>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Output Index:</span>
                        <span className="text-xs">{inp.outputIndex}</span>
                      </div>
                      {inp.publicKey ? (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs text-gray-400">Public Key:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] break-all max-w-[440px] md:max-w-[520px]">
                              {inp.publicKey}
                            </span>
                            <CopyButton text={inp.publicKey} ariaLabel="Copy public key" />
                          </div>
                        </div>
                      ) : null}
                      {typeof inp.sequence === "number" ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Sequence:</span>
                          <span className="text-xs">{inp.sequence}</span>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No inputs (coinbase)</div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 border-gray-800">
              <CardHeader>
                <CardTitle className="text-base">Outputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {outputs.length ? (
                  outputs.map((out, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-400">Address:</span>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/explorer/address/${out.address}`}
                            className="font-mono text-xs text-cyan-400 hover:underline break-all"
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
                      {out.scriptPubKey ? (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs text-gray-400">ScriptPubKey:</span>
                          <span className="font-mono text-[10px] break-all max-w-[540px]">{out.scriptPubKey}</span>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No outputs</div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
