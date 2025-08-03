import {
  encryptWalletData,
  decryptWalletData,
  hashPassword,
  generateSalt,
  type WalletData,
  type EncryptedWallet,
} from "./security"
import type { KeyPair } from "./crypto"

const STORAGE_KEYS = {
  WALLET: "sanwallet_encrypted_wallet",
  PASSWORD_HASH: "sanwallet_password_hash",
  SALT: "sanwallet_salt",
  SESSION: "sanwallet_session",
  WALLET_INFO: "sanwallet_info",
}

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export interface WalletInfo {
  hasWallet: boolean
  createdAt: number
  lastAccess: number
  address?: string
}

export interface SessionData {
  wallet: KeyPair
  mnemonic: string
  timestamp: number
}

export class SecureWalletStorage {
  // Save encrypted wallet to localStorage
  static saveWallet(wallet: KeyPair, mnemonic: string, password: string): void {
    try {
      console.log("💾 Saving encrypted wallet to storage...")

      const walletData: WalletData = {
        wallet,
        mnemonic,
        createdAt: Date.now(),
      }

      // Generate salt for password hashing
      const salt = generateSalt()

      // Hash password for verification
      const passwordHash = hashPassword(password, salt)

      // Encrypt wallet data
      const encryptedWallet = encryptWalletData(walletData, password)

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(encryptedWallet))
      localStorage.setItem(STORAGE_KEYS.PASSWORD_HASH, passwordHash)
      localStorage.setItem(STORAGE_KEYS.SALT, salt)

      // Save wallet info
      const walletInfo: WalletInfo = {
        hasWallet: true,
        createdAt: Date.now(),
        lastAccess: Date.now(),
        address: wallet.address,
      }
      localStorage.setItem(STORAGE_KEYS.WALLET_INFO, JSON.stringify(walletInfo))

      // Create session
      this.createSession(wallet, mnemonic)

      console.log("✅ Wallet saved and encrypted successfully")
    } catch (error) {
      console.error("❌ Failed to save wallet:", error)
      throw new Error("Failed to save wallet securely")
    }
  }

  // Unlock wallet with password
  static unlockWallet(password: string): WalletData | null {
    try {
      console.log("🔓 Attempting to unlock wallet...")

      // Get stored data
      const encryptedWalletStr = localStorage.getItem(STORAGE_KEYS.WALLET)
      const storedPasswordHash = localStorage.getItem(STORAGE_KEYS.PASSWORD_HASH)
      const salt = localStorage.getItem(STORAGE_KEYS.SALT)

      if (!encryptedWalletStr || !storedPasswordHash || !salt) {
        console.error("❌ Wallet data not found")
        return null
      }

      // Verify password
      const passwordHash = hashPassword(password, salt)
      if (passwordHash !== storedPasswordHash) {
        console.error("❌ Invalid password")
        return null
      }

      // Decrypt wallet
      const encryptedWallet: EncryptedWallet = JSON.parse(encryptedWalletStr)
      const walletData = decryptWalletData(encryptedWallet, password)

      // Update last access time
      this.updateLastAccess()

      // Create session
      this.createSession(walletData.wallet, walletData.mnemonic)

      console.log("✅ Wallet unlocked successfully")
      return walletData
    } catch (error) {
      console.error("❌ Failed to unlock wallet:", error)
      return null
    }
  }

  // Create session for unlocked wallet
  static createSession(wallet: KeyPair, mnemonic: string): void {
    const sessionData: SessionData = {
      wallet,
      mnemonic,
      timestamp: Date.now(),
    }

    sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData))
    console.log("🔑 Session created")
  }

  // Get session wallet (if not expired)
  static getSessionWallet(): SessionData | null {
    try {
      const sessionStr = sessionStorage.getItem(STORAGE_KEYS.SESSION)
      if (!sessionStr) return null

      const sessionData: SessionData = JSON.parse(sessionStr)

      // Check if session expired
      if (Date.now() - sessionData.timestamp > SESSION_TIMEOUT) {
        console.log("⏰ Session expired")
        this.clearSession()
        return null
      }

      return sessionData
    } catch (error) {
      console.error("❌ Failed to get session:", error)
      return null
    }
  }

  // Clear session
  static clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION)
    console.log("🗑️ Session cleared")
  }

  // Check if wallet exists
  static hasWallet(): boolean {
    return localStorage.getItem(STORAGE_KEYS.WALLET) !== null
  }

  // Get wallet info
  static getWalletInfo(): WalletInfo {
    try {
      const infoStr = localStorage.getItem(STORAGE_KEYS.WALLET_INFO)
      if (!infoStr) {
        return {
          hasWallet: false,
          createdAt: 0,
          lastAccess: 0,
        }
      }

      return JSON.parse(infoStr)
    } catch (error) {
      console.error("❌ Failed to get wallet info:", error)
      return {
        hasWallet: false,
        createdAt: 0,
        lastAccess: 0,
      }
    }
  }

  // Update last access time
  static updateLastAccess(): void {
    try {
      const walletInfo = this.getWalletInfo()
      if (walletInfo.hasWallet) {
        walletInfo.lastAccess = Date.now()
        localStorage.setItem(STORAGE_KEYS.WALLET_INFO, JSON.stringify(walletInfo))
      }
    } catch (error) {
      console.error("❌ Failed to update last access:", error)
    }
  }

  // Delete wallet (for forgot password)
  static deleteWallet(): void {
    try {
      console.log("🗑️ Deleting wallet data...")

      // Remove all wallet data
      localStorage.removeItem(STORAGE_KEYS.WALLET)
      localStorage.removeItem(STORAGE_KEYS.PASSWORD_HASH)
      localStorage.removeItem(STORAGE_KEYS.SALT)
      localStorage.removeItem(STORAGE_KEYS.WALLET_INFO)

      // Clear session
      this.clearSession()

      console.log("✅ Wallet deleted successfully")
    } catch (error) {
      console.error("❌ Failed to delete wallet:", error)
      throw new Error("Failed to delete wallet")
    }
  }

  // Export wallet (for backup)
  static exportWallet(password: string): string | null {
    try {
      const walletData = this.unlockWallet(password)
      if (!walletData) return null

      return JSON.stringify({
        wallet: walletData.wallet,
        mnemonic: walletData.mnemonic,
        createdAt: walletData.createdAt,
        exportedAt: Date.now(),
      })
    } catch (error) {
      console.error("❌ Failed to export wallet:", error)
      return null
    }
  }

  // Import wallet from backup
  static importWallet(backupData: string, newPassword: string): boolean {
    try {
      const data = JSON.parse(backupData)

      if (!data.wallet || !data.mnemonic) {
        throw new Error("Invalid backup data")
      }

      this.saveWallet(data.wallet, data.mnemonic, newPassword)
      return true
    } catch (error) {
      console.error("❌ Failed to import wallet:", error)
      return false
    }
  }

  // Change password
  static changePassword(oldPassword: string, newPassword: string): boolean {
    try {
      console.log("🔄 Changing wallet password...")

      // Unlock with old password
      const walletData = this.unlockWallet(oldPassword)
      if (!walletData) {
        console.error("❌ Invalid old password")
        return false
      }

      // Save with new password
      this.saveWallet(walletData.wallet, walletData.mnemonic, newPassword)

      console.log("✅ Password changed successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to change password:", error)
      return false
    }
  }
}
