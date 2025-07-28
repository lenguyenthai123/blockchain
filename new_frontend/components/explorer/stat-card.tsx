"use client"

import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string
  change?: string
  subtitle?: string
  icon: string
  isLoading?: boolean
}

export function StatCard({ title, value, change, subtitle, icon, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse" />
              <div className="h-6 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="text-2xl opacity-50">{icon}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</p>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-2xl font-bold text-white">{value}</p>
              {change && <span className="text-sm text-green-400 font-medium">{change}</span>}
            </div>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="text-3xl opacity-70">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
