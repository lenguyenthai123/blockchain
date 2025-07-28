package api

import (
	"sancoin/internal/core"
	"sancoin/internal/repository"
	"sancoin/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Handler holds the services that handlers will use
type Handler struct {
	walletSvc *service.WalletService
	bcSvc     *service.BlockchainService
	statsSvc  *service.StatsService // Add this line
}

// NewHandler creates a new handler with its dependencies
func NewHandler(repo repository.Repository) *Handler {
	return &Handler{
		walletSvc: service.NewWalletService(repo),
		bcSvc:     service.NewBlockchainService(repo),
		statsSvc:  service.NewStatsService(repo), // Add this line
	}
}

// CreateWallet godoc
// @Summary Create a new wallet
// @Description Creates a new ECDSA key pair and a corresponding wallet address
// @Tags wallet
// @Produce json
// @Success 201 {object} map[string]string
// @Router /wallet [post]
func (h *Handler) CreateWallet(c *gin.Context) {
	w := core.NewWallet()
	c.JSON(201, gin.H{
		"private_key": w.PrivateKeyHex(),
		"public_key":  w.PublicKeyHex(),
		"address":     w.Address(),
	})
}

// GetWalletBalance godoc
// @Summary Get wallet balance and UTXOs
// @Description Retrieves the total balance and list of unspent transaction outputs for a wallet
// @Tags wallet
// @Produce json
// @Param address path string true "Wallet Address"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /wallet/{address}/balance [get]
func (h *Handler) GetWalletBalance(c *gin.Context) {
	address := c.Param("address")
	balance, utxos, err := h.walletSvc.GetBalance(c.Request.Context(), address)
	if err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{
		"address":    address,
		"balance":    balance, // This should be formatted to a user-friendly decimal
		"utxo_count": len(utxos),
		"utxos":      utxos,
	})
}

type CreateTransactionRequest struct {
	SenderPrivateKey  string `json:"sender_private_key" binding:"required"`
	SenderAddress     string `json:"sender_address" binding:"required"`
	RecipientAddress string `json:"recipient_address" binding:"required"`
	Amount           int64  `json:"amount" binding:"required"`
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

	// For simplicity, we are not implementing a separate mempool here.
	// The transaction is directly added to be mined.
	// In a real system, this would go to a mempool.
	h.bcSvc.AddTransactionToMempool(tx)

	c.JSON(202, gin.H{
		"message": "Transaction created and sent to mempool",
		"tx_hash": tx.IDHex(),
	})
}

type MineBlockRequest struct {
	MinerAddress string `json:"miner_address" binding:"required"`
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

// --- Stats Handlers ---

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
