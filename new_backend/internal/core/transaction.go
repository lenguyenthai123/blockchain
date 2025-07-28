package core

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
	"encoding/gob"
	"encoding/hex"
	"fmt"
	"log"
	"sancoin/internal/repository"
	"context"
	"math/big"
	"time"
	"crypto/elliptic"
)

type Transaction struct {
	ID        []byte
	Vin       []TXInput
	Vout      []TXOutput
	Timestamp int64
}

func (tx *Transaction) SetID() {
	var encoded bytes.Buffer
	var hash [32]byte

	enc := gob.NewEncoder(&encoded)
	err := enc.Encode(tx)
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

func (tx *Transaction) Sign(privKey ecdsa.PrivateKey, prevTXs map[string][]int, repo repository.Repository) error {
	if tx.IsCoinbase() {
		return nil
	}

	txCopy := tx.TrimmedCopy()

	for inID, vin := range txCopy.Vin {
		prevTx, err := repo.FindTransaction(context.Background(), vin.TxID)
		if err != nil {
			return fmt.Errorf("could not find previous transaction %s: %w", hex.EncodeToString(vin.TxID), err)
		}
		txCopy.Vin[inID].Signature = nil
		txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].ScriptPubKey // Use the script from the output being spent
		txCopy.SetID()
		txCopy.Vin[inID].PubKey = nil // Reset for next iteration

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

	txNew := Transaction{
		ID:   tx.ID,
		Vin:  inputs,
		Vout: outputs,
		Timestamp: time.Now().Unix(),
	}

	return txNew
}

// TODO: Implement Verify method
func (tx *Transaction) Verify(prevTXs map[string]Transaction) bool {
	if tx.IsCoinbase() {
		return true
	}

	txCopy := tx.TrimmedCopy()
	curve := elliptic.P256()

	for inID, vin := range tx.Vin {
		prevTx := prevTXs[hex.EncodeToString(vin.TxID)]
		txCopy.Vin[inID].Signature = nil
		txCopy.Vin[inID].PubKey = prevTx.Vout[vin.Vout].ScriptPubKey
		txCopy.SetID()
		txCopy.Vin[inID].PubKey = nil

		r := big.Int{}
		s := big.Int{}
		sigLen := len(vin.Signature)
		r.SetBytes(vin.Signature[:(sigLen / 2)])
		s.SetBytes(vin.Signature[(sigLen / 2):])

		x := big.Int{}
		y := big.Int{}
		keyLen := len(vin.PubKey)
		x.SetBytes(vin.PubKey[:(keyLen / 2)])
		y.SetBytes(vin.PubKey[(keyLen / 2):])

		rawPubKey := ecdsa.PublicKey{Curve: curve, X: &x, Y: &y}
		if !ecdsa.Verify(&rawPubKey, txCopy.ID, &r, &s) {
			return false
		}
	}

	return true
}
