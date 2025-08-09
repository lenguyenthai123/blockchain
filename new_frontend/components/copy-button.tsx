"use client"

import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

interface CopyButtonProps {
  value: string
  className?: string
  size?: "icon" | "sm" | "default" | "lg"
  variant?: "ghost" | "outline" | "secondary" | "default" | "destructive" | "link"
  label?: string
}

export function CopyButton({ value, className, size = "icon", variant = "ghost", label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          // no-op
        }
      }}
      title={label || "Copy to clipboard"}
      aria-label={label || "Copy to clipboard"}
    >
      <Copy className="h-4 w-4" />
      <span className="sr-only">{label || "Copy to clipboard"}</span>
      {copied && <span className="ml-2 text-xs text-emerald-400">Copied</span>}
    </Button>
  )
}
