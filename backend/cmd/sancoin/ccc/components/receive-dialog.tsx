"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownCircle, Copy } from "lucide-react"
import Image from "next/image"
import type { FC } from "react"

interface ReceiveDialogProps {
  walletAddress: string
}

const ReceiveDialog: FC<ReceiveDialogProps> = ({ walletAddress }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    alert("Địa chỉ đã được sao chép!")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-transparent border-cyan-500 text-cyan-500 hover:bg-cyan-900/50 hover:text-cyan-400 font-bold py-6 text-base"
        >
          <ArrowDownCircle className="mr-2 h-5 w-5" /> Nhận
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Nhận SanCoin (SNC)</DialogTitle>
          <DialogDescription>Chia sẻ địa chỉ này để nhận SNC vào ví của bạn.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="p-4 bg-white rounded-lg">
            <Image src="/placeholder.svg?width=200&height=200" alt="QR Code" width={200} height={200} />
          </div>
          <div className="w-full">
            <Label htmlFor="wallet-address" className="text-gray-400">
              Địa chỉ ví của bạn
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="wallet-address"
                value={walletAddress}
                readOnly
                className="bg-gray-800 border-gray-600 font-mono text-sm"
              />
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReceiveDialog
