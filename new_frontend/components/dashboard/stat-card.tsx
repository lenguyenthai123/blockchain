import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    direction: "up" | "down" | "neutral"
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  loading?: boolean
  className?: string
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  loading = false,
  className,
}: StatCardProps) {
  const getTrendColor = (direction: "up" | "down" | "neutral") => {
    switch (direction) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // Format large numbers
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <Card className={cn("bg-gray-900 border-gray-800 hover:bg-gray-800/50 transition-colors", className)}>
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-gray-400" />}
                <p className="text-sm font-medium text-gray-400">{title}</p>
              </div>
              {badge && (
                <Badge
                  variant={badge.variant || "outline"}
                  className="text-xs bg-gray-800 border-gray-700 text-gray-300"
                >
                  {badge.text}
                </Badge>
              )}
            </div>

            {/* Value */}
            <div className="mb-2">
              <p className="text-2xl font-bold text-white">{formatValue(value)}</p>
            </div>

            {/* Description and Trend */}
            <div className="flex items-center justify-between">
              {description && <p className="text-xs text-gray-500">{description}</p>}
              {trend && (
                <div className={cn("flex items-center gap-1 text-xs", getTrendColor(trend.direction))}>
                  <span className="font-medium">
                    {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
                    {Math.abs(trend.value)}
                  </span>
                  <span>{trend.label}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
