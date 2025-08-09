package repository

import (
	"context"
	"errors"
	"fmt"
	"sancoin/internal/core"
	"sancoin/internal/model"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type Repository interface {
	AddBlock(ctx context.Context, block *core.Block) error
	GetLastBlock(ctx context.Context) (*core.Block, error)
	FindUTXOs(ctx context.Context, address string) ([]model.UTXO, error)
	FindUTXO(ctx context.Context, txID []byte, vout int) (*model.UTXO, error) // Thêm dòng này
	FindTransaction(ctx context.Context, txID []byte) (*core.Transaction, error)
	GetStatsSummary(ctx context.Context) (*SummaryStats, error)
	GetLatestBlocks(ctx context.Context, limit int) ([]BlockSummary, error)
	GetLatestTransactions(ctx context.Context, limit int) ([]TransactionSummary, error)
}

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) AddBlock(ctx context.Context, block *core.Block) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 1. Insert the block
	_, err = tx.Exec(ctx,
		`INSERT INTO blocks (hash, prev_block_hash, height, timestamp, nonce, difficulty, merkle_root)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		block.HashHex(), block.PrevBlockHashHex(), block.Height, block.Timestamp, block.Nonce, block.Difficulty, block.MerkleRootHex())
	if err != nil {
		return fmt.Errorf("failed to insert block: %w", err)
	}

	// 2. Process all transactions in the block
	for _, transaction := range block.Transactions {
		// Insert transaction
		_, err := tx.Exec(ctx,
			`INSERT INTO transactions (tx_hash, block_hash, version, locktime, is_coinbase, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6)`,
			transaction.IDHex(), block.HashHex(), 0, 0, transaction.IsCoinbase(), transaction.Timestamp)
		if err != nil {
			return fmt.Errorf("failed to insert transaction %s: %w", transaction.IDHex(), err)
		}

		// 3. Remove spent UTXOs (inputs)
		if !transaction.IsCoinbase() {
			for _, vin := range transaction.Vin {
				_, err := tx.Exec(ctx,
					`DELETE FROM utxos WHERE tx_hash = $1 AND vout_index = $2`,
					fmt.Sprintf("%x", vin.TxID), vin.Vout)
				if err != nil {
					return fmt.Errorf("failed to delete spent UTXO: %w", err)
				}
			}
		}

		// 4. Add new UTXOs (outputs)
		for i, vout := range transaction.Vout {
			_, err := tx.Exec(ctx,
				`INSERT INTO utxos (tx_hash, vout_index, amount, script_pub_key)
				 VALUES ($1, $2, $3, $4)`,
				transaction.IDHex(), i, vout.Value, vout.ScriptPubKey)
			if err != nil {
				return fmt.Errorf("failed to insert new UTXO: %w", err)
			}
		}
	}

	return tx.Commit(ctx)
}

func (r *PostgresRepository) GetLastBlock(ctx context.Context) (*core.Block, error) {
	var hash, prevHash, merkleRoot string
	var height, timestamp, nonce int64
	var difficulty int

	err := r.db.QueryRow(ctx,
		`SELECT hash, prev_block_hash, height, timestamp, nonce, difficulty, merkle_root
		 FROM blocks ORDER BY height DESC LIMIT 1`).Scan(&hash, &prevHash, &height, &timestamp, &nonce, &difficulty, &merkleRoot)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	// Note: Transactions are not loaded here for performance. Load them separately if needed.
	return &core.Block{
		Hash:          []byte(hash),
		PrevBlockHash: []byte(prevHash),
		Height:        height,
		Timestamp:     timestamp,
		Nonce:         nonce,
		Difficulty:    difficulty,
		MerkleRoot:    []byte(merkleRoot),
		Transactions:  nil, // Lazy load
	}, nil
}

func (r *PostgresRepository) FindUTXOs(ctx context.Context, address string) ([]model.UTXO, error) {
	rows, err := r.db.Query(ctx,
		`SELECT tx_hash, vout_index, amount FROM utxos WHERE script_pub_key = $1`, address)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var utxos []model.UTXO
	for rows.Next() {
		var utxo model.UTXO
		var txHash string
		err := rows.Scan(&txHash, &utxo.Vout, &utxo.Amount)
		if err != nil {
			return nil, err
		}
		utxo.TxID = []byte(txHash)
		utxos = append(utxos, utxo)
	}
	return utxos, nil
}

// FindUTXO finds a single unspent transaction output.
func (r *PostgresRepository) FindUTXO(ctx context.Context, txID []byte, vout int) (*model.UTXO, error) {
	utxo := &model.UTXO{TxID: txID, Vout: vout}
	txHashHex := fmt.Sprintf("%x", txID)

	err := r.db.QueryRow(ctx,
		`SELECT amount, script_pub_key FROM utxos WHERE tx_hash = $1 AND vout_index = $2`,
		txHashHex, vout).Scan(&utxo.Amount, new(string)) // We don't need the script pub key here

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return utxo, nil
}

// FindTransaction finds a transaction by its ID (hex string)
func (r *PostgresRepository) FindTransaction(ctx context.Context, txID []byte) (*core.Transaction, error) {
	// This is a simplified implementation. A full one would reconstruct the transaction
	// from the transactions, tx_inputs, and tx_outputs tables.
	// For signing, we only need the outputs of the previous transaction.
	txHash := fmt.Sprintf("%x", txID)
	rows, err := r.db.Query(ctx, `SELECT amount, script_pub_key FROM tx_outputs WHERE tx_hash = $1 ORDER BY vout_index ASC`, txHash)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tx := &core.Transaction{ID: txID}
	for rows.Next() {
		var output core.TXOutput
		err := rows.Scan(&output.Value, &output.ScriptPubKey)
		if err != nil {
			return nil, err
		}
		tx.Vout = append(tx.Vout, output)
	}

	if len(tx.Vout) == 0 {
		return nil, ErrNotFound
	}

	return tx, nil
}

// New methods for statistics

type SummaryStats struct {
	TotalTransactions     int64   `json:"total_transactions"`
	LastFinalizedBlock    int64   `json:"last_finalized_block"`
	TransactionsPerSecond float64 `json:"transactions_per_second"`
}

func (r *PostgresRepository) GetStatsSummary(ctx context.Context) (*SummaryStats, error) {
	stats := SummaryStats{}

	// Get total transactions and last block height
	err := r.db.QueryRow(ctx, `
		SELECT
			(SELECT COUNT(*) FROM transactions),
			(SELECT COALESCE(MAX(height), 0) FROM blocks)
	`).Scan(&stats.TotalTransactions, &stats.LastFinalizedBlock)
	if err != nil {
		return nil, fmt.Errorf("failed to query summary stats: %w", err)
	}

	// Calculate TPS over the last minute
	var txCountLastMinute int64
	err = r.db.QueryRow(ctx, `
		SELECT COUNT(*) FROM transactions WHERE timestamp >= $1
	`, time.Now().Unix()-60).Scan(&txCountLastMinute)
	if err != nil {
		// Non-critical, so just log and continue
		fmt.Printf("Could not calculate TPS: %v\n", err)
		stats.TransactionsPerSecond = 0
	} else {
		stats.TransactionsPerSecond = float64(txCountLastMinute) / 60.0
	}

	return &stats, nil
}

type BlockSummary struct {
	Height       int64  `json:"height"`
	Hash         string `json:"hash"`
	Timestamp    int64  `json:"timestamp"`
	TxCount      int    `json:"tx_count"`
	MinerAddress string `json:"miner_address"`
}

func (r *PostgresRepository) GetLatestBlocks(ctx context.Context, limit int) ([]BlockSummary, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			b.height,
			b.hash,
			b.timestamp,
			(SELECT COUNT(*) FROM transactions t WHERE t.block_hash = b.hash) as tx_count,
			(SELECT vout.script_pub_key FROM transactions t JOIN tx_outputs vout ON t.tx_hash = vout.tx_hash WHERE t.block_hash = b.hash AND t.is_coinbase = TRUE LIMIT 1) as miner_address
		FROM blocks b
		ORDER BY b.height DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blocks []BlockSummary
	for rows.Next() {
		var b BlockSummary
		err := rows.Scan(&b.Height, &b.Hash, &b.Timestamp, &b.TxCount, &b.MinerAddress)
		if err != nil {
			return nil, err
		}
		blocks = append(blocks, b)
	}
	return blocks, nil
}

type TransactionSummary struct {
	Hash      string `json:"hash"`
	From      string `json:"from"`
	To        string `json:"to"`
	Amount    int64  `json:"amount"`
	Timestamp int64  `json:"timestamp"`
}

func (r *PostgresRepository) GetLatestTransactions(ctx context.Context, limit int) ([]TransactionSummary, error) {
	// This is a simplified query. A real one would be more complex to accurately get 'from' address.
	// Here we assume the first input's previous output address is the sender.
	rows, err := r.db.Query(ctx, `
		WITH recent_txs AS (
			SELECT tx_hash, timestamp FROM transactions WHERE is_coinbase = FALSE ORDER BY timestamp DESC LIMIT $1
		)
		SELECT
			rt.tx_hash,
			rt.timestamp,
			(SELECT prev_out.script_pub_key FROM tx_inputs vin JOIN tx_outputs prev_out ON vin.prev_tx_hash = prev_out.tx_hash AND vin.vout_index = prev_out.vout_index WHERE vin.tx_hash = rt.tx_hash LIMIT 1) as from_address,
			(SELECT script_pub_key FROM tx_outputs WHERE tx_hash = rt.tx_hash LIMIT 1) as to_address,
			(SELECT amount FROM tx_outputs WHERE tx_hash = rt.tx_hash LIMIT 1) as amount
		FROM recent_txs rt
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var txs []TransactionSummary
	for rows.Next() {
		var tx TransactionSummary
		err := rows.Scan(&tx.Hash, &tx.Timestamp, &tx.From, &tx.To, &tx.Amount)
		if err != nil {
			return nil, err
		}
		txs = append(txs, tx)
	}
	return txs, nil
}
