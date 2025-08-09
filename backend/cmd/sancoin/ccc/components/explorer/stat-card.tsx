import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface ExplorerStatCardProps {
  title: string
  value: string
  change?: string
  subValue?: string
  icon: LucideIcon
}

export default function ExplorerStatCard({ title, value, change, subValue, icon: Icon }: ExplorerStatCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <Icon className="h-6 w-6 text-gray-500" />
        <CardTitle className="text-sm font-medium text-gray-400 uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold text-white">{value}</div>
        {change && <p className="text-xs text-green-400">{change}</p>}
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
      </CardContent>
    </Card>
  )
}
