package routes

import (
	"mycoin-backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupWalletRoutes(router *gin.RouterGroup, db *gorm.DB) {
	walletService := services.NewWalletService(db)

	wallet := router.Group("/wallet")
	{
		wallet.POST("/create", createWallet(walletService))
		wallet.POST("/import/private-key", importFromPrivateKey(walletService))
		wallet.POST("/import/mnemonic", importFromMnemonic(walletService))
		wallet.GET("/:address/balance", getWalletBalance(walletService))
		wallet.GET("/:address/stats", getWalletStats(walletService))
	}
}

type CreateWalletRequest struct {
	Password string `json:"password" binding:"required"`
}

type ImportPrivateKeyRequest struct {
	PrivateKey string `json:"private_key" binding:"required"`
	Password   string `json:"password" binding:"required"`
}

type ImportMnemonicRequest struct {
	Mnemonic string `json:"mnemonic" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func createWallet(service *services.WalletService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateWalletRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		wallet, err := service.CreateWallet(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, wallet)
	}
}

func importFromPrivateKey(service *services.WalletService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ImportPrivateKeyRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		wallet, err := service.ImportFromPrivateKey(req.PrivateKey, req.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, wallet)
	}
}

func importFromMnemonic(service *services.WalletService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ImportMnemonicRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		wallet, err := service.ImportFromMnemonic(req.Mnemonic, req.Password)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, wallet)
	}
}

func getWalletBalance(service *services.WalletService) gin.HandlerFunc {
	return func(c *gin.Context) {
		address := c.Param("address")

		balance, err := service.GetBalance(address)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"balance": balance})
	}
}

func getWalletStats(service *services.WalletService) gin.HandlerFunc {
	return func(c *gin.Context) {
		address := c.Param("address")

		stats, err := service.GetStats(address)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}
