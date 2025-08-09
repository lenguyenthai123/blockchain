package core

import (
	"log"

	"github.com/mr-tron/base58"
)

type TXOutput struct {
	Value        int64
	ScriptPubKey string // Address
}

func NewTXOutput(value int64, address string) *TXOutput {
	return &TXOutput{value, address}
}

// PubKeyHash extracts the public key hash from the address
func (out *TXOutput) PubKeyHash() []byte {
	pubKeyHash, err := base58.Decode(out.ScriptPubKey)
	if err != nil {
		log.Panic(err)
	}
	// The decoded data includes version and checksum, so we need to extract the hash
	// [version:1_byte | pubKeyHash:20_bytes | checksum:4_bytes]
	return pubKeyHash[1 : len(pubKeyHash)-addressChecksumLen]
}
