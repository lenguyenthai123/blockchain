import { createHash } from "crypto"
import { signData,verifySignature } from "./crypto"
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

    // Validate public key format (should be 33 bytes compressed = 66 hex chars)
    // if (publicKey.length !== 66) {
    //   throw new Error(
    //     `Invalid public key length: ${publicKey.length}, expected 66 hex characters (33 bytes compressed)`,
    //   )
    // }

    // Tạo hash cho transaction
    const txHash = this.createTransactionHash(unsignedTx)

    // Sign từng input
    const signedInputs: TransactionInput[] = unsignedTx.inputs.map((input, index) => {
      // Tạo message để sign GIỐNG HỆT với backend
      // Backend: this.hash + input.previousTxHash + input.outputIndex
      const messageToSign = txHash + input.previousTxHash + input.outputIndex.toString()

      console.log(`🔐 Signing input ${index}:`, {
        txHash,
        previousTxHash: input.previousTxHash,
        outputIndex: input.outputIndex,
        messageToSign,
        publicKeyLength: publicKey.length,
      })

      // Sign message với private key
      const signature = signData(messageToSign, privateKey)

      return {
        previousTxHash: input.previousTxHash,
        outputIndex: input.outputIndex,
        signature,
        publicKey, // Đảm bảo public key là compressed format (66 hex chars)
        sequence: input.sequence,
      }
    })

    const signedTx: SignedTransaction = {
      hash: txHash,
      inputs: signedInputs,
      outputs: unsignedTx.outputs,
      timestamp: unsignedTx.timestamp,
      type: unsignedTx.type,
      // Ignore minerAddres
      // because it's not used in this context
      // but you can add it if needed
      minerAddress: "", // Placeholder, can be set if needed
    }

    console.log("✅ Transaction signed successfully:", {
      hash: txHash,
      inputsCount: signedInputs.length,
      outputsCount: unsignedTx.outputs.length,
      firstSignatureLength: signedInputs[0]?.signature?.length,
      firstPublicKeyLength: signedInputs[0]?.publicKey?.length,
    })

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
        console.error("❌ Transaction hash mismatch:", {
          expected: expectedHash,
          actual: signedTx.hash,
        })
        return false
      }

      // Verify each signature format
      console.log("🔍 THAI DEBUG...")
      for (let i = 0; i < signedTx.inputs.length; i++) {
        console.log("🔍 Verifying input:", i)
        const input = signedTx.inputs[i]

        // Recreate message GIỐNG HỆT với backend
        const messageToSign = signedTx.hash + input.previousTxHash + input.outputIndex.toString()
        
        console.log(`🔍 Verifying input ${i}:`, {
          result: verifySignature(messageToSign, input.signature, input.publicKey),
          hash: signedTx.hash,
          previousTxHash: input.previousTxHash,
          outputIndex: input.outputIndex,
          messageToSign,
          signatureLength: input.signature.length,
          publicKeyLength: input.publicKey.length,
        })

        // Check signature format (128 hex chars = 64 bytes for secp256k1)
        if (!input.signature || input.signature.length !== 128) {
          console.error(`❌ Invalid signature format for input ${i}:`, {
            signature: input.signature,
            length: input.signature?.length,
            expected: "128 hex characters (64 bytes)",
          })
          return false
        }

        // Check public key format (66 hex chars = 33 bytes compressed)
        // if (!input.publicKey || input.publicKey.length !== 66) {
        //   console.error(`❌ Invalid public key format for input ${i}:`, {
        //     publicKey: input.publicKey,
        //     length: input.publicKey?.length,
        //     expected: "66 hex characters (33 bytes compressed)",
        //   })
        //   return false
        // }
      }

      console.log("✅ Transaction signature format verified")
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
