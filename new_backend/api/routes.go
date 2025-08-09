package api

import (
	"github.com/gin-gonic/gin"
)

// SetupRoutes configures the API routes
func SetupRoutes(router *gin.Engine, h *Handler) {
	apiV1 := router.Group("/api/v1")
	{
		// Stats routes
		statsGroup := apiV1.Group("/stats")
		{
			statsGroup.GET("/summary", h.GetStatsSummary)
		}

		// Wallet routes
		walletGroup := apiV1.Group("/wallet")
		{
			walletGroup.POST("/create", h.CreateWallet)
			walletGroup.POST("/restore", h.RestoreWallet)
			walletGroup.POST("/unlock", h.UnlockWallet)
			walletGroup.GET("/:address/balance", h.GetWalletBalance)
		}

		// Transaction routes
		txGroup := apiV1.Group("/transactions")
		{
			// The new endpoint for broadcasting a pre-signed transaction
			txGroup.POST("/broadcast", h.BroadcastTransaction)
			txGroup.GET("/latest", h.GetLatestTransactions)
		}

		// Blockchain routes
		bcGroup := apiV1.Group("/blockchain")
		{
			bcGroup.POST("/mine", h.MineBlock)
		}

		apiV1.GET("/blocks/latest", h.GetLatestBlocks)
	}
}
