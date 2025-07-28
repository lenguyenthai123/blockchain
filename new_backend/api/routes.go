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
			walletGroup.POST("", h.CreateWallet)
			walletGroup.GET("/:address/balance", h.GetWalletBalance)
		}

		// Transaction routes
		txGroup := apiV1.Group("/transactions")
		{
			txGroup.POST("", h.CreateTransaction)
			txGroup.GET("/latest", h.GetLatestTransactions)
			// txGroup.GET("/:hash", h.GetTransaction) // TODO: Implement
		}

		// Blockchain routes
		bcGroup := apiV1.Group("/blockchain")
		{
			bcGroup.POST("/mine", h.MineBlock)
			// bcGroup.GET("/blocks/:identifier", h.GetBlock) // TODO: Implement
		}
		
		// A more RESTful way for latest blocks
		apiV1.GET("/blocks/latest", h.GetLatestBlocks)
	}
}
