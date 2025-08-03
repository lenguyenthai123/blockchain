import { randomBytes, pbkdf2Sync } from "crypto"

export interface EncryptedWallet {
  encryptedData: string
  iv: string
  salt: string
}

export interface WalletData {
  wallet: any
  mnemonic: string
  createdAt: number
}

// Generate cryptographically secure salt
export function generateSalt(): string {
  return randomBytes(32).toString("hex")
}

// Hash password with salt using PBKDF2
export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex")
}

// Derive encryption key from password
function deriveKey(password: string, salt: string): Buffer {
  return pbkdf2Sync(password, salt, 100000, 32, "sha256")
}

// Simple XOR encryption (for demo - use AES in production)
function xorEncrypt(data: string, key: Buffer): string {
  const dataBuffer = Buffer.from(data, "utf8")
  const encrypted = Buffer.alloc(dataBuffer.length)

  for (let i = 0; i < dataBuffer.length; i++) {
    encrypted[i] = dataBuffer[i] ^ key[i % key.length]
  }

  return encrypted.toString("base64")
}

// Simple XOR decryption
function xorDecrypt(encryptedData: string, key: Buffer): string {
  const encrypted = Buffer.from(encryptedData, "base64")
  const decrypted = Buffer.alloc(encrypted.length)

  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ key[i % key.length]
  }

  return decrypted.toString("utf8")
}

// Encrypt wallet data
export function encryptWalletData(walletData: WalletData, password: string): EncryptedWallet {
  const salt = generateSalt()
  const iv = randomBytes(16).toString("hex")
  const key = deriveKey(password, salt)

  const dataString = JSON.stringify(walletData)
  const encryptedData = xorEncrypt(dataString, key)

  return {
    encryptedData,
    iv,
    salt,
  }
}

// Decrypt wallet data
export function decryptWalletData(encryptedWallet: EncryptedWallet, password: string): WalletData {
  const key = deriveKey(password, encryptedWallet.salt)
  const decryptedString = xorDecrypt(encryptedWallet.encryptedData, key)

  try {
    return JSON.parse(decryptedString)
  } catch (error) {
    throw new Error("Invalid password or corrupted data")
  }
}

// Validate password strength - FIX: Export this function
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  score: number
} {
  const errors: string[] = []
  let score = 0

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  } else {
    score += 1
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character")
  } else {
    score += 1
  }

  return {
    isValid: errors.length === 0,
    errors,
    score,
  }
}

// Alias for backward compatibility
export const validatePasswordStrength = validatePassword

// Generate secure password
export function generateSecurePassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  const allChars = lowercase + uppercase + numbers + symbols
  let password = ""

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
