const { pool } = require("../database/config")

class BlockModel {
  static async create(blockData) {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Insert block
      const blockResult = await client.query(
        `INSERT INTO blocks (block_index, hash, previous_hash, merkle_root, timestamp, nonce, difficulty)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          blockData.index,
          blockData.hash,
          blockData.previousHash,
          blockData.merkleRoot,
          blockData.timestamp,
          blockData.nonce,
          blockData.difficulty,
        ],
      )

      const blockId = blockResult.rows[0].id

      // Insert transactions
      for (const tx of blockData.transactions) {
        await client.query(
          `INSERT INTO transactions (hash, block_id, timestamp, tx_type)
           VALUES ($1, $2, $3, $4)`,
          [tx.hash, blockId, tx.timestamp, tx.type || "transfer"],
        )

        // Remove from mempool if exists
        await client.query("DELETE FROM mempool_transactions WHERE hash = $1", [tx.hash])
      }

      await client.query("COMMIT")
      return blockId
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  static async getByIndex(index) {
    const result = await pool.query(
      `SELECT b.*, 
              json_agg(
                json_build_object(
                  'hash', t.hash,
                  'timestamp', t.timestamp,
                  'type', t.tx_type
                )
              ) as transactions
       FROM blocks b
       LEFT JOIN transactions t ON b.id = t.block_id
       WHERE b.block_index = $1
       GROUP BY b.id`,
      [index],
    )

    if (result.rows.length === 0) return null

    const block = result.rows[0]
    return {
      index: block.block_index,
      hash: block.hash,
      previousHash: block.previous_hash,
      merkleRoot: block.merkle_root,
      timestamp: Number.parseInt(block.timestamp),
      nonce: block.nonce,
      difficulty: block.difficulty,
      transactions: block.transactions.filter((tx) => tx.hash !== null),
    }
  }

  static async getByHash(hash) {
    const result = await pool.query(
      `SELECT b.*, 
              json_agg(
                json_build_object(
                  'hash', t.hash,
                  'timestamp', t.timestamp,
                  'type', t.tx_type
                )
              ) as transactions
       FROM blocks b
       LEFT JOIN transactions t ON b.id = t.block_id
       WHERE b.hash = $1
       GROUP BY b.id`,
      [hash],
    )

    if (result.rows.length === 0) return null

    const block = result.rows[0]
    return {
      index: block.block_index,
      hash: block.hash,
      previousHash: block.previous_hash,
      merkleRoot: block.merkle_root,
      timestamp: Number.parseInt(block.timestamp),
      nonce: block.nonce,
      difficulty: block.difficulty,
      transactions: block.transactions.filter((tx) => tx.hash !== null),
    }
  }

  static async getLatest(limit = 10) {
    const result = await pool.query(
      `SELECT b.*, 
              json_agg(
                json_build_object(
                  'hash', t.hash,
                  'timestamp', t.timestamp,
                  'type', t.tx_type
                )
              ) as transactions
       FROM blocks b
       LEFT JOIN transactions t ON b.id = t.block_id
       GROUP BY b.id
       ORDER BY b.block_index DESC
       LIMIT $1`,
      [limit],
    )

    return result.rows.map((block) => ({
      index: block.block_index,
      hash: block.hash,
      previousHash: block.previous_hash,
      merkleRoot: block.merkle_root,
      timestamp: Number.parseInt(block.timestamp),
      nonce: block.nonce,
      difficulty: block.difficulty,
      transactions: block.transactions.filter((tx) => tx.hash !== null),
    }))
  }

  static async getLatestBlock() {
    const result = await pool.query(`SELECT * FROM blocks ORDER BY block_index DESC LIMIT 1`)

    if (result.rows.length === 0) return null

    const block = result.rows[0]
    return {
      index: block.block_index,
      hash: block.hash,
      previousHash: block.previous_hash,
      merkleRoot: block.merkle_root,
      timestamp: Number.parseInt(block.timestamp),
      nonce: block.nonce,
      difficulty: block.difficulty,
    }
  }

  static async getTotalCount() {
    const result = await pool.query("SELECT COUNT(*) as count FROM blocks")
    return Number.parseInt(result.rows[0].count)
  }
}

module.exports = BlockModel
