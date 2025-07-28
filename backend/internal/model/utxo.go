package model

import "fmt"

type UTXO struct {
	TxID   []byte `json:"tx_id"`
	Vout   int    `json:"vout_index"`
	Amount int64  `json:"amount"`
}

func (u *UTXO) TxIDHex() string {
	return fmt.Sprintf("%x", u.TxID)
}
