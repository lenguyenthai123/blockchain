import TransactionsTable from "@/components/transactions-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Mock data
const mockTransactions = [
  {
    hash: "0xabc...123",
    method: "Transfer",
    block: 123456,
    age: "2 mins ago",
    from: "san1q...a3x4",
    to: "san1q...b9y5",
    value: 2.5,
    status: "Completed",
  },
  {
    hash: "0xdef...456",
    method: "Transfer",
    block: 123455,
    age: "10 mins ago",
    from: "san1q...c1z6",
    to: "san1q...a3x4",
    value: 0.8,
    status: "Completed",
  },
  {
    hash: "0xghi...789",
    method: "Contract Execution",
    block: 123450,
    age: "1 hour ago",
    from: "san1q...d7w8",
    to: "Contract 0x123...",
    value: 5.2,
    status: "Pending",
  },
  {
    hash: "0xjkl...012",
    method: "Transfer",
    block: 123449,
    age: "2 hours ago",
    from: "san1q...a3x4",
    to: "san1q...e9f0",
    value: 10.0,
    status: "Completed",
  },
  {
    hash: "0xmno...345",
    method: "Transfer",
    block: 123448,
    age: "5 hours ago",
    from: "san1q...g1h2",
    to: "san1q...a3x4",
    value: 1.1,
    status: "Failed",
  },
]

export default function TransactionsPage() {
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>A complete list of all your incoming and outgoing transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <TransactionsTable transactions={mockTransactions} />
      </CardContent>
    </Card>
  )
}
