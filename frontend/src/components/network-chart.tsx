"use client"

import { useEffect, useRef } from "react"

export default function NetworkChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = 200 * 2
    ctx.scale(2, 2)

    // Generate sample data for 14 days
    const data = Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      transactions: Math.floor(Math.random() * 500000) + 800000,
    }))

    // Chart dimensions
    const padding = 40
    const chartWidth = canvas.width / 2 - padding * 2
    const chartHeight = canvas.height / 2 - padding * 2

    // Find min and max values
    const maxTransactions = Math.max(...data.map((d) => d.transactions))
    const minTransactions = Math.min(...data.map((d) => d.transactions))

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2)

    // Draw grid lines
    ctx.strokeStyle = "#f0f0f0"
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }

    // Draw chart line
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    ctx.beginPath()

    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y =
        padding +
        chartHeight -
        ((point.transactions - minTransactions) / (maxTransactions - minTransactions)) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Draw area under curve
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
    ctx.beginPath()
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y =
        padding +
        chartHeight -
        ((point.transactions - minTransactions) / (maxTransactions - minTransactions)) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(padding + chartWidth, padding + chartHeight)
    ctx.lineTo(padding, padding + chartHeight)
    ctx.closePath()
    ctx.fill()

    // Draw data points
    ctx.fillStyle = "#3b82f6"
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index
      const y =
        padding +
        chartHeight -
        ((point.transactions - minTransactions) / (maxTransactions - minTransactions)) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = "#666"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    // X-axis labels (dates)
    const dates = ["Jun 15", "Jun 22", "Jun 29"]
    dates.forEach((date, index) => {
      const x = padding + (chartWidth / (dates.length - 1)) * index
      ctx.fillText(date, x, canvas.height / 2 - 10)
    })

    // Y-axis labels
    ctx.textAlign = "right"
    for (let i = 0; i <= 2; i++) {
      const value = minTransactions + ((maxTransactions - minTransactions) / 2) * i
      const y = padding + chartHeight - (chartHeight / 2) * i
      ctx.fillText(`${(value / 1000).toFixed(0)}k`, padding - 10, y + 4)
    }
  }, [])

  return (
    <div className="w-full h-[200px] relative">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "200px" }} />
    </div>
  )
}
