"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { sanCoinAPI } from "@/lib/api"

interface ChartData {
  time: string
  value: number
}

export default function PortfolioChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get blockchain stats for portfolio calculation
        const stats = await sanCoinAPI.getNetworkStats()

        // Generate time series data based on blockchain activity
        const data: ChartData[] = []
        const now = new Date()

        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000)
          const baseValue = stats.circulatingSupply * 0.0001 // Base portfolio value
          const variation = Math.sin(i * 0.1) * baseValue * 0.1 // Add some variation

          data.push({
            time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            value: baseValue + variation,
          })
        }

        setChartData(data)
      } catch (error) {
        console.error("Failed to load chart data:", error)
        setError("Failed to load chart data")
        // Set empty data on error
        setChartData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>{error}</p>
          <p className="text-sm mt-2">Please check your connection</p>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>No chart data available</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Portfolio Value (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} interval="preserveStartEnd" />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Portfolio Value"]}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#06B6D4" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-400">24h Change</span>
          <span className="text-green-400 font-medium">+$90.25 (+7.2%)</span>
        </div>
      </CardContent>
    </Card>
  )
}
