"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

export function CopyButton({ text, ariaLabel = "Copy to clipboard" }: { text: string; ariaLabel?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={ariaLabel}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch (e) {
          // noop
        }
      }}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}
