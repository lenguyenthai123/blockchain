import { apiClient } from "./api"

export function generateRandomBytes(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export async function generateWallet(password: string) {
  try {
    return await apiClient.createWallet(password)
  } catch (error) {
    console.error("Failed to create wallet:", error)
    throw error
  }
}

export async function importWalletFromPrivateKey(privateKey: string, password: string) {
  try {
    return await apiClient.importWalletFromPrivateKey(privateKey, password)
  } catch (error) {
    console.error("Failed to import wallet from private key:", error)
    throw error
  }
}

export async function importWalletFromMnemonic(mnemonic: string, password: string) {
  try {
    return await apiClient.importWalletFromMnemonic(mnemonic, password)
  } catch (error) {
    console.error("Failed to import wallet from mnemonic:", error)
    throw error
  }
}
