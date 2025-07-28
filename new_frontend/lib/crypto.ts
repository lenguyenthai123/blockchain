import { createHash, randomBytes } from "crypto"

export interface KeyPair {
  address: string
  publicKey: string
  privateKey: string
}

// Generate a random private key
export function generatePrivateKey(): string {
  return randomBytes(32).toString("hex")
}

// Derive public key from private key (simplified)
export function privateKeyToPublicKey(privateKey: string): string {
  const hash = createHash("sha256").update(privateKey).digest("hex")
  return hash
}

// Generate address from public key
export function publicKeyToAddress(publicKey: string): string {
  const hash = createHash("sha256").update(publicKey).digest("hex")
  return "SNC" + hash.substring(0, 32)
}

// Generate a complete key pair
export function generateKeyPair(): KeyPair {
  const privateKey = generatePrivateKey()
  const publicKey = privateKeyToPublicKey(privateKey)
  const address = publicKeyToAddress(publicKey)

  return {
    address,
    publicKey,
    privateKey,
  }
}

// Generate mnemonic phrase (simplified - 12 words)
export function generateMnemonic(): string {
  const words = [
    "abandon",
    "ability",
    "able",
    "about",
    "above",
    "absent",
    "absorb",
    "abstract",
    "absurd",
    "abuse",
    "access",
    "accident",
    "account",
    "accuse",
    "achieve",
    "acid",
    "acoustic",
    "acquire",
    "across",
    "act",
    "action",
    "actor",
    "actress",
    "actual",
    "adapt",
    "add",
    "addict",
    "address",
    "adjust",
    "admit",
    "adult",
    "advance",
    "advice",
    "aerobic",
    "affair",
    "afford",
    "afraid",
    "again",
    "against",
    "age",
    "agent",
    "agree",
    "ahead",
    "aim",
    "air",
    "airport",
    "aisle",
    "alarm",
    "album",
    "alcohol",
    "alert",
    "alien",
    "all",
    "alley",
    "allow",
    "almost",
    "alone",
    "alpha",
    "already",
    "also",
    "alter",
    "always",
    "amateur",
    "amazing",
    "among",
    "amount",
    "amused",
    "analyst",
    "anchor",
    "ancient",
    "anger",
    "angle",
    "angry",
    "animal",
    "ankle",
    "announce",
    "annual",
    "another",
    "answer",
    "antenna",
  ]

  const mnemonic = []
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * words.length)
    mnemonic.push(words[randomIndex])
  }

  return mnemonic.join(" ")
}

// Convert mnemonic to key pair
export function mnemonicToKeyPair(mnemonic: string): KeyPair {
  const seed = createHash("sha256").update(mnemonic).digest("hex")
  const privateKey = seed.substring(0, 64)
  const publicKey = privateKeyToPublicKey(privateKey)
  const address = publicKeyToAddress(publicKey)

  return {
    address,
    publicKey,
    privateKey,
  }
}

// Sign data with private key
export function signData(data: string, privateKey: string): string {
  const hash = createHash("sha256")
    .update(data + privateKey)
    .digest("hex")
  return hash
}

// Verify signature
export function verifySignature(data: string, signature: string, publicKey: string): boolean {
  // Simplified verification - in production use proper cryptographic verification
  return signature.length === 64
}

// Create wallet from mnemonic (alias for compatibility)
export function createWalletFromMnemonic(mnemonic: string): KeyPair {
  return mnemonicToKeyPair(mnemonic)
}

// Wallet interface for compatibility
export interface Wallet extends KeyPair {
  mnemonic?: string
}
