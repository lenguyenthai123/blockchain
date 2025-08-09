import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"

type Transaction = {
  hash: string
  method: string
  block: number
  age: string
  from: string
  to: string
  value: number
  status: "Completed" | "Pending" | "Failed"
}

export default function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-900/50 text-green-300 border-green-700/50"
      case "Pending":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-700/50 animate-pulse"
      case "Failed":
        return "bg-red-900/50 text-red-300 border-red-700/50"
    }
  }

  const AddressCell = ({ address }: { address: string }) => (
    <Link
      href={`/explorer/address/${address}`}
      className="font-mono text-sm text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer"
    >
      {address.length > 15 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address}
    </Link>
  )

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-gray-900">
            <TableHead>Txn Hash</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Block</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>From</TableHead>
            <TableHead></TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.hash} className="border-gray-800 hover:bg-gray-800/50">
              <TableCell>
                <Link
                  href={`/explorer/tx/${tx.hash}`}
                  className="font-mono text-cyan-400 flex items-center gap-1 text-sm hover:underline"
                >
                  {tx.hash.substring(0, 10)}...
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-300">
                  {tx.method}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/explorer/block/${tx.block}`} className="text-cyan-400 hover:underline">
                  {tx.block}
                </Link>
              </TableCell>
              <TableCell className="text-gray-400">{tx.age}</TableCell>
              <TableCell>
                <AddressCell address={tx.from} />
              </TableCell>
              <TableCell>
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-cyan-500/10">
                  <ArrowRight className="h-3 w-3 text-cyan-400" />
                </div>
              </TableCell>
              <TableCell>
                <AddressCell address={tx.to} />
              </TableCell>
              <TableCell className="text-right font-semibold text-white">{tx.value} SNC</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("capitalize", getStatusBadge(tx.status))}>
                  {tx.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
