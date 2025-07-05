package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
	"strings"
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

func GeneratePrivateKey() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func PrivateKeyToAddress(privateKey string) string {
	// Simplified address generation
	hash := sha256.Sum256([]byte(privateKey))
	return "0x" + hex.EncodeToString(hash[:20])
}

func GenerateMnemonic() string {
	words := make([]string, 12)
	for i := 0; i < 12; i++ {
		n, _ := rand.Int(rand.Reader, big.NewInt(int64(len(mnemonicWords))))
		words[i] = mnemonicWords[n.Int64()]
	}
	return strings.Join(words, " ")
}

func MnemonicToPrivateKey(mnemonic string) (string, error) {
	words := strings.Fields(strings.TrimSpace(mnemonic))
	if len(words) != 12 {
		return "", errors.New("invalid mnemonic phrase")
	}

	// Simplified mnemonic to private key conversion
	seed := strings.Join(words, "")
	hash := sha256.Sum256([]byte(seed))
	return hex.EncodeToString(hash[:]), nil
}

func GenerateTransactionHash() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return "0x" + hex.EncodeToString(bytes)
}

func GenerateBlockHash() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return "0x" + hex.EncodeToString(bytes)
}

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

func HashData(data string) string {
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:])
}

func VerifySignature(message, signature, publicKey string) bool {
	// Simplified signature verification
	expectedHash := HashData(message + publicKey)
	return expectedHash == signature
}

func SignMessage(message, privateKey string) string {
	// Simplified message signing
	return HashData(message + privateKey)
}

func GenerateKeyPair() (string, string) {
	privateKey := GeneratePrivateKey()
	publicKey := HashData(privateKey) // Simplified public key generation
	return privateKey, publicKey
}

func EncryptData(data, key string) string {
	// Simplified encryption
	hash := sha256.Sum256([]byte(data + key))
	return hex.EncodeToString(hash[:])
}

func DecryptData(encryptedData, key string) (string, error) {
	// Simplified decryption (not reversible in this implementation)
	return "", fmt.Errorf("decryption not implemented in simplified version")
}
