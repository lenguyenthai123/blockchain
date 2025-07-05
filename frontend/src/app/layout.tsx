import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "MyCoin - Blockchain Explorer & Wallet",
  description: "A comprehensive blockchain explorer and wallet for MyCoin cryptocurrency",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
