package core

import (
	"bytes"
	"crypto/sha256"
	"encoding/gob"
	"fmt"
	"log"
	"time"
)

type Block struct {
	Timestamp     int64
	Transactions  []*Transaction
	PrevBlockHash []byte
	Hash          []byte
	Nonce         int64
	Height        int64
	Difficulty    int
	MerkleRoot    []byte
}

func (b *Block) HashHex() string {
	return fmt.Sprintf("%x", b.Hash)
}

func (b *Block) PrevBlockHashHex() string {
	return fmt.Sprintf("%x", b.PrevBlockHash)
}

func (b *Block) MerkleRootHex() string {
	return fmt.Sprintf("%x", b.MerkleRoot)
}

func NewBlock(transactions []*Transaction, prevBlockHash []byte, height int64, difficulty int) *Block {
	block := &Block{
		Timestamp:     time.Now().Unix(),
		Transactions:  transactions,
		PrevBlockHash: prevBlockHash,
		Hash:          []byte{},
		Nonce:         0,
		Height:        height,
		Difficulty:    difficulty,
	}
	block.MerkleRoot = block.HashTransactions()
	return block
}

func NewGenesisBlock(coinbase *Transaction) *Block {
	return NewBlock([]*Transaction{coinbase}, []byte{}, 0, 2)
}

func (b *Block) HashTransactions() []byte {
	var txHashes [][]byte
	for _, tx := range b.Transactions {
		txHashes = append(txHashes, tx.ID)
	}
	// Simple Merkle Root: just hash the concatenated transaction hashes
	// A real implementation would build a Merkle Tree
	mTree := sha256.Sum256(bytes.Join(txHashes, []byte{}))
	return mTree[:]
}

func (b *Block) Serialize() []byte {
	var result bytes.Buffer
	encoder := gob.NewEncoder(&result)
	err := encoder.Encode(b)
	if err != nil {
		log.Panic(err)
	}
	return result.Bytes()
}

func DeserializeBlock(d []byte) *Block {
	var block Block
	decoder := gob.NewDecoder(bytes.NewReader(d))
	err := decoder.Decode(&block)
	if err != nil {
		log.Panic(err)
	}
	return &block
}
