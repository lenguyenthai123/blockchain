const { pool } = require("../database/config")

class UTXOModel {
  // Add UTXO to the set
  static async addUTXO(txHash, outputIndex, amount, address, scriptPubKey, blockHeight) {
    await pool.query(
      `INSERT INTO utxo_set (tx_hash, output_index, amount, address, script_pub_key, block_height)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (tx_hash, output_index) DO NOTHING`,
      [txHash, outputIndex, amount, address, scriptPubKey, blockHeight],
    )
  }

  // Remove UTXO from the set (when spent)
  static async removeUTXO(txHash, outputIndex) {
    await pool.query(`DELETE FROM utxo_set WHERE tx_hash = $1 AND output_index = $2`, [txHash, outputIndex])
  }

  // Get UTXO by transaction hash and output index
  static async getUTXO(txHash, outputIndex) {
    const result = await pool.query(`SELECT * FROM utxo_set WHERE tx_hash = $1 AND output_index = $2`, [
      txHash,
      outputIndex,
    ])

    if (result.rows.length === 0) return null

    const utxo = result.rows[0]
    return {
      txHash: utxo.tx_hash,
      outputIndex: utxo.output_index,
      amount: Number.parseFloat(utxo.amount),
      address: utxo.address,
      scriptPubKey: utxo.script_pub_key,
      blockHeight: utxo.block_height,
    }
  }

  // Get all UTXOs for an address
  static async getUTXOsByAddress(address) {
    const result = await pool.query(`SELECT * FROM utxo_set WHERE address = $1 ORDER BY block_height DESC`, [address])

    return result.rows.map((utxo) => ({
      txHash: utxo.tx_hash,
      outputIndex: utxo.output_index,
      amount: Number.parseFloat(utxo.amount),
      address: utxo.address,
      scriptPubKey: utxo.script_pub_key,
      blockHeight: utxo.block_height,
    }))
  }

  // Calculate balance for an address
  static async getAddressBalance(address) {
    const result = await pool.query(`SELECT COALESCE(SUM(amount), 0) as balance FROM utxo_set WHERE address = $1`, [
      address,
    ])

    return Number.parseFloat(result.rows[0].balance)
  }

  // Get UTXOs for transaction creation (with minimum amount)
  static async selectUTXOsForAmount(address, targetAmount) {
    const result = await pool.query(
      `SELECT * FROM utxo_set 
       WHERE address = $1 
       ORDER BY amount DESC`,
      [address],
    )

    const utxos = result.rows.map((utxo) => ({
      txHash: utxo.tx_hash,
      outputIndex: utxo.output_index,
      amount: Number.parseFloat(utxo.amount),
      address: utxo.address,
      scriptPubKey: utxo.script_pub_key,
      blockHeight: utxo.block_height,
    }))

    // Simple UTXO selection algorithm (largest first)
    const selectedUTXOs = []
    let totalAmount = 0

    for (const utxo of utxos) {
      selectedUTXOs.push(utxo)
      totalAmount += utxo.amount

      if (totalAmount >= targetAmount) {
        break
      }
    }

    if (totalAmount < targetAmount) {
      throw new Error("Insufficient funds")
    }

    return { selectedUTXOs, totalAmount }
  }

  // Update address balance cache
  static async updateAddressBalance(address) {
    const balance = await this.getAddressBalance(address)
    const utxoCount = await pool.query(`SELECT COUNT(*) as count FROM utxo_set WHERE address = $1`, [address])

    await pool.query(
      `INSERT INTO address_balances (address, balance, utxo_count, last_updated)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (address)
       DO UPDATE SET balance = $2, utxo_count = $3, last_updated = CURRENT_TIMESTAMP`,
      [address, balance, Number.parseInt(utxoCount.rows[0].count)],
    )

    return balance
  }

  // Get total UTXO count
  static async getTotalUTXOCount() {
    const result = await pool.query("SELECT COUNT(*) as count FROM utxo_set")
    return Number.parseInt(result.rows[0].count)
  }
}

module.exports = UTXOModel
