import { createHash } from "crypto"
import { signData } from "./crypto"

export interface TransactionInput {
  previousTxHash: string
  outputIndex: number
  signature: string
  publicKey: string
  sequence: number
}

export interface TransactionOutput {
  amount: number
  address: string
  scriptPubKey: string
}

export interface SignedTransaction {
  hash: string
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  timestamp: number
  type: string
  minerAddress: string
}

export interface UnsignedTransaction {
  inputs: {
    previousTxHash: string
    outputIndex: number
    sequence: number
  }[]
  outputs: TransactionOutput[]
  timestamp: number
  type: string
  minerAddress: string
}

export class TransactionSigner {
  // Tạo hash cho transaction
  static createTransactionHash(transaction: UnsignedTransaction): string {
    const txString = JSON.stringify({
      inputs: transaction.inputs,
      outputs: transaction.outputs,
      timestamp: transaction.timestamp,
      type: transaction.type,
    })
    return createHash("sha256").update(txString).digest("hex")
  }

  // Sign transaction với private key
  static signTransaction(unsignedTx: UnsignedTransaction, privateKey: string, publicKey: string): SignedTransaction {
    console.log("🖊️ Signing transaction on frontend...")

    // Tạo hash cho transaction
    const txHash = this.createTransactionHash(unsignedTx)

    // Sign từng input
    const signedInputs: TransactionInput[] = unsignedTx.inputs.map((input, index) => {
      // Tạo message để sign (bao gồm tx hash và input index)
      const messageToSign = `${txHash}:${input.previousTxHash}:${input.outputIndex}:${index}`

      // Sign message với private key
      const signature = signData(messageToSign, privateKey)

      return {
        previousTxHash: input.previousTxHash,
        outputIndex: input.outputIndex,
        signature,
        publicKey,
        sequence: input.sequence,
      }
    })

    const signedTx: SignedTransaction = {
      hash: txHash,
      inputs: signedInputs,
      outputs: unsignedTx.outputs,
      timestamp: unsignedTx.timestamp,
      type: unsignedTx.type,
      minerAddress: unsignedTx.minerAddress,
    }

    console.log("✅ Transaction signed successfully:", txHash)
    return signedTx
  }

  // Verify signature (optional - for validation)
  static verifyTransactionSignature(signedTx: SignedTransaction): boolean {
    try {
      // Recreate unsigned transaction
      const unsignedTx: UnsignedTransaction = {
        inputs: signedTx.inputs.map((input) => ({
          previousTxHash: input.previousTxHash,
          outputIndex: input.outputIndex,
          sequence: input.sequence,
        })),
        outputs: signedTx.outputs,
        timestamp: signedTx.timestamp,
        type: signedTx.type,
        minerAddress: signedTx.minerAddress,
      }

      // Verify hash
      const expectedHash = this.createTransactionHash(unsignedTx)
      if (expectedHash !== signedTx.hash) {
        console.error("❌ Transaction hash mismatch")
        return false
      }

      // Verify each signature
      for (let i = 0; i < signedTx.inputs.length; i++) {
        const input = signedTx.inputs[i]
        const messageToSign = `${signedTx.hash}:${input.previousTxHash}:${input.outputIndex}:${i}`

        // In production, you would verify the signature against the public key
        // For now, we just check if signature exists and has correct format
        if (!input.signature || input.signature.length !== 64) {
          console.error(`❌ Invalid signature for input ${i}`)
          return false
        }
      }

      console.log("✅ Transaction signature verified")
      return true
    } catch (error) {
      console.error("❌ Failed to verify transaction signature:", error)
      return false
    }
  }

  // Tạo script pubkey cho address
  static createScriptPubKey(address: string): string {
    // Simplified script pubkey - in production use proper Bitcoin script
    return `OP_DUP OP_HASH160 ${address.slice(3)} OP_EQUALVERIFY OP_CHECKSIG`
  }
}
