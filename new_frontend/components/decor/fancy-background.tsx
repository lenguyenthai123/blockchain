import type { ReactNode } from "react"

interface FancyBackgroundProps {
  children: ReactNode
  className?: string
}

/**
 * Decorative background wrapper with a soft gradient and a subtle grid overlay.
 * Safe to use in server or client components.
 */
export function FancyBackground({ children, className }: FancyBackgroundProps) {
  return (
    <div className={`relative ${className || ""}`}>
      {/* Soft radial gradient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-28 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-500/15 via-emerald-400/10 to-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-500/10 via-cyan-400/10 to-sky-500/10 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"
      />

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  )
}
