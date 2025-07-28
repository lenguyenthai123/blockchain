package service

import (
	"context"
	"errors"
	"fmt"
	"sancoin/internal/core"
	"sancoin/internal/repository"
	"sync"
	"time"
)

const (
	MiningDifficulty = 2 // Simple difficulty: hash must start with 2 zeros
	CoinbaseReward   = 50 // Reward for mining a block
)

// A simple in-memory mempool
var mempool = struct {
	sync.RWMutex
	transactions map[string]*core.Transaction
}{
	transactions: make(map[string]*core.Transaction),
}

type BlockchainService struct {
	repo repository.Repository
}

func NewBlockchainService(repo repository.Repository) *BlockchainService {
	return &BlockchainService{repo: repo}
}

func (s *BlockchainService) AddTransactionToMempool(tx *core.Transaction) {
	mempool.Lock()
	defer mempool.Unlock()
	mempool.transactions[tx.IDHex()] = tx
}

func (s *BlockchainService) CreateAndSignTransaction(ctx context.Context, privateKeyHex, from, to string, amount int64) (*core.Transaction, error) {
	wallet, err := core.WalletFromPrivateKeyHex(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %w", err)
	}

	// Verify the address matches the private key
	if wallet.Address() != from {
		return nil, errors.New("sender address does not match private key")
	}

	utxos, err := s.repo.FindUTXOs(ctx, from)
	if err != nil {
		return nil, fmt.Errorf("could not find UTXOs: %w", err)
	}

	// Find enough UTXOs to cover the amount + fee (fee is simplified here)
	var totalAmount int64
	var inputs []core.TXInput
	var spentUTXOs = make(map[string][]int)

	for _, utxo := range utxos {
		if totalAmount >= amount {
			break
		}
		totalAmount += utxo.Amount
		input := core.TXInput{
			TxID:      utxo.TxID,
			Vout:      utxo.Vout,
			Signature: nil, // Will be signed later
			PubKey:    wallet.PublicKey,
		}
		inputs = append(inputs, input)
		spentUTXOs[utxo.TxIDHex()] = append(spentUTXOs[utxo.TxIDHex()], utxo.Vout)
	}

	if totalAmount < amount {
		return nil, errors.New("insufficient funds")
	}

	var outputs []core.TXOutput
	outputs = append(outputs, *core.NewTXOutput(amount, to))
	if totalAmount > amount { // Send change back to sender
		outputs = append(outputs, *core.NewTXOutput(totalAmount-amount, from))
	}

	tx := core.Transaction{
		ID:   nil,
		Vin:  inputs,
		Vout: outputs,
		Timestamp: time.Now().Unix(),
	}
	tx.SetID()

	// Sign the transaction
	err = tx.Sign(wallet.PrivateKey, spentUTXOs, s.repo)
	if err != nil {
		return nil, fmt.Errorf("failed to sign transaction: %w", err)
	}

	return &tx, nil
}

func (s *BlockchainService) MineBlock(ctx context.Context, minerAddress string) (*core.Block, error) {
	lastBlock, err := s.repo.GetLastBlock(ctx)
	if err != nil {
		// If no block exists, create the genesis block
		if errors.Is(err, repository.ErrNotFound) {
			return s.createGenesisBlock(ctx, minerAddress)
		}
		return nil, fmt.Errorf("could not get last block: %w", err)
	}

	mempool.RLock()
	if len(mempool.transactions) == 0 {
		mempool.RUnlock()
		return nil, nil // No transactions to mine
	}

	var transactions []*core.Transaction
	for _, tx := range mempool.transactions {
		// TODO: Add transaction verification logic here
		transactions = append(transactions, tx)
	}
	mempool.RUnlock()

	// Create coinbase transaction
	coinbaseTx := core.NewCoinbaseTX(minerAddress, CoinbaseReward)
	transactions = append([]*core.Transaction{coinbaseTx}, transactions...)

	newBlock := core.NewBlock(transactions, lastBlock.Hash, lastBlock.Height+1, MiningDifficulty)
	pow := core.NewProofOfWork(newBlock)
	nonce, hash := pow.Run()

	newBlock.Nonce = nonce
	newBlock.Hash = hash

	err = s.repo.AddBlock(ctx, newBlock)
	if err != nil {
		return nil, fmt.Errorf("failed to add new block to DB: %w", err)
	}

	// Clear mempool after mining
	mempool.Lock()
	for _, tx := range transactions {
		delete(mempool.transactions, tx.IDHex())
	}
mempool.Unlock()

	return newBlock, nil
}

func (s *BlockchainService) createGenesisBlock(ctx context.Context, genesisAddress string) (*core.Block, error) {
	coinbaseTx := core.NewCoinbaseTX(genesisAddress, CoinbaseReward)
	genesisBlock := core.NewGenesisBlock(coinbaseTx)

	pow := core.NewProofOfWork(genesisBlock)
	nonce, hash := pow.Run()
	genesisBlock.Nonce = nonce
	genesisBlock.Hash = hash

	err := s.repo.AddBlock(ctx, genesisBlock)
	if err != nil {
		return nil, fmt.Errorf("failed to create genesis block: %w", err)
	}
	return genesisBlock, nil
}
