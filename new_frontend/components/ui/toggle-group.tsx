"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SearchType = "single" // we only need single-select behavior

type ToggleGroupContextValue = {
  value?: string
  setValue: (v: string) => void
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

export type ToggleGroupProps = {
  type?: SearchType
  value?: string
  onValueChange?: (v: string | undefined) => void
  className?: string
  children: React.ReactNode
  "aria-label"?: string
}

export function ToggleGroup({ type = "single", value, onValueChange, className, children, ...rest }: ToggleGroupProps) {
  const setValue = (v: string) => {
    if (type === "single") {
      onValueChange?.(v)
    }
  }

  return (
    <ToggleGroupContext.Provider value={{ value, setValue }}>
      <div
        role="group"
        {...rest}
        className={cn("inline-flex items-center gap-1 rounded-lg border border-white/10 bg-gray-900/50 p-1", className)}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

export type ToggleGroupItemProps = {
  value: string
  className?: string
  children: React.ReactNode
  disabled?: boolean
  "aria-label"?: string
}

export function ToggleGroupItem({ value, className, children, disabled, ...rest }: ToggleGroupItemProps) {
  const ctx = React.useContext(ToggleGroupContext)
  const isOn = ctx?.value === value

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && ctx?.setValue(value)}
      data-state={isOn ? "on" : "off"}
      aria-pressed={isOn}
      {...rest}
      className={cn(
        "select-none rounded-md px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        isOn ? "bg-white/10 text-white shadow-inner" : "text-gray-300 hover:bg-white/5",
        className,
      )}
    >
      {children}
    </button>
  )
}
