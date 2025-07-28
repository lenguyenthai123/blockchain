package core

import (
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"log"

	"github.com/mr-tron/base58"
	"golang.org/x/crypto/ripemd160"
)

const (
	version            = byte(0x00)
	addressChecksumLen = 4
)

type Wallet struct {
	PrivateKey ecdsa.PrivateKey
	PublicKey  []byte
}

func NewWallet() *Wallet {
	private, public := newKeyPair()
	return &Wallet{PrivateKey: private, PublicKey: public}
}

func WalletFromPrivateKeyHex(privateKeyHex string) (*Wallet, error) {
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return nil, err
	}
	
	priv := &ecdsa.PrivateKey{}
	priv.D = new(bytes.Buffer).SetBytes(privateKeyBytes).Big()
	priv.PublicKey.Curve = elliptic.P256()
	priv.PublicKey.X, priv.PublicKey.Y = priv.PublicKey.Curve.ScalarBaseMult(privateKeyBytes)

	return &Wallet{
		PrivateKey: *priv,
		PublicKey:  append(priv.PublicKey.X.Bytes(), priv.PublicKey.Y.Bytes()...),
	}, nil
}

func (w *Wallet) PrivateKeyHex() string {
	return hex.EncodeToString(w.PrivateKey.D.Bytes())
}

func (w *Wallet) PublicKeyHex() string {
	return hex.EncodeToString(w.PublicKey)
}

func (w *Wallet) Address() string {
	pubKeyHash := HashPubKey(w.PublicKey)
	versionedPayload := append([]byte{version}, pubKeyHash...)
	checksum := checksum(versionedPayload)
	fullPayload := append(versionedPayload, checksum...)
	return base58.Encode(fullPayload)
}

func newKeyPair() (ecdsa.PrivateKey, []byte) {
	curve := elliptic.P256()
	private, err := ecdsa.GenerateKey(curve, rand.Reader)
	if err != nil {
		log.Panic(err)
	}
	pubKey := append(private.PublicKey.X.Bytes(), private.PublicKey.Y.Bytes()...)
	return *private, pubKey
}

func HashPubKey(pubKey []byte) []byte {
	publicSHA256 := sha256.Sum256(pubKey)
	RIPEMD160Hasher := ripemd160.New()
	_, err := RIPEMD160Hasher.Write(publicSHA256[:])
	if err != nil {
		log.Panic(err)
	}
	return RIPEMD160Hasher.Sum(nil)
}

func checksum(payload []byte) []byte {
	firstSHA := sha256.Sum256(payload)
	secondSHA := sha256.Sum256(firstSHA[:])
	return secondSHA[:addressChecksumLen]
}
