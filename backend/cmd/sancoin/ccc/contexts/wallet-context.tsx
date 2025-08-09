"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { generateKeyPair, getAddressFromPublicKey, signTransaction } from "@/lib/crypto"
import { api } from "@/lib/api"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  privateKey: string | null
  publicKey: string | null
  isLoading: boolean
  error: string | null
  networkStatus: "online" | "offline" | "connecting"
  lastSync: Date | null
}

interface Transaction {
  hash: string
  from: string
  to: string
  amount: number
  fee: number
  timestamp: string
  status: "pending" | "confirmed" | "failed"
  blockNumber?: number
}

interface WalletContextType extends WalletState {
  createWallet: () => Promise<void>
  importWallet: (privateKey: string) => Promise<void>
  sendTransaction: (to: string, amount: number) => Promise<string>
  refreshBalance: () => Promise<void>
  getTransactionHistory: () => Promise<Transaction[]>
  getPortfolioValue: () => number
  exportWallet: () => string | null
  lockWallet: () => void
  unlockWallet: (password: string) => Promise<boolean>
  isLocked: boolean
  syncWithNetwork: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    privateKey: null,
    publicKey: null,
    isLoading: false,
    error: null,
    networkStatus: "offline",
    lastSync: null,
  })

  const [isLocked, setIsLocked] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Load wallet from localStorage on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const savedWallet = localStorage.getItem("sanwallet")
        if (savedWallet) {
          const walletData = JSON.parse(savedWallet)
          setState((prev) => ({
            ...prev,
            isConnected: true,
            address: walletData.address,
            privateKey: walletData.privateKey,
            publicKey: walletData.publicKey,
            networkStatus: "connecting",
          }))

          // Refresh balance and sync
          await refreshBalance()
          await syncWithNetwork()
        }
      } catch (error) {
        console.error("Failed to load wallet:", error)
        setState((prev) => ({ ...prev, error: "Failed to load wallet" }))
      }
    }

    loadWallet()
  }, [])

  // Auto-sync every 30 seconds
  useEffect(() => {
    if (state.isConnected && !isLocked) {
      const interval = setInterval(syncWithNetwork, 30000)
      return () => clearInterval(interval)
    }
  }, [state.isConnected, isLocked])

  const createWallet = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const { privateKey, publicKey } = generateKeyPair()
      const address = getAddressFromPublicKey(publicKey)

      const walletData = { privateKey, publicKey, address }
      localStorage.setItem("sanwallet", JSON.stringify(walletData))

      setState((prev) => ({
        ...prev,
        isConnected: true,
        address,
        privateKey,
        publicKey,
        isLoading: false,
        networkStatus: "connecting",
      }))

      await refreshBalance()
      await syncWithNetwork()
    } catch (error) {
      console.error("Failed to create wallet:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to create wallet",
      }))
    }
  }, [])

  const importWallet = useCallback(async (privateKey: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Validate private key format
      if (!privateKey || privateKey.length !== 64) {
        throw new Error("Invalid private key format")
      }

      const publicKey = getAddressFromPublicKey(privateKey) // This should be updated to get public key
      const address = getAddressFromPublicKey(publicKey)

      const walletData = { privateKey, publicKey, address }
      localStorage.setItem("sanwallet", JSON.stringify(walletData))

      setState((prev) => ({
        ...prev,
        isConnected: true,
        address,
        privateKey,
        publicKey,
        isLoading: false,
        networkStatus: "connecting",
      }))

      await refreshBalance()
      await syncWithNetwork()
    } catch (error) {
      console.error("Failed to import wallet:", error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to import wallet",
      }))
    }
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!state.address) return

    try {
      setState((prev) => ({ ...prev, networkStatus: "connecting" }))
      const balance = await api.getBalance(state.address)
      setState((prev) => ({
        ...prev,
        balance,
        networkStatus: "online",
        lastSync: new Date(),
      }))
    } catch (error) {
      console.error("Failed to refresh balance:", error)
      setState((prev) => ({
        ...prev,
        networkStatus: "offline",
        error: "Failed to refresh balance",
      }))
    }
  }, [state.address])

  const getTransactionHistory = useCallback(async (): Promise<Transaction[]> => {
    if (!state.address) return []

    try {
      const history = await api.getTransactionHistory(state.address)
      setTransactions(history)
      return history
    } catch (error) {
      console.error("Failed to get transaction history:", error)
      return []
    }
  }, [state.address])

  const sendTransaction = useCallback(
    async (to: string, amount: number): Promise<string> => {
      if (!state.privateKey || !state.address) {
        throw new Error("Wallet not connected")
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        // Get UTXOs for the address
        const utxos = await api.getUTXOs(state.address)

        if (utxos.length === 0) {
          throw new Error("No UTXOs available")
        }

        // Calculate total available
        const totalAvailable = utxos.reduce((sum, utxo) => sum + utxo.amount, 0)
        const fee = 0.001 // Fixed fee for now

        if (totalAvailable < amount + fee) {
          throw new Error("Insufficient balance")
        }

        // Create transaction
        const transaction = {
          inputs: utxos.map((utxo) => ({
            txHash: utxo.txHash,
            outputIndex: utxo.outputIndex,
            amount: utxo.amount,
          })),
          outputs: [
            { address: to, amount },
            // Change output if needed
            ...(totalAvailable > amount + fee
              ? [
                  {
                    address: state.address,
                    amount: totalAvailable - amount - fee,
                  },
                ]
              : []),
          ],
          fee,
        }

        // Sign transaction
        const signedTx = signTransaction(transaction, state.privateKey)

        // Broadcast transaction
        const txHash = await api.broadcastTransaction(signedTx)

        setState((prev) => ({ ...prev, isLoading: false }))

        // Refresh balance after sending
        setTimeout(refreshBalance, 1000)

        return txHash
      } catch (error) {
        console.error("Failed to send transaction:", error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to send transaction",
        }))
        throw error
      }
    },
    [state.privateKey, state.address, refreshBalance],
  )

  const getPortfolioValue = useCallback((): number => {
    // Assuming 1 SNC = $250 (this should come from API in real implementation)
    const sncPrice = 250
    return state.balance * sncPrice
  }, [state.balance])

  const exportWallet = useCallback((): string | null => {
    if (!state.privateKey) return null
    return state.privateKey
  }, [state.privateKey])

  const lockWallet = useCallback(() => {
    setIsLocked(true)
  }, [])

  const unlockWallet = useCallback(async (password: string): Promise<boolean> => {
    // In a real implementation, you'd verify the password
    // For now, we'll just unlock if any password is provided
    if (password) {
      setIsLocked(false)
      await syncWithNetwork()
      return true
    }
    return false
  }, [])

  const syncWithNetwork = useCallback(async () => {
    if (!state.address || isLocked) return

    try {
      setState((prev) => ({ ...prev, networkStatus: "connecting" }))

      // Refresh balance and transaction history
      await Promise.all([refreshBalance(), getTransactionHistory()])

      setState((prev) => ({
        ...prev,
        networkStatus: "online",
        lastSync: new Date(),
      }))
    } catch (error) {
      console.error("Failed to sync with network:", error)
      setState((prev) => ({
        ...prev,
        networkStatus: "offline",
        error: "Failed to sync with network",
      }))
    }
  }, [state.address, isLocked, refreshBalance, getTransactionHistory])

  const contextValue: WalletContextType = {
    ...state,
    createWallet,
    importWallet,
    sendTransaction,
    refreshBalance,
    getTransactionHistory,
    getPortfolioValue,
    exportWallet,
    lockWallet,
    unlockWallet,
    isLocked,
    syncWithNetwork,
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
