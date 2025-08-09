package core

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"math/big"

	"golang.org/x/crypto/pbkdf2"
)

const (
	// Constants for key derivation
	saltBytes  = 16
	keyLen     = 32 // 256-bit key for AES
	iterations = 65536
)

// KeystoreFile defines the structure of the downloadable keystore file.
type KeystoreFile struct {
	Address string     `json:"address"`
	Crypto  CryptoJSON `json:"crypto"`
}

// CryptoJSON holds the encrypted data.
type CryptoJSON struct {
	Cipher     string    `json:"cipher"`
	CipherText string    `json:"ciphertext"`
	Nonce      string    `json:"nonce"`
	KDF        string    `json:"kdf"`
	KDFParams  KDFParams `json:"kdfparams"`
}

// KDFParams contains the parameters for the key derivation function.
type KDFParams struct {
	Salt       string `json:"salt"`
	Iterations int    `json:"iterations"`
	KeyLen     int    `json:"keylen"`
}

// EncryptKey encrypts a private key using a password.
func EncryptKey(privateKey *ecdsa.PrivateKey, password string) (*KeystoreFile, error) {
	salt := make([]byte, saltBytes)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return nil, err
	}

	// Derive a key from the password and salt
	derivedKey := pbkdf2.Key([]byte(password), salt, iterations, keyLen, sha256.New)

	// Encrypt the private key bytes
	block, err := aes.NewCipher(derivedKey)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	privateKeyBytes := privateKey.D.Bytes()
	ciphertext := gcm.Seal(nil, nonce, privateKeyBytes, nil)

	// Create the wallet to get the address
	publicKey := append(privateKey.PublicKey.X.Bytes(), privateKey.PublicKey.Y.Bytes()...)
	wallet := &Wallet{PrivateKey: *privateKey, PublicKey: publicKey}

	keystore := &KeystoreFile{
		Address: wallet.Address(),
		Crypto: CryptoJSON{
			Cipher:     "aes-256-gcm",
			CipherText: hex.EncodeToString(ciphertext),
			Nonce:      hex.EncodeToString(nonce),
			KDF:        "pbkdf2",
			KDFParams: KDFParams{
				Salt:       hex.EncodeToString(salt),
				Iterations: iterations,
				KeyLen:     keyLen,
			},
		},
	}

	return keystore, nil
}

// DecryptKey decrypts a private key from a keystore using a password.
func DecryptKey(keystore *KeystoreFile, password string) (*ecdsa.PrivateKey, error) {
	salt, err := hex.DecodeString(keystore.Crypto.KDFParams.Salt)
	if err != nil {
		return nil, fmt.Errorf("invalid salt: %w", err)
	}
	nonce, err := hex.DecodeString(keystore.Crypto.Nonce)
	if err != nil {
		return nil, fmt.Errorf("invalid nonce: %w", err)
	}
	ciphertext, err := hex.DecodeString(keystore.Crypto.CipherText)
	if err != nil {
		return nil, fmt.Errorf("invalid ciphertext: %w", err)
	}

	// Derive the key again to decrypt
	derivedKey := pbkdf2.Key([]byte(password), salt, keystore.Crypto.KDFParams.Iterations, keystore.Crypto.KDFParams.KeyLen, sha256.New)

	block, err := aes.NewCipher(derivedKey)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	privateKeyBytes, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, fmt.Errorf("decryption failed (likely wrong password): %w", err)
	}

	// Reconstruct the ecdsa.PrivateKey
	priv := new(ecdsa.PrivateKey)
	priv.D = new(big.Int).SetBytes(privateKeyBytes)
	priv.PublicKey.Curve = elliptic.P256()
	priv.PublicKey.X, priv.PublicKey.Y = priv.PublicKey.Curve.ScalarBaseMult(privateKeyBytes)

	return priv, nil
}
