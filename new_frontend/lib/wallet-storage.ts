import { encryptWalletData, decryptWalletData, hashPassword, generateSalt, type EncryptedWallet } from "./security"
import type { KeyPair } from "./crypto"

export interface WalletStorage {
  encryptedWallet: EncryptedWallet
  passwordHash: string
  passwordSalt: string
  createdAt: number
  lastAccess: number
  version: string
}

export interface WalletSession {
  wallet: KeyPair
  mnemonic: string
  unlockTime: number
  sessionTimeout: number
}

const STORAGE_KEY = "sanwallet_secure_storage"
const SESSION_KEY = "sanwallet_session"
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export class SecureWalletStorage {
  // Lưu wallet với mã hóa
  static saveWallet(wallet: KeyPair, mnemonic: string, password: string): void {
    try {
      console.log("🔐 Encrypting and saving wallet...")

      const walletData = {
        wallet,
        mnemonic,
        createdAt: Date.now(),
      }

      // Mã hóa wallet data
      const encryptedWallet = encryptWalletData(walletData, password)

      // Tạo hash của password để verify sau này
      const passwordSalt = generateSalt()
      const passwordHash = hashPassword(password, passwordSalt)

      const storage: WalletStorage = {
        encryptedWallet,
        passwordHash,
        passwordSalt,
        createdAt: Date.now(),
        lastAccess: Date.now(),
        version: "1.0.0",
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
      console.log("✅ Wallet encrypted and saved successfully")
    } catch (error) {
      console.error("❌ Failed to save wallet:", error)
      throw new Error("Failed to save wallet securely")
    }
  }

  // Kiểm tra xem có wallet được lưu không
  static hasWallet(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null
  }

  // Verify password
  static verifyPassword(password: string): boolean {
    try {
      const storageData = localStorage.getItem(STORAGE_KEY)
      if (!storageData) return false

      const storage: WalletStorage = JSON.parse(storageData)
      const computedHash = hashPassword(password, storage.passwordSalt)

      return computedHash === storage.passwordHash
    } catch (error) {
      console.error("❌ Failed to verify password:", error)
      return false
    }
  }

  // Unlock wallet với password
  static unlockWallet(password: string): { wallet: KeyPair; mnemonic: string } | null {
    try {
      console.log("🔓 Unlocking wallet...")

      const storageData = localStorage.getItem(STORAGE_KEY)
      if (!storageData) {
        throw new Error("No wallet found")
      }

      const storage: WalletStorage = JSON.parse(storageData)

      // Verify password
      if (!this.verifyPassword(password)) {
        throw new Error("Invalid password")
      }

      // Giải mã wallet data
      const decryptedData = decryptWalletData(storage.encryptedWallet, password)

      // Update last access
      storage.lastAccess = Date.now()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))

      // Tạo session
      const session: WalletSession = {
        wallet: decryptedData.wallet,
        mnemonic: decryptedData.mnemonic,
        unlockTime: Date.now(),
        sessionTimeout: SESSION_TIMEOUT,
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))

      console.log("✅ Wallet unlocked successfully")
      return {
        wallet: decryptedData.wallet,
        mnemonic: decryptedData.mnemonic,
      }
    } catch (error) {
      console.error("❌ Failed to unlock wallet:", error)
      return null
    }
  }

  // Lấy wallet từ session (nếu chưa timeout)
  static getSessionWallet(): { wallet: KeyPair; mnemonic: string } | null {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY)
      if (!sessionData) return null

      const session: WalletSession = JSON.parse(sessionData)

      // Kiểm tra timeout
      if (Date.now() - session.unlockTime > session.sessionTimeout) {
        this.clearSession()
        return null
      }

      return {
        wallet: session.wallet,
        mnemonic: session.mnemonic,
      }
    } catch (error) {
      console.error("❌ Failed to get session wallet:", error)
      return null
    }
  }

  // Xóa session
  static clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY)
    console.log("🧹 Session cleared")
  }

  // Đổi password
  static changePassword(oldPassword: string, newPassword: string): boolean {
    try {
      console.log("🔄 Changing password...")

      // Unlock với password cũ
      const walletData = this.unlockWallet(oldPassword)
      if (!walletData) {
        throw new Error("Invalid old password")
      }

      // Lưu lại với password mới
      this.saveWallet(walletData.wallet, walletData.mnemonic, newPassword)

      console.log("✅ Password changed successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to change password:", error)
      return false
    }
  }

  // Xóa wallet (khi quên password)
  static deleteWallet(): void {
    try {
      console.log("🗑️ Deleting wallet...")

      localStorage.removeItem(STORAGE_KEY)
      this.clearSession()

      // Xóa các dữ liệu khác
      localStorage.removeItem("sanwallet_wallet")
      localStorage.removeItem("sanwallet_mnemonic")

      console.log("✅ Wallet deleted successfully")
    } catch (error) {
      console.error("❌ Failed to delete wallet:", error)
    }
  }

  // Export wallet (cần password)
  static exportWallet(password: string): string | null {
    try {
      const walletData = this.unlockWallet(password)
      if (!walletData) return null

      const exportData = {
        wallet: walletData.wallet,
        mnemonic: walletData.mnemonic,
        exportedAt: Date.now(),
        version: "1.0.0",
      }

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error("❌ Failed to export wallet:", error)
      return null
    }
  }

  // Get wallet info (không cần password)
  static getWalletInfo(): { createdAt: number; lastAccess: number; hasWallet: boolean } {
    try {
      const storageData = localStorage.getItem(STORAGE_KEY)
      if (!storageData) {
        return { createdAt: 0, lastAccess: 0, hasWallet: false }
      }

      const storage: WalletStorage = JSON.parse(storageData)
      return {
        createdAt: storage.createdAt,
        lastAccess: storage.lastAccess,
        hasWallet: true,
      }
    } catch (error) {
      return { createdAt: 0, lastAccess: 0, hasWallet: false }
    }
  }
}
