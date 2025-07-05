package routes

import (
	"net/http"
	"mycoin-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupNetworkRoutes(router *gin.RouterGroup, db *gorm.DB) {
	networkService := services.NewNetworkService(db)
	
	network := router.Group("/network")
	{
		network.GET("/stats", getNetworkStats(networkService))
		network.POST("/mine", startMining(networkService))
		network.POST("/stake", createStake(networkService))
	}
}

type CreateStakeRequest struct {
	UserAddress  string  `json:"user_address" binding:"required"`
	PoolID       uint    `json:"pool_id" binding:"required"`
	StakedAmount float64 `json:"staked_amount" binding:"required"`
}

func getNetworkStats(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		stats, err := service.GetNetworkStats()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

func startMining(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Mining logic would be implemented here
		c.JSON(http.StatusOK, gin.H{"message": "Mining started"})
	}
}

func createStake(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req CreateStakeRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		stake, err := service.CreateStake(req.UserAddress, req.PoolID, req.StakedAmount)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stake)
	}
}
