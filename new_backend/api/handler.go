package api

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"sancoin/internal/core"
	"sancoin/internal/repository"
	"sancoin/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/tyler-smith/go-bip39"
)

// Handler holds the services that handlers will use
type Handler struct {
	walletSvc *service.WalletService
	bcSvc     *service.BlockchainService
	statsSvc  *service.StatsService
}

// NewHandler creates a new handler with its dependencies
func NewHandler(repo repository.Repository) *Handler {
	return &Handler{
		walletSvc: service.NewWalletService(repo),
		bcSvc:     service.NewBlockchainService(repo),
		statsSvc:  service.NewStatsService(repo),
	}
}

// --- New Wallet Handlers ---

type CreateWalletRequest struct {
	Password string `json:"password" binding:"required"`
}

// CreateWallet creates a new mnemonic, derives keys, and returns an encrypted keystore file for download.
func (h *Handler) CreateWallet(c *gin.Context) {
	var req CreateWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Password is required: " + err.Error()})
		return
	}

	// 1. Generate mnemonic and wallet
	wallet, mnemonic, err := h.walletSvc.GenerateNewWallet()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate new wallet: " + err.Error()})
		return
	}

	// 2. Encrypt the private key with the user's password
	encryptedKeystore, err := core.EncryptKey(&wallet.PrivateKey, req.Password)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to encrypt private key: " + err.Error()})
		return
	}

	// 3. Prepare the final downloadable file content
	// We add the mnemonic and plain text keys to the file for user convenience.
	downloadableContent := gin.H{
		"address":    encryptedKeystore.Address,
		"publicKey":  wallet.PublicKeyHex(),  // Added
		"privateKey": wallet.PrivateKeyHex(), // Added
		"crypto":     encryptedKeystore.Crypto,
		"mnemonic":   mnemonic,
	}

	// 4. Set headers to trigger file download
	fileName := fmt.Sprintf("sancoin_keystore_%s.json", wallet.Address())
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	c.Header("Content-Type", "application/json")
	c.JSON(200, downloadableContent)
}

type RestoreWalletRequest struct {
	Mnemonic   string `json:"mnemonic" binding:"required"`
	Passphrase string `json:"passphrase"` // Optional BIP39 passphrase
}

// RestoreWallet re-generates a wallet from a mnemonic phrase.
func (h *Handler) RestoreWallet(c *gin.Context) {
	var req RestoreWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	wallet, err := h.walletSvc.CreateWalletFromMnemonic(req.Mnemonic, req.Passphrase)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to restore wallet: " + err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"message":    "Wallet restored successfully",
		"address":    wallet.Address(),
		"publicKey":  wallet.PublicKeyHex(),
		"privateKey": wallet.PrivateKeyHex(), // Returned for immediate use
	})
}

// UnlockWallet decrypts a keystore file using a password.
func (h *Handler) UnlockWallet(c *gin.Context) {
	password := c.PostForm("password")
	if password == "" {
		c.JSON(400, gin.H{"error": "password form field is required"})
		return
	}

	file, err := c.FormFile("keystore")
	if err != nil {
		c.JSON(400, gin.H{"error": "keystore file upload is required"})
		return
	}

	openedFile, err := file.Open()
	if err != nil {
		c.JSON(500, gin.H{"error": "failed to open uploaded file"})
		return
	}
	defer openedFile.Close()

	var keystore core.KeystoreFile
	if err := json.NewDecoder(openedFile).Decode(&keystore); err != nil {
		c.JSON(400, gin.H{"error": "invalid keystore file format"})
		return
	}

	privateKey, err := core.DecryptKey(&keystore, password)
	if err != nil {
		c.JSON(401, gin.H{"error": "failed to decrypt key (wrong password?)"})
		return
	}

	wallet := core.Wallet{PrivateKey: *privateKey}
	wallet.PublicKey = append(privateKey.PublicKey.X.Bytes(), privateKey.PublicKey.Y.Bytes()...)

	c.JSON(200, gin.H{
		"message":    "Wallet unlocked successfully",
		"address":    wallet.Address(),
		"privateKey": wallet.PrivateKeyHex(),
	})
}

// --- Other Handlers (Unchanged) ---

func (h *Handler) GetWalletBalance(c *gin.Context) {
	address := c.Param("address")
	balance, utxos, err := h.walletSvc.GetBalance(c.Request.Context(), address)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"address":    address,
		"balance":    balance,
		"utxo_count": len(utxos),
		"utxos":      utxos,
	})
}

func (h *Handler) CreateTransaction(c *gin.Context) {
	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	tx, err := h.bcSvc.CreateAndSignTransaction(c.Request.Context(), req.SenderPrivateKey, req.SenderAddress, req.RecipientAddress, req.Amount)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}
	h.bcSvc.AddTransactionToMempool(tx)

	c.JSON(202, gin.H{
		"message": "Transaction created and sent to mempool",
		"tx_hash": tx.IDHex(),
	})
}

func (h *Handler) MineBlock(c *gin.Context) {
	var req MineBlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	block, err := h.bcSvc.MineBlock(c.Request.Context(), req.MinerAddress)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	if block == nil {
		c.JSON(200, gin.H{"message": "No pending transactions to mine. Genesis block created if not exists."})
		return
	}

	c.JSON(201, gin.H{
		"message":               "New block successfully mined!",
		"block_height":          block.Height,
		"block_hash":            block.HashHex(),
		"transactions_included": len(block.Transactions),
	})
}

func (h *Handler) GetStatsSummary(c *gin.Context) {
	summary, err := h.statsSvc.GetSummary(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get stats summary: " + err.Error()})
		return
	}
	c.JSON(200, summary)
}

func (h *Handler) GetLatestBlocks(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 50 {
		limit = 5
	}

	blocks, err := h.statsSvc.GetLatestBlocks(c.Request.Context(), limit)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get latest blocks: " + err.Error()})
		return
	}
	c.JSON(200, blocks)
}

func (h *Handler) GetLatestTransactions(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 50 {
		limit = 5
	}

	txs, err := h.statsSvc.GetLatestTransactions(c.Request.Context(), limit)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get latest transactions: " + err.Error()})
		return
	}
	c.JSON(200, txs)
}

// BroadcastTransactionRequest defines the request for broadcasting a transaction.
type BroadcastTransactionRequest struct {
	RawTxHex string `json:"raw_tx_hex" binding:"required"`
}

// BroadcastTransaction receives a signed transaction, verifies it, and adds it to the mempool.
func (h *Handler) BroadcastTransaction(c *gin.Context) {
	var req BroadcastTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	txBytes, err := hex.DecodeString(req.RawTxHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid raw_tx_hex format"})
		return
	}

	tx, err := core.DeserializeTransaction(txBytes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Submit to the service for verification and mempool inclusion
	err = h.bcSvc.SubmitTransaction(c.Request.Context(), tx)
	if err != nil {
		// Use 422 Unprocessable Entity for validation errors
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Transaction broadcast successfully and is pending inclusion in a block.",
		"tx_hash": tx.IDHex(),
	})
}

type CreateTransactionRequest struct {
	SenderPrivateKey string `json:"sender_private_key" binding:"required"`
	SenderAddress    string `json:"sender_address" binding:"required"`
	RecipientAddress string `json:"recipient_address" binding:"required"`
	Amount           int64  `json:"amount" binding:"required"`
}

type MineBlockRequest struct {
	MinerAddress string `json:"miner_address" binding:"required"`
}
