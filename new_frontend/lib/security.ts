import { createHash, randomBytes, pbkdf2Sync } from "crypto"

export interface EncryptedWallet {
  encryptedData: string
  salt: string
  iv: string
  iterations: number
}

export interface SecurityConfig {
  minPasswordLength: number
  iterations: number
  keyLength: number
}

const SECURITY_CONFIG: SecurityConfig = {
  minPasswordLength: 8,
  iterations: 100000, // PBKDF2 iterations
  keyLength: 32, // 256-bit key
}

// Tạo salt ngẫu nhiên
export function generateSalt(): string {
  return randomBytes(32).toString("hex")
}

// Tạo IV (Initialization Vector) ngẫu nhiên
export function generateIV(): string {
  return randomBytes(16).toString("hex")
}

// Derive key từ password sử dụng PBKDF2
export function deriveKey(password: string, salt: string, iterations: number = SECURITY_CONFIG.iterations): Buffer {
  return pbkdf2Sync(password, salt, iterations, SECURITY_CONFIG.keyLength, "sha256")
}

// Mã hóa dữ liệu wallet
export function encryptWalletData(walletData: any, password: string): EncryptedWallet {
  const salt = generateSalt()
  const iv = generateIV()
  const key = deriveKey(password, salt)

  // Chuyển wallet data thành JSON string
  const dataString = JSON.stringify(walletData)

  // Simple XOR encryption (trong production nên dùng AES)
  const encrypted = Buffer.from(dataString)
    .map((byte, index) => byte ^ key[index % key.length])
    .toString("hex")

  return {
    encryptedData: encrypted,
    salt,
    iv,
    iterations: SECURITY_CONFIG.iterations,
  }
}

// Giải mã dữ liệu wallet
export function decryptWalletData(encryptedWallet: EncryptedWallet, password: string): any {
  const { encryptedData, salt, iterations } = encryptedWallet
  const key = deriveKey(password, salt, iterations)

  try {
    // Giải mã XOR
    const decryptedBuffer = Buffer.from(encryptedData, "hex").map((byte, index) => byte ^ key[index % key.length])

    const decryptedString = decryptedBuffer.toString("utf8")
    return JSON.parse(decryptedString)
  } catch (error) {
    throw new Error("Invalid password or corrupted data")
  }
}

// Tạo hash của password để verify
export function hashPassword(password: string, salt: string): string {
  return createHash("sha256")
    .update(password + salt)
    .digest("hex")
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = hashPassword(password, salt)
  return computedHash === hash
}

// Validate password strength
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < SECURITY_CONFIG.minPasswordLength) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.minPasswordLength} characters long`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Generate secure password
export function generateSecurePassword(length = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const symbols = '!@#$%^&*(),.?":{}|<>'
  const allChars = uppercase + lowercase + numbers + symbols

  let password = ""

  // Đảm bảo có ít nhất 1 ký tự từ mỗi loại
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

// Clear sensitive data from memory
export function clearSensitiveData(obj: any): void {
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = "0".repeat(obj[key].length)
      } else if (typeof obj[key] === "object") {
        clearSensitiveData(obj[key])
      }
    }
  }
}
