"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { generateMnemonic, mnemonicToKeyPair, type KeyPair } from "@/lib/crypto"
import { sanCoinAPI } from "@/lib/api"
import { SecureWalletStorage } from "@/lib/wallet-storage"
import { TransactionSigner, type UnsignedTransaction } from "@/lib/transaction-signer"

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
  isLocked: boolean

  // Wallet actions
  createWallet: (password: string) => Promise<{ wallet: KeyPair; mnemonic: string }>
  importWallet: (mnemonic: string, password: string) => Promise<KeyPair>
    loginWithMnemonic: (mnemonic: string, password: string) => Promise<boolean>

  unlockWallet: (password: string) => Promise<boolean>
  lockWallet: () => void
  sendTransaction: (to: string, amount: number) => Promise<string>
  refreshAll: () => Promise<void>
  setWalletFromStorage: (wallet: KeyPair, mnemonic: string) => void

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
  const [isLocked, setIsLocked] = useState(true)

  // Initialize wallet from session or storage
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        console.log("🔄 Initializing wallet...")

        // Kiểm tra session trước
        const sessionWallet = SecureWalletStorage.getSessionWallet()
        if (sessionWallet) {
          console.log("✅ Found active session")
          setWallet(sessionWallet.wallet)
          setIsLocked(false)
          await loadWalletData(sessionWallet.wallet)
        } else {
          // Kiểm tra có wallet được lưu không
          const hasWallet = SecureWalletStorage.hasWallet()
          if (hasWallet) {
            console.log("🔒 Wallet found but locked")
            setIsLocked(true)
          } else {
            console.log("ℹ️ No wallet found")
            setIsLocked(false)
          }
        }
      } catch (error) {
        console.error("❌ Failed to initialize wallet:", error)
        setNetworkStatus("offline")
        setIsLocked(true)
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
      console.log("✅ Wallet data loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load wallet data:", error)
      setNetworkStatus("offline")
      setBalance(0)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Create new wallet với password
  const createWallet = useCallback(async (password: string): Promise<{ wallet: KeyPair; mnemonic: string }> => {
    console.log("🔨 Creating new wallet...")

    // Tạo mnemonic an toàn
    const mnemonic = generateMnemonic()
    console.log("🔐 Generated secure mnemonic phrase")

    // Tạo key pair từ mnemonic
    const keyPair = mnemonicToKeyPair(mnemonic)

    // Lưu với mã hóa
    SecureWalletStorage.saveWallet(keyPair, mnemonic, password)

    setWallet(keyPair)
    setIsLocked(false)
    await loadWalletData(keyPair)

    console.log("✅ Wallet created:", keyPair.address)
    return { wallet: keyPair, mnemonic }
  }, [])

  // Import wallet from mnemonic với password
  const importWallet = useCallback(async (mnemonic: string, password: string): Promise<KeyPair> => {
    console.log("📥 Importing wallet from mnemonic...")

    try {
      const keyPair = mnemonicToKeyPair(mnemonic)

      // Lưu với mã hóa
      SecureWalletStorage.saveWallet(keyPair, mnemonic, password)

      setWallet(keyPair)
      setIsLocked(false)
      await loadWalletData(keyPair)

      console.log("✅ Wallet imported:", keyPair.address)
      return keyPair
    } catch (error) {
      console.error("❌ Failed to import wallet:", error)
      throw new Error("Invalid mnemonic phrase. Please check and try again.")
    }
  }, [])

  // Unlock wallet với password
  const unlockWallet = useCallback(async (password: string): Promise<boolean> => {
    console.log("🔓 Unlocking wallet...")

    try {
      const walletData = SecureWalletStorage.unlockWallet(password)
      if (!walletData) {
        console.error("❌ Invalid password")
        return false
      }

      setWallet(walletData.wallet)
      setIsLocked(false)
      await loadWalletData(walletData.wallet)

      console.log("✅ Wallet unlocked successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to unlock wallet:", error)
      return false
    }
  }, [])

  // Lock wallet
  const lockWallet = useCallback(() => {
    console.log("🔒 Locking wallet...")
    SecureWalletStorage.clearSession()
    setWallet(null)
    setIsLocked(true)
    setBalance(0)
    setTransactions([])
    console.log("✅ Wallet locked")
  }, [])

  // Set wallet from storage (for unlock page)
  const setWalletFromStorage = useCallback((walletData: KeyPair, mnemonic: string) => {
    setWallet(walletData)
    setIsLocked(false)
    loadWalletData(walletData)
  }, [])

  // Send transaction với signing phía frontend
  const sendTransaction = useCallback(
    async (to: string, amount: number): Promise<string> => {
      if (!wallet) throw new Error("No wallet connected")

      setIsLoading(true)
      try {
        console.log(`💸 Preparing to send ${amount} SNC to ${to}`)

        // Tạo unsigned transaction
        const unsignedTx: UnsignedTransaction = {
          inputs: [
            {
              previousTxHash: "", // Backend sẽ tìm UTXO phù hợp
              outputIndex: 0,
              sequence: 0,
            },
          ],
          outputs: [
            {
              amount: amount,
              address: to,
              scriptPubKey: TransactionSigner.createScriptPubKey(to),
            },
          ],
          timestamp: Date.now(),
          type: "transfer",
          minerAddress: wallet.address,
        }

        // Sign transaction phía frontend
        const signedTx = TransactionSigner.signTransaction(unsignedTx, wallet.privateKey, wallet.publicKey)

        // Verify signature trước khi gửi
        if (!TransactionSigner.verifyTransactionSignature(signedTx)) {
          throw new Error("Transaction signature verification failed")
        }

        // Gửi signed transaction xuống backend
        const response = await sanCoinAPI.submitSignedTransaction(signedTx)

        // Add to local transactions
        const newTx: Transaction = {
          hash: response.hash || signedTx.hash,
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

        console.log("✅ Transaction sent:", response.hash)
        return response.hash || signedTx.hash
      } catch (error) {
        console.error("❌ Failed to send transaction:", error)
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

  // Get portfolio value
  const getPortfolioValue = useCallback(() => {
    const sncPrice = 125.5
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
      console.error("❌ Failed to get transaction history:", error)
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
    isLocked,

    // Actions
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    sendTransaction,
    refreshAll,
    setWalletFromStorage,

    // Utilities
    getPortfolioValue,
    formatAddress,
    getTransactionHistory,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
