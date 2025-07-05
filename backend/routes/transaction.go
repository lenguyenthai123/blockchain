package routes

import (
	"net/http"
	"strconv"
	"mycoin-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupTransactionRoutes(router *gin.RouterGroup, db *gorm.DB) {
	transactionService := services.NewTransactionService(db)
	
	transaction := router.Group("/transaction")
	{
		transaction.POST("/send", sendTransaction(transactionService))
		transaction.POST("/estimate-fee", estimateFee(transactionService))
		transaction.GET("/latest", getLatestTransactions(transactionService))
		transaction.GET("/:hash", getTransaction(transactionService))
		transaction.GET("/history/:address", getTransactionHistory(transactionService))
	}
}

type SendTransactionRequest struct {
	From       string  `json:"from" binding:"required"`
	To         string  `json:"to" binding:"required"`
	Amount     float64 `json:"amount" binding:"required"`
	GasPrice   int64   `json:"gas_price" binding:"required"`
	Message    string  `json:"message"`
	PrivateKey string  `json:"private_key" binding:"required"`
}

type EstimateFeeRequest struct {
	To       string  `json:"to" binding:"required"`
	Amount   float64 `json:"amount" binding:"required"`
	GasPrice int64   `json:"gas_price" binding:"required"`
}

func sendTransaction(service *services.TransactionService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SendTransactionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		txHash, err := service.SendTransaction(req.From, req.To, req.Amount, req.GasPrice, req.Message, req.PrivateKey)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"transaction_hash": txHash})
	}
}

func estimateFee(service *services.TransactionService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req EstimateFeeRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		fee, err := service.EstimateFee(req.To, req.Amount, req.GasPrice)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"estimated_fee": fee})
	}
}

func getLatestTransactions(service *services.TransactionService) gin.HandlerFunc {
	return func(c *gin.Context) {
		limitStr := c.DefaultQuery("limit", "6")
		limit, _ := strconv.Atoi(limitStr)

		transactions, err := service.GetLatestTransactions(limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, transactions)
	}
}

func getTransaction(service *services.TransactionService) gin.HandlerFunc {
	return func(c *gin.Context) {
		hash := c.Param("hash")

		transaction, err := service.GetTransaction(hash)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
			return
		}

		c.JSON(http.StatusOK, transaction)
	}
}

func getTransactionHistory(service *services.TransactionService) gin.HandlerFunc {
	return func(c *gin.Context) {
		address := c.Param("address")
		limitStr := c.DefaultQuery("limit", "50")
		limit, _ := strconv.Atoi(limitStr)

		transactions, err := service.GetTransactionHistory(address, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, transactions)
	}
}
