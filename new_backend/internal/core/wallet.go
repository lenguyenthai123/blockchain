package core

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"math/big"

	"github.com/mr-tron/base58"
	"github.com/tyler-smith/go-bip32"
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

// NewWalletFromSeed creates a wallet from a seed byte array.
// This is the correct, deterministic way to generate a private key from a seed.
func NewWalletFromSeed(seed []byte) (*Wallet, error) {
	masterKey, err := bip32.NewMasterKey(seed)
	if err != nil {
		return nil, fmt.Errorf("failed to create master key from seed: %w", err)
	}

	// The masterKey.Key is our private key scalar (d).
	privateKeyBytes := masterKey.Key

	// Create the private key structure from the scalar.
	privateKey := new(ecdsa.PrivateKey)
	privateKey.D = new(big.Int).SetBytes(privateKeyBytes)
	privateKey.PublicKey.Curve = elliptic.P256()

	// Calculate the public key (X, Y) from the private key scalar 'd'.
	// This is done by multiplying the base point of the curve (G) by 'd'.
	privateKey.PublicKey.X, privateKey.PublicKey.Y = privateKey.PublicKey.Curve.ScalarBaseMult(privateKeyBytes)

	// A key is invalid if d is zero or d is >= the order of the curve.
	// This check ensures the generated key is valid.
	if privateKey.D.Sign() == 0 {
		return nil, fmt.Errorf("invalid private key: key is zero")
	}
	if privateKey.D.Cmp(privateKey.Params().N) >= 0 {
		return nil, fmt.Errorf("invalid private key: key is larger than the curve order")
	}

	publicKeyBytes := append(privateKey.PublicKey.X.Bytes(), privateKey.PublicKey.Y.Bytes()...)

	return &Wallet{PrivateKey: *privateKey, PublicKey: publicKeyBytes}, nil
}

func WalletFromPrivateKeyHex(privateKeyHex string) (*Wallet, error) {
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return nil, err
	}

	priv := &ecdsa.PrivateKey{}
	priv.D = new(big.Int).SetBytes(privateKeyBytes)
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

// Deprecated: newKeyPair is no longer the primary way to create wallets.
func newKeyPair() (ecdsa.PrivateKey, []byte) {
	curve := elliptic.P256()
	private, err := ecdsa.GenerateKey(curve, rand.Reader)
	if err != nil {
		log.Panic(err)
	}
	pubKey := append(private.PublicKey.X.Bytes(), private.PublicKey.Y.Bytes()...)
	return *private, pubKey
}
