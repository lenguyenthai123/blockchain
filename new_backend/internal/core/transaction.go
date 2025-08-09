package core

import (
	"bytes"
	"context"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/gob"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"
	"time"
)

type Transaction struct {
	ID        []byte
	Vin       []TXInput
	Vout      []TXOutput
	Timestamp int64
}

// Serialize converts a transaction into a byte slice
func (tx *Transaction) Serialize() []byte {
	var encoded bytes.Buffer
	enc := gob.NewEncoder(&encoded)
	err := enc.Encode(tx)
	if err != nil {
		log.Panic(err)
	}
	return encoded.Bytes()
}

// DeserializeTransaction deserializes a transaction
func DeserializeTransaction(data []byte) (*Transaction, error) {
	var transaction Transaction
	decoder := gob.NewDecoder(bytes.NewReader(data))
	err := decoder.Decode(&transaction)
	if err != nil {
		return nil, fmt.Errorf("failed to deserialize transaction: %w", err)
	}
	return &transaction, nil
}

func (tx *Transaction) SetID() {
	var encoded bytes.Buffer
	var hash [32]byte

	txCopy := *tx
	txCopy.ID = []byte{} // Ensure ID is nil before hashing

	enc := gob.NewEncoder(&encoded)
	err := enc.Encode(txCopy)
	if err != nil {
		log.Panic(err)
	}
	hash = sha256.Sum256(encoded.Bytes())
	tx.ID = hash[:]
}

func (tx *Transaction) IDHex() string {
	return fmt.Sprintf("%x", tx.ID)
}

func NewCoinbaseTX(to string, reward int64) *Transaction {
	txin := TXInput{TxID: []byte{}, Vout: -1, Signature: nil, PubKey: []byte("Coinbase")}
	txout := NewTXOutput(reward, to)
	tx := Transaction{ID: nil, Vin: []TXInput{txin}, Vout: []TXOutput{*txout}, Timestamp: time.Now().Unix()}
	tx.SetID()
	return &tx
}

func (tx *Transaction) IsCoinbase() bool {
	return len(tx.Vin) == 1 && len(tx.Vin[0].TxID) == 0 && tx.Vin[0].Vout == -1
}

func (tx *Transaction) Sign(privKey ecdsa.PrivateKey, finder TransactionFinder) error {
	if tx.IsCoinbase() {
		return nil
	}

	txCopy := tx.TrimmedCopy()

	for inID, vin := range txCopy.Vin {
		prevTx, err := finder.FindTransaction(context.Background(), vin.TxID)
		if err != nil {
			return fmt.Errorf("could not find previous transaction %s: %w", hex.EncodeToString(vin.TxID), err)
		}
		txCopy.Vin[inID].Signature = nil
		txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].PubKeyHash()
		txCopy.SetID()
		txCopy.Vin[inID].PubKey = nil

		r, s, err := ecdsa.Sign(rand.Reader, &privKey, txCopy.ID)
		if err != nil {
			return fmt.Errorf("failed to sign: %w", err)
		}
		signature := append(r.Bytes(), s.Bytes()...)
		tx.Vin[inID].Signature = signature
	}

	return nil
}

func (tx *Transaction) TrimmedCopy() Transaction {
	var inputs []TXInput
	var outputs []TXOutput

	for _, vin := range tx.Vin {
		inputs = append(inputs, TXInput{TxID: vin.TxID, Vout: vin.Vout, Signature: nil, PubKey: nil})
	}

	for _, vout := range tx.Vout {
		outputs = append(outputs, TXOutput{Value: vout.Value, ScriptPubKey: vout.ScriptPubKey})
	}

	return Transaction{
		ID:        tx.ID,
		Vin:       inputs,
		Vout:      outputs,
		Timestamp: tx.Timestamp,
	}
}

func (tx *Transaction) Verify(finder TransactionFinder) bool {
	if tx.IsCoinbase() {
		return true
	}

	txCopy := tx.TrimmedCopy()
	curve := elliptic.P256()

	for inID, vin := range tx.Vin {
		prevTx, err := finder.FindTransaction(context.Background(), vin.TxID)
		if err != nil {
			log.Printf("Failed to find previous transaction for verification: %v", err)
			return false
		}

		txCopy.Vin[inID].Signature = nil
		txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].PubKeyHash()
		txCopy.SetID()
		txCopy.Vin[inID].PubKey = nil

		r := big.Int{}
		s := big.Int{}
		sigLen := len(vin.Signature)
		if sigLen == 0 {
			return false
		}
		r.SetBytes(vin.Signature[:(sigLen / 2)])
		s.SetBytes(vin.Signature[(sigLen / 2):])

		x := big.Int{}
		y := big.Int{}
		keyLen := len(vin.PubKey)
		if keyLen == 0 {
			return false
		}
		x.SetBytes(vin.PubKey[:(keyLen / 2)])
		y.SetBytes(vin.PubKey[(keyLen / 2):])

		rawPubKey := ecdsa.PublicKey{Curve: curve, X: &x, Y: &y}
		if !ecdsa.Verify(&rawPubKey, txCopy.ID, &r, &s) {
			return false
		}
	}

	return true
}
