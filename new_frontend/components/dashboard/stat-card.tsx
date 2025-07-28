import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon?: React.ReactNode
}

export default function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && trend && (
          <div className="flex items-center text-xs mt-1">
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
            )}
            <span className={trend.isPositive ? "text-green-400" : "text-red-400"}>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
