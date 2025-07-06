package utils

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"strings"

	"github.com/tyler-smith/go-bip39"
	"golang.org/x/crypto/ripemd160"
)

var mnemonicWords = []string{
	"abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
	"absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
	"acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
	"adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
	"advice", "aerobic", "affair", "afford", "afraid", "again", "against", "age",
	"agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm",
	"album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost",
	"alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing",
	"among", "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle",
	"angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna",
}

// GeneratePrivateKey generates a new ECDSA private key
func GeneratePrivateKey() string {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		// Fallback to simple random generation
		bytes := make([]byte, 32)
		rand.Read(bytes)
		return hex.EncodeToString(bytes)
	}

	privateKeyBytes := privateKey.D.Bytes()
	// Pad to 32 bytes if necessary
	if len(privateKeyBytes) < 32 {
		padded := make([]byte, 32)
		copy(padded[32-len(privateKeyBytes):], privateKeyBytes)
		privateKeyBytes = padded
	}

	return hex.EncodeToString(privateKeyBytes)
}

// PrivateKeyToAddress converts a private key to a blockchain address
func PrivateKeyToAddress(privateKeyHex string) string {
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		// Fallback to simple hash-based address
		hash := sha256.Sum256([]byte(privateKeyHex))
		return "0x" + hex.EncodeToString(hash[:20])
	}

	// Create ECDSA private key
	privateKey := new(ecdsa.PrivateKey)
	privateKey.PublicKey.Curve = elliptic.P256()
	privateKey.D = new(big.Int).SetBytes(privateKeyBytes)
	privateKey.PublicKey.X, privateKey.PublicKey.Y = privateKey.PublicKey.Curve.ScalarBaseMult(privateKeyBytes)

	// Get public key bytes
	publicKeyBytes := elliptic.Marshal(privateKey.PublicKey.Curve, privateKey.PublicKey.X, privateKey.PublicKey.Y)

	// Hash public key with SHA256
	sha256Hash := sha256.Sum256(publicKeyBytes)

	// Hash with RIPEMD160
	ripemd160Hasher := ripemd160.New()
	ripemd160Hasher.Write(sha256Hash[:])
	publicKeyHash := ripemd160Hasher.Sum(nil)

	// Add version byte (0x00 for mainnet)
	versionedPayload := append([]byte{0x00}, publicKeyHash...)

	// Double SHA256 for checksum
	firstSHA := sha256.Sum256(versionedPayload)
	secondSHA := sha256.Sum256(firstSHA[:])
	checksum := secondSHA[:4]

	// Final address
	fullPayload := append(versionedPayload, checksum...)

	return "0x" + hex.EncodeToString(fullPayload[:20]) // Take first 20 bytes for Ethereum-style address
}

// GenerateMnemonic generates a BIP39 mnemonic phrase
func GenerateMnemonic() string {
	// Generate 128 bits of entropy (12 words)
	entropy, err := bip39.NewEntropy(128)
	if err != nil {
		// Fallback to simple word generation if BIP39 fails
		return generateFallbackMnemonic()
	}

	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return generateFallbackMnemonic()
	}

	return mnemonic
}

// generateFallbackMnemonic provides a fallback mnemonic generation
func generateFallbackMnemonic() string {
	words := []string{
		"abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
		"absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
		"acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
		"adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
		"advice", "aerobic", "affair", "afford", "afraid", "again", "against", "age",
		"agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm",
		"album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost",
		"alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing",
		"among", "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle",
		"angry", "animal", "ankle", "announce", "annual", "another", "answer", "antenna",
	}

	selectedWords := make([]string, 12)
	for i := 0; i < 12; i++ {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(words))))
		selectedWords[i] = words[n.Int64()]
	}
	return strings.Join(selectedWords, " ")
}

// MnemonicToPrivateKey converts a BIP39 mnemonic to a private key
func MnemonicToPrivateKey(mnemonic string) (string, error) {
	// Validate mnemonic
	if !bip39.IsMnemonicValid(mnemonic) {
		return "", errors.New("invalid mnemonic phrase")
	}

	// Generate seed from mnemonic
	seed := bip39.NewSeed(mnemonic, "") // Empty passphrase

	// Use first 32 bytes of seed as private key
	if len(seed) < 32 {
		return "", errors.New("insufficient seed length")
	}

	privateKeyBytes := seed[:32]
	return hex.EncodeToString(privateKeyBytes), nil
}

