import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ExplorerStatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  change?: string
  trend?: "up" | "down"
}

export function ExplorerStatCard({ title, value, icon, change, trend }: ExplorerStatCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="text-cyan-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && (
          <div className="flex items-center text-xs text-muted-foreground">
            {trend === "up" ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-400" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-400" />
            )}
            <span className={trend === "up" ? "text-green-400" : "text-red-400"}>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
