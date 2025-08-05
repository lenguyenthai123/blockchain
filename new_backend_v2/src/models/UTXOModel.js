const { pool } = require("../database/config")

class UTXOModel {
  // Add UTXO to the set
  static async addUTXO(txHash, outputIndex, amount, address, scriptPubKey, blockHeight) {
    await pool.query(
      `INSERT INTO utxo_set (tx_hash, output_index, amount, address, script_pub_key, block_height, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
      [txHash, outputIndex, amount, address, scriptPubKey, blockHeight],
    )
  }

  // Remove UTXO from the set (when spent)
  static async removeUTXO(txHash, outputIndex) {
    await pool.query(`DELETE FROM utxo_set WHERE tx_hash = $1 AND output_index = $2`, [txHash, outputIndex])
  }

  // Get specific UTXO
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
      createdAt: utxo.created_at,
    }
  }

  // Get all UTXOs for an address
  static async getUTXOsByAddress(address) {
    const result = await pool.query(`SELECT * FROM utxo_set WHERE address = $1 ORDER BY amount DESC`, [address])

    return result.rows.map((utxo) => ({
      txHash: utxo.tx_hash,
      outputIndex: utxo.output_index,
      amount: Number.parseFloat(utxo.amount),
      address: utxo.address,
      scriptPubKey: utxo.script_pub_key,
      blockHeight: utxo.block_height,
      createdAt: utxo.created_at,
    }))
  }

  // Get address balance from UTXOs
  static async getAddressBalance(address) {
    const result = await pool.query(`SELECT COALESCE(SUM(amount), 0) as balance FROM utxo_set WHERE address = $1`, [
      address,
    ])

    const balance = Number.parseFloat(result.rows[0].balance) || 0

    // Update cache
    await this.updateAddressBalance(address, balance)

    return balance
  }

  // Update address balance cache
  static async updateAddressBalance(address, balance = null) {
    if (balance === null) {
      // Calculate balance if not provided
      const result = await pool.query(`SELECT COALESCE(SUM(amount), 0) as balance FROM utxo_set WHERE address = $1`, [
        address,
      ])
      balance = Number.parseFloat(result.rows[0].balance) || 0
    }

    await pool.query(
      `INSERT INTO address_balances (address, balance, last_updated)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (address)
       DO UPDATE SET balance = $2, last_updated = CURRENT_TIMESTAMP`,
      [address, balance],
    )

    return balance
  }

  // Get cached balance
  static async getCachedBalance(address) {
    const result = await pool.query(`SELECT balance FROM address_balances WHERE address = $1`, [address])

    if (result.rows.length === 0) {
      return await this.getAddressBalance(address)
    }

    return Number.parseFloat(result.rows[0].balance)
  }

  // Get total UTXO count
  static async getTotalUTXOCount() {
    const result = await pool.query("SELECT COUNT(*) as count FROM utxo_set")
    return Number.parseInt(result.rows[0].count)
  }

  // Get total value of all UTXOs - NEW METHOD
  static async getTotalValue() {
    const result = await pool.query("SELECT COALESCE(SUM(amount), 0) as total_value FROM utxo_set")
    return Number.parseFloat(result.rows[0].total_value) || 0
  }

  // Get largest UTXO - NEW METHOD
  static async getLargestUTXO() {
    const result = await pool.query("SELECT MAX(amount) as largest FROM utxo_set")
    return Number.parseFloat(result.rows[0].largest) || 0
  }

  // Get UTXO statistics
  static async getUTXOStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_utxos,
        COALESCE(SUM(amount), 0) as total_value,
        COALESCE(AVG(amount), 0) as average_value,
        COALESCE(MAX(amount), 0) as largest_utxo,
        COALESCE(MIN(amount), 0) as smallest_utxo
      FROM utxo_set
    `)

    const stats = result.rows[0]
    return {
      totalUTXOs: Number.parseInt(stats.total_utxos),
      totalValue: Number.parseFloat(stats.total_value),
      averageValue: Number.parseFloat(stats.average_value),
      largestUTXO: Number.parseFloat(stats.largest_utxo),
      smallestUTXO: Number.parseFloat(stats.smallest_utxo),
    }
  }

  // Get UTXOs by amount range
  static async getUTXOsByAmountRange(minAmount, maxAmount, limit = 100) {
    const result = await pool.query(
      `SELECT * FROM utxo_set 
       WHERE amount >= $1 AND amount <= $2 
       ORDER BY amount DESC 
       LIMIT $3`,
      [minAmount, maxAmount, limit],
    )

    return result.rows.map((utxo) => ({
      txHash: utxo.tx_hash,
      outputIndex: utxo.output_index,
      amount: Number.parseFloat(utxo.amount),
      address: utxo.address,
      scriptPubKey: utxo.script_pub_key,
      blockHeight: utxo.block_height,
      createdAt: utxo.created_at,
    }))
  }

  // Get addresses with most UTXOs
  static async getTopAddressesByUTXOCount(limit = 10) {
    const result = await pool.query(
      `SELECT address, COUNT(*) as utxo_count, SUM(amount) as total_balance
       FROM utxo_set 
       GROUP BY address 
       ORDER BY utxo_count DESC 
       LIMIT $1`,
      [limit],
    )

    return result.rows.map((row) => ({
      address: row.address,
      utxoCount: Number.parseInt(row.utxo_count),
      totalBalance: Number.parseFloat(row.total_balance),
    }))
  }
}

module.exports = UTXOModel