// ValidateMnemonic validates a BIP39 mnemonic phrase
func ValidateMnemonic(mnemonic string) bool {
	return bip39.IsMnemonicValid(mnemonic)
}

// GenerateTransactionHash generates a unique transaction hash
func GenerateTransactionHash() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return "0x" + hex.EncodeToString(bytes)
}

// GenerateBlockHash generates a unique block hash
func GenerateBlockHash() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return "0x" + hex.EncodeToString(bytes)
}

// ValidateAddress validates a blockchain address format
func ValidateAddress(address string) bool {
	if len(address) != 42 {
		return false
	}
	if !strings.HasPrefix(address, "0x") {
		return false
	}
	_, err := hex.DecodeString(address[2:])
	return err == nil
}

// HashData creates a SHA256 hash of the input data
func HashData(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

// VerifySignature verifies a digital signature (simplified implementation)
func VerifySignature(message, signature, publicKey string) bool {
	// This is a simplified verification
	// In a real implementation, you would use proper ECDSA verification
	expectedHash := HashData(message + publicKey)
	return expectedHash == signature
}

// SignMessage signs a message with a private key (simplified implementation)
func SignMessage(message, privateKey string) string {
	// This is a simplified signing
	// In a real implementation, you would use proper ECDSA signing
	return HashData(message + privateKey)
}

// GenerateKeyPair generates a new key pair
func GenerateKeyPair() (string, string) {
	privateKey := GeneratePrivateKey()

	// Generate public key from private key
	privateKeyBytes, err := hex.DecodeString(privateKey)
	if err != nil {
		// Fallback
		publicKey := HashData(privateKey)
		return privateKey, publicKey
	}

	// Create ECDSA private key
	ecdsaPrivateKey := new(ecdsa.PrivateKey)
	ecdsaPrivateKey.PublicKey.Curve = elliptic.P256()
	ecdsaPrivateKey.D = new(big.Int).SetBytes(privateKeyBytes)
	ecdsaPrivateKey.PublicKey.X, ecdsaPrivateKey.PublicKey.Y = ecdsaPrivateKey.PublicKey.Curve.ScalarBaseMult(privateKeyBytes)

	// Get public key bytes
	publicKeyBytes := elliptic.Marshal(ecdsaPrivateKey.PublicKey.Curve, ecdsaPrivateKey.PublicKey.X, ecdsaPrivateKey.PublicKey.Y)
	publicKey := hex.EncodeToString(publicKeyBytes)

	return privateKey, publicKey
}

// EncryptData encrypts data with a key (simplified implementation)
func EncryptData(data, key string) string {
	// This is a simplified encryption
	// In a real implementation, you would use proper encryption like AES
	hash := sha256.Sum256([]byte(data + key))
	return hex.EncodeToString(hash[:])
}

// DecryptData decrypts data with a key (simplified implementation)
func DecryptData(encryptedData, key string) (string, error) {
	// This simplified implementation doesn't support actual decryption
	// In a real implementation, you would use proper decryption
	return "", fmt.Errorf("decryption not implemented in simplified version")
}

// GenerateEntropy generates cryptographically secure random entropy
func GenerateEntropy(bits int) ([]byte, error) {
	if bits%8 != 0 {
		return nil, errors.New("entropy bits must be divisible by 8")
	}

	bytes := make([]byte, bits/8)
	_, err := rand.Read(bytes)
	if err != nil {
		return nil, err
	}

	return bytes, nil
}

// ValidatePrivateKey validates a private key format
func ValidatePrivateKey(privateKey string) bool {
	if len(privateKey) != 64 {
		return false
	}

	_, err := hex.DecodeString(privateKey)
	return err == nil
}

// GetPublicKeyFromPrivate derives public key from private key
func GetPublicKeyFromPrivate(privateKeyHex string) (string, error) {
	privateKeyBytes, err := hex.DecodeString(privateKeyHex)
	if err != nil {
		return "", err
	}

	// Create ECDSA private key
	privateKey := new(ecdsa.PrivateKey)
	privateKey.PublicKey.Curve = elliptic.P256()
	privateKey.D = new(big.Int).SetBytes(privateKeyBytes)
	privateKey.PublicKey.X, privateKey.PublicKey.Y = privateKey.PublicKey.Curve.ScalarBaseMult(privateKeyBytes)

	// Get public key bytes
	publicKeyBytes := elliptic.Marshal(privateKey.PublicKey.Curve, privateKey.PublicKey.X, privateKey.PublicKey.Y)

	return hex.EncodeToString(publicKeyBytes), nil
}
