package routes

import (
	"mycoin-backend/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupBlockchainRoutes(router *gin.RouterGroup, db *gorm.DB) {
	blockchainService := services.NewBlockchainService(db)

	blockchain := router.Group("/blockchain")
	{
		blockchain.GET("/blocks/latest", getLatestBlocks(blockchainService))
		blockchain.GET("/blocks/:number", getBlock(blockchainService))
		blockchain.GET("/stats", getNetworkStats(blockchainService))
		blockchain.GET("/price", getMyCoinPrice(blockchainService))
	}
}

func getLatestBlocks(service *services.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		limitStr := c.DefaultQuery("limit", "6")
		limit, _ := strconv.Atoi(limitStr)

		blocks, err := service.GetLatestBlocks(limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, blocks)
	}
}

func getBlock(service *services.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		numberStr := c.Param("number")
		number, err := strconv.Atoi(numberStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid block number"})
			return
		}

		block, err := service.GetBlock(number)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Block not found"})
			return
		}

		c.JSON(http.StatusOK, block)
	}
}

func getNetworkStats(service *services.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		stats, err := service.GetNetworkStats()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

func getMyCoinPrice(service *services.BlockchainService) gin.HandlerFunc {
	return func(c *gin.Context) {
		price, err := service.GetMyCoinPrice()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, price)
	}
}
