package routes

import (
	"mycoin-backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupNetworkRoutes(router *gin.RouterGroup, db *gorm.DB) {
	networkService := services.NewNetworkService(db)

	network := router.Group("/network")
	{
		network.GET("/stats", getNetworkStatistics(networkService)) // Đổi tên để tránh xung đột
		network.POST("/mine", startMining(networkService))
		network.POST("/stake", createStake(networkService))
		network.GET("/mining-stats", getMiningStats(networkService))   // Thêm endpoint mới
		network.GET("/staking-pools", getStakingPools(networkService)) // Thêm endpoint mới
	}
}

type CreateStakeRequest struct {
	UserAddress  string  `json:"user_address" binding:"required"`
	PoolID       uint    `json:"pool_id" binding:"required"`
	StakedAmount float64 `json:"staked_amount" binding:"required"`
}

type StartMiningRequest struct {
	MinerAddress string `json:"miner_address" binding:"required"`
	Difficulty   int    `json:"difficulty"`
}

// Đổi tên function để tránh xung đột với blockchain.go
func getNetworkStatistics(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		stats, err := service.GetNetworkStatistics()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

func startMining(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req StartMiningRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		result, err := service.StartMining(req.MinerAddress, req.Difficulty)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
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

func getMiningStats(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		minerAddress := c.Query("miner_address")

		stats, err := service.GetMiningStats(minerAddress)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, stats)
	}
}

func getStakingPools(service *services.NetworkService) gin.HandlerFunc {
	return func(c *gin.Context) {
		pools, err := service.GetStakingPools()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, pools)
	}
}
