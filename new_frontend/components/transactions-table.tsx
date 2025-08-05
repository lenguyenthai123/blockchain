import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ExternalLink, ArrowRight, ArrowDown, ArrowUp, Coins } from "lucide-react"
import Link from "next/link"
import type { TransactionWithDirection } from "@/lib/utxo-api"

interface TransactionTableProps {
  transactions: TransactionWithDirection[]
  userAddress?: string
}

export default function TransactionsTable({ transactions, userAddress }: TransactionTableProps) {
  const getDirectionIcon = (direction: TransactionWithDirection["direction"]) => {
    switch (direction) {
      case "sent":
        return <ArrowUp className="h-4 w-4 text-red-400" />
      case "received":
        return <ArrowDown className="h-4 w-4 text-green-400" />
      case "self":
        return <ArrowRight className="h-4 w-4 text-blue-400" />
      default:
        return <Coins className="h-4 w-4 text-gray-400" />
    }
  }

  const getDirectionBadge = (direction: TransactionWithDirection["direction"], type: string) => {
    if (type === "coinbase") {
      return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50"
    }

    switch (direction) {
      case "sent":
        return "bg-red-900/50 text-red-300 border-red-700/50"
      case "received":
        return "bg-green-900/50 text-green-300 border-green-700/50"
      case "self":
        return "bg-blue-900/50 text-blue-300 border-blue-700/50"
      default:
        return "bg-gray-900/50 text-gray-300 border-gray-700/50"
    }
  }

  const getDirectionText = (direction: TransactionWithDirection["direction"], type: string) => {
    if (type === "coinbase") return "Mining Reward"

    switch (direction) {
      case "sent":
        return "Sent"
      case "received":
        return "Received"
      case "self":
        return "Self Transfer"
      default:
        return "Unknown"
    }
  }

  const formatAmount = (amount: number | undefined, direction: TransactionWithDirection["direction"]) => {
    // Add null/undefined check
    if (amount === undefined || amount === null || isNaN(amount)) {
      return <span className="text-gray-400">0 SNC</span>
    }

    const sign = direction === "sent" ? "-" : "+"
    const color = direction === "sent" ? "text-red-400" : "text-green-400"

    if (direction === "self") {
      return <span className="text-blue-400">0 SNC</span>
    }

    return (
      <span className={color}>
        {sign}
        {amount.toFixed(3)} SNC
      </span>
    )
  }

  const AddressCell = ({ address, label }: { address: string; label?: string }) => {
    if (!address || address === "Unknown" || address === "Coinbase") {
      return <span className="text-gray-500 text-sm">{address || "Unknown"}</span>
    }

    return (
      <div className="flex flex-col">
        {label && <span className="text-xs text-gray-500 mb-1">{label}</span>}
        <Link
          href={`/explorer/address/${address}`}
          className="font-mono text-sm text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {address.length > 15 ? `${address.substring(0, 8)}...${address.substring(address.length - 6)}` : address}
        </Link>
      </div>
    )
  }

  const formatAge = (timestamp: number) => {
    if (!timestamp) return "Unknown"

    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getFromToAddresses = (tx: TransactionWithDirection) => {
    if (tx.type === "coinbase") {
      return {
        from: "Coinbase",
        to: userAddress || tx.outputs[0]?.address || "Unknown",
      }
    }

    // For regular transactions
    if (tx.direction === "sent") {
      return {
        from: userAddress || "You",
        to: tx.counterpartyAddress || tx.outputs.find((o) => o.address !== userAddress)?.address || "Unknown",
      }
    } else if (tx.direction === "received") {
      return {
        from: tx.counterpartyAddress || "Unknown",
        to: userAddress || "You",
      }
    } else {
      // Self transaction
      return {
        from: userAddress || "You",
        to: userAddress || "You",
      }
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        <Coins className="h-12 w-12 mx-auto mb-4 text-gray-600" />
        <p className="text-lg font-medium mb-2">No transactions found</p>
        <p className="text-sm">Your transaction history will appear here</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900">
            <TableHead className="w-12"></TableHead>
            <TableHead>Transaction Hash</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Block</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>From</TableHead>
            <TableHead className="w-8"></TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Fee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const { from, to } = getFromToAddresses(tx)

            return (
              <TableRow key={tx.hash} className="border-gray-800 hover:bg-gray-800/50">
                <TableCell>
                  <div className="flex items-center justify-center">{getDirectionIcon(tx.direction)}</div>
                </TableCell>

                <TableCell>
                  <Link
                    href={`/explorer/tx/${tx.hash}`}
                    className="font-mono text-cyan-400 flex items-center gap-1 text-sm hover:underline"
                  >
                    {tx.hash.substring(0, 12)}...
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", getDirectionBadge(tx.direction, tx.type))}>
                    {getDirectionText(tx.direction, tx.type)}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Link href={`/explorer/block/${tx.blockIndex}`} className="text-cyan-400 hover:underline text-sm">
                    {tx.blockIndex}
                  </Link>
                </TableCell>

                <TableCell className="text-gray-400 text-sm">{formatAge(tx.timestamp)}</TableCell>

                <TableCell>
                  <AddressCell address={from} />
                </TableCell>

                <TableCell>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-cyan-500/10">
                    <ArrowRight className="h-3 w-3 text-cyan-400" />
                  </div>
                </TableCell>

                <TableCell>
                  <AddressCell address={to} />
                </TableCell>

                <TableCell className="text-right font-semibold">{formatAmount(tx.netAmount, tx.direction)}</TableCell>

                <TableCell className="text-right text-sm text-gray-400">
                  {tx.fee && tx.fee > 0 ? `${tx.fee.toFixed(3)} SNC` : "-"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
