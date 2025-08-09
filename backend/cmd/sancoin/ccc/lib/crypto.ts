"use client"

export interface UTXOInput {
  previousTxHash: string
  outputIndex: number
  signature: string
  publicKey: string
}

export interface UTXOOutput {
  amount: number
  address: string
  scriptPubKey: string
}

export class SanCoinWallet {
  private privateKey: string
  public publicKey: string
  public address: string

  constructor(privateKey?: string) {
    if (privateKey) {
      this.privateKey = privateKey
    } else {
      // Generate new private key (simplified)
      this.privateKey = this.generateRandomHex(64)
    }

    // Generate public key (simplified)
    this.publicKey = this.generatePublicKey(this.privateKey)

    // Generate address
    this.address = "san1" + this.publicKey.slice(0, 32)
  }

  private generateRandomHex(length: number): string {
    const array = new Uint8Array(length / 2)
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(array)
    } else {
      // Fallback for server-side
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  private generatePublicKey(privateKey: string): string {
    // Simplified public key generation
    return this.sha256(privateKey + "publickey")
  }

  private sha256(message: string): string {
    // Simplified hash function
    let hash = 0
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(64, "0")
  }

  // Create UTXO transaction
  createUTXOTransaction(
    utxos: any[],
    toAddress: string,
    amount: number,
  ): {
    hash: string
    inputs: UTXOInput[]
    outputs: UTXOOutput[]
    timestamp: number
    type: string
  } {
    // Select UTXOs
    let totalInput = 0
    const selectedUTXOs = []

    for (const utxo of utxos) {
      selectedUTXOs.push(utxo)
      totalInput += utxo.amount
      if (totalInput >= amount + 0.001) break // Include fee
    }

    if (totalInput < amount + 0.001) {
      throw new Error("Insufficient funds")
    }

    // Create inputs
    const inputs: UTXOInput[] = selectedUTXOs.map((utxo) => ({
      previousTxHash: utxo.txHash,
      outputIndex: utxo.outputIndex,
      signature: this.signInput(utxo.txHash, utxo.outputIndex),
      publicKey: this.publicKey,
    }))

    // Create outputs
    const outputs: UTXOOutput[] = []

    // Output to recipient
    outputs.push({
      amount: amount,
      address: toAddress,
      scriptPubKey: `OP_DUP OP_HASH160 ${toAddress} OP_EQUALVERIFY OP_CHECKSIG`,
    })

    // Change output
    const fee = 0.001
    const change = totalInput - amount - fee
    if (change > 0) {
      outputs.push({
        amount: change,
        address: this.address,
        scriptPubKey: `OP_DUP OP_HASH160 ${this.address} OP_EQUALVERIFY OP_CHECKSIG`,
      })
    }

    const timestamp = Date.now()
    const hash = this.calculateTransactionHash(inputs, outputs, timestamp)

    return {
      hash,
      inputs,
      outputs,
      timestamp,
      type: "transfer",
    }
  }

  private signInput(txHash: string, outputIndex: number): string {
    const message = txHash + outputIndex + this.address
    return this.sha256(message + this.privateKey)
  }

  private calculateTransactionHash(inputs: UTXOInput[], outputs: UTXOOutput[], timestamp: number): string {
    const inputsStr = JSON.stringify(
      inputs.map((i) => ({ previousTxHash: i.previousTxHash, outputIndex: i.outputIndex })),
    )
    const outputsStr = JSON.stringify(outputs)
    return this.sha256(inputsStr + outputsStr + timestamp)
  }

  signTransaction(fromAddress: string, toAddress: string, amount: number, timestamp: number = Date.now()) {
    const message = fromAddress + toAddress + amount + timestamp
    const signature = this.sha256(message + this.privateKey)

    return {
      fromAddress,
      toAddress,
      amount,
      timestamp,
      signature,
    }
  }

  static fromMnemonic(mnemonic: string): SanCoinWallet {
    const seed = Array.from(mnemonic).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const privateKey = seed.toString(16).padStart(64, "0")
    return new SanCoinWallet(privateKey)
  }

  getPrivateKeyHex(): string {
    return this.privateKey
  }

  getPublicKeyHex(): string {
    return this.publicKey
  }
}
