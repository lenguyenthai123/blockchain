import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  hint?: string
  className?: string
  color?: "emerald" | "cyan" | "violet" | "amber" | "rose" | "gray"
}

/**
 * Compact metric tile with soft glow and subtle gradient border.
 */
export function MetricCard({ label, value, icon, hint, className, color = "cyan" }: MetricCardProps) {
  const ring = {
    emerald: "ring-emerald-500/30",
    cyan: "ring-cyan-500/30",
    violet: "ring-violet-500/30",
    amber: "ring-amber-500/30",
    rose: "ring-rose-500/30",
    gray: "ring-gray-500/20",
  }[color]

  const glow = {
    emerald: "shadow-[0_0_45px_-12px_rgba(16,185,129,0.35)]",
    cyan: "shadow-[0_0_45px_-12px_rgba(34,211,238,0.35)]",
    violet: "shadow-[0_0_45px_-12px_rgba(139,92,246,0.35)]",
    amber: "shadow-[0_0_45px_-12px_rgba(245,158,11,0.35)]",
    rose: "shadow-[0_0_45px_-12px_rgba(244,63,94,0.35)]",
    gray: "shadow-[0_0_45px_-12px_rgba(156,163,175,0.25)]",
  }[color]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4 backdrop-blur",
        "ring-1",
        ring,
        glow,
        "transition-colors hover:border-white/15 hover:bg-white/[0.06]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
        {icon ? <div className="text-cyan-400/90">{icon}</div> : null}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white tabular-nums">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-400">{hint}</div> : null}
      {/* bottom accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  )
}
