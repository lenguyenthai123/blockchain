"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { generateKeyPair, generateMnemonic, mnemonicToKeyPair, signData, type KeyPair } from "@/lib/crypto"
import { sanCoinAPI } from "@/lib/api"

export interface Transaction {
  hash: string
  from: string
  to: string
  amount: number
  fee: number
  timestamp: number
  status: "pending" | "confirmed" | "failed"
  type: "send" | "receive"
  blockNumber?: number
}

export interface WalletContextType {
  // Wallet state
  wallet: KeyPair | null
  balance: number
  transactions: Transaction[]
  isLoading: boolean
  isInitializing: boolean
  networkStatus: "online" | "offline" | "syncing"
  lastSyncTime: Date | null
  isOnline: boolean

  // Wallet actions
  createWallet: () => Promise<{ wallet: KeyPair; mnemonic: string }>
  importWallet: (mnemonic: string) => Promise<KeyPair>
  sendTransaction: (to: string, amount: number) => Promise<string>
  refreshAll: () => Promise<void>

  // Utility functions
  getPortfolioValue: () => number
  formatAddress: (address: string) => string
  getTransactionHistory: () => Promise<Transaction[]>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<KeyPair | null>(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline" | "syncing">("offline")
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Initialize wallet from localStorage
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        console.log("Initializing wallet...")
        const savedWallet = localStorage.getItem("sanwallet_wallet")

        if (savedWallet) {
          const walletData = JSON.parse(savedWallet)
          console.log("Found saved wallet:", walletData.address)
          setWallet(walletData)
          await loadWalletData(walletData)
        } else {
          console.log("No saved wallet found")
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error)
        setNetworkStatus("offline")
      } finally {
        setIsInitializing(false)
      }
    }

    initializeWallet()
  }, [])

  // Load wallet data from API
  const loadWalletData = async (walletData: KeyPair) => {
    try {
      setIsLoading(true)
      setNetworkStatus("syncing")

      // Load balance from API
      const balanceResponse = await sanCoinAPI.getBalance(walletData.address)
      setBalance(balanceResponse.balance)

      // Load transactions from API
      const txResponse = await sanCoinAPI.getAddressTransactions(walletData.address)
      const formattedTxs: Transaction[] = txResponse.transactions.map((tx: any) => ({
        hash: tx.hash,
        from: tx.inputs?.[0]?.address || tx.from || "unknown",
        to: tx.outputs?.[0]?.address || tx.to || "unknown",
        amount: tx.outputs?.[0]?.amount || tx.amount || 0,
        fee: 0.0001,
        timestamp: tx.timestamp,
        status: "confirmed",
        type: tx.inputs?.[0]?.address === walletData.address ? "send" : "receive",
        blockNumber: tx.blockIndex,
      }))
      setTransactions(formattedTxs)

      setNetworkStatus("online")
      setLastSyncTime(new Date())
      console.log("Wallet data loaded successfully")
    } catch (error) {
      console.error("Failed to load wallet data:", error)
      setNetworkStatus("offline")
      // Set empty data on error
      setBalance(0)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Create new wallet
  const createWallet = useCallback(async (): Promise<{ wallet: KeyPair; mnemonic: string }> => {
    console.log("Creating new wallet...")
    const keyPair = generateKeyPair()
    const mnemonic = generateMnemonic()

    // Save to localStorage
    localStorage.setItem("sanwallet_wallet", JSON.stringify(keyPair))
    localStorage.setItem("sanwallet_mnemonic", mnemonic)

    setWallet(keyPair)
    await loadWalletData(keyPair)

    console.log("Wallet created:", keyPair.address)
    return { wallet: keyPair, mnemonic }
  }, [])

  // Import wallet from mnemonic
  const importWallet = useCallback(async (mnemonic: string): Promise<KeyPair> => {
    console.log("Importing wallet from mnemonic...")
    const keyPair = mnemonicToKeyPair(mnemonic)

    // Save to localStorage
    localStorage.setItem("sanwallet_wallet", JSON.stringify(keyPair))
    localStorage.setItem("sanwallet_mnemonic", mnemonic)

    setWallet(keyPair)
    await loadWalletData(keyPair)

    console.log("Wallet imported:", keyPair.address)
    return keyPair
  }, [])

  // Send transaction using API
  const sendTransaction = useCallback(
    async (to: string, amount: number): Promise<string> => {
      if (!wallet) throw new Error("No wallet connected")

      setIsLoading(true)
      try {
        console.log(`Sending ${amount} SNC to ${to}`)

        // Create transaction data
        const txData = {
          hash: "", // Will be generated by backend
          inputs: [
            {
              previousTxHash: "",
              outputIndex: 0,
              signature: signData(`${wallet.address}${to}${amount}${Date.now()}`, wallet.privateKey),
              publicKey: wallet.publicKey,
              sequence: 0,
            },
          ],
          outputs: [
            {
              amount: amount,
              address: to,
              scriptPubKey: "",
            },
          ],
          timestamp: Date.now(),
          type: "transfer",
          minerAddress: wallet.address,
        }

        // Submit signed transaction
        const response = await sanCoinAPI.submitSignedTransaction(txData)

        // Add to local transactions
        const newTx: Transaction = {
          hash: response.hash || `tx_${Date.now()}`,
          from: wallet.address,
          to,
          amount,
          fee: 0.0001,
          timestamp: Date.now(),
          status: "pending",
          type: "send",
        }

        setTransactions((prev) => [newTx, ...prev])
        setBalance((prev) => prev - amount - 0.0001)

        console.log("Transaction sent:", response.hash)
        return response.hash || `tx_${Date.now()}`
      } catch (error) {
        console.error("Failed to send transaction:", error)
        throw new Error("Failed to send transaction. Please check your connection and try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [wallet],
  )

  // Refresh all data
  const refreshAll = useCallback(async () => {
    if (!wallet) return
    await loadWalletData(wallet)
  }, [wallet])

  // Get portfolio value (using real price from API if available)
  const getPortfolioValue = useCallback(() => {
    const sncPrice = 125.5 // This should come from a price API in production
    return balance * sncPrice
  }, [balance])

  // Format address for display
  const formatAddress = useCallback((address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }, [])

  // Get transaction history
  const getTransactionHistory = useCallback(async (): Promise<Transaction[]> => {
    if (!wallet) return []

    try {
      const txResponse = await sanCoinAPI.getAddressTransactions(wallet.address)
      return txResponse.transactions.map((tx: any) => ({
        hash: tx.hash,
        from: tx.inputs?.[0]?.address || tx.from || "unknown",
        to: tx.outputs?.[0]?.address || tx.to || "unknown",
        amount: tx.outputs?.[0]?.amount || tx.amount || 0,
        fee: 0.0001,
        timestamp: tx.timestamp,
        status: "confirmed",
        type: tx.inputs?.[0]?.address === wallet.address ? "send" : "receive",
        blockNumber: tx.blockIndex,
      }))
    } catch (error) {
      console.error("Failed to get transaction history:", error)
      return transactions
    }
  }, [wallet, transactions])

  // Network status monitoring
  useEffect(() => {
    const checkNetworkStatus = () => {
      setIsOnline(navigator.onLine)
      if (!navigator.onLine) {
        setNetworkStatus("offline")
      }
    }

    window.addEventListener("online", checkNetworkStatus)
    window.addEventListener("offline", checkNetworkStatus)

    return () => {
      window.removeEventListener("online", checkNetworkStatus)
      window.removeEventListener("offline", checkNetworkStatus)
    }
  }, [])

  const value: WalletContextType = {
    // State
    wallet,
    balance,
    transactions,
    isLoading,
    isInitializing,
    networkStatus,
    lastSyncTime,
    isOnline,

    // Actions
    createWallet,
    importWallet,
    sendTransaction,
    refreshAll,

    // Utilities
    getPortfolioValue,
    formatAddress,
    getTransactionHistory,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
