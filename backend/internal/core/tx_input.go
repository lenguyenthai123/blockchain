package core

type TXInput struct {
	TxID      []byte
	Vout      int
	Signature []byte
	PubKey    []byte
}
