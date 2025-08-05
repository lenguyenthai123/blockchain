const crypto = require("crypto")
const sha256 = require("sha256")

class Block {
  constructor(index, timestamp, transactions, previousHash, nonce = 0) {
    this.index = index
    this.timestamp = timestamp
    this.transactions = transactions
    this.previousHash = previousHash
    this.nonce = nonce
    this.hash = this.calculateHash()
    this.merkleRoot = this.calculateMerkleRoot()
  }

  calculateHash() {
    return sha256(this.index + this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce)
  }

  calculateMerkleRoot() {
    if (this.transactions.length === 0) return ""

    let hashes = this.transactions.map((tx) => tx.hash)

    while (hashes.length > 1) {
      const newHashes = []
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i]
        const right = hashes[i + 1] || left
        newHashes.push(sha256(left + right))
      }
      hashes = newHashes
    }

    return hashes[0]
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join("0")

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log(`Block mined: ${this.hash}`)
  }

  hasValidTransactions() {
    return this.transactions.every((tx) => tx.isValid())
  }

  toJSON() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions.map((tx) => tx.toJSON()),
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce,
      merkleRoot: this.merkleRoot,
    }
  }
}

module.exports = Block
