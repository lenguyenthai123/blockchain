import type React from "react"
import ExplorerHeader from "@/components/explorer/header"

export default function ExplorerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <ExplorerHeader />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} SanScan. All rights reserved.</p>
      </footer>
    </div>
  )
}
