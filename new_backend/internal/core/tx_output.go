package core

import "fmt"

type TXOutput struct {
	Value        int64
	ScriptPubKey string // Address
}

func NewTXOutput(value int64, address string) *TXOutput {
	return &TXOutput{value, address}
}

func (out *TXOutput) IsLockedWithKey(pubKeyHash []byte) bool {
	// In a real implementation, this would parse the script
	// For our simple case, we just compare the address string
	return out.ScriptPubKey == fmt.Sprintf("%x", pubKeyHash)
}
