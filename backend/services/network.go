package services

import (
	"mycoin-backend/models"
	"time"

	"gorm.io/gorm"
)

type NetworkService struct {
	db *gorm.DB
}

func NewNetworkService(db *gorm.DB) *NetworkService {
	return &NetworkService{db: db}
}

func (s *NetworkService) GetNetworkStats() (*NetworkStats, error) {
	var blockCount int64
	s.db.Model(&models.Block{}).Count(&blockCount)

	var txCount int64
	s.db.Model(&models.Transaction{}).Count(&txCount)

	return &NetworkStats{
		HashRate:             "1.2",
		BlockHeight:          int(blockCount),
		AvgBlockTime:         "10.2",
		Difficulty:           4,
		GasPrice:             15,
		TotalTransactions:    "2,847.61",
		TPS:                  "18.2",
		LastFinalizedBlock:   "22817956",
		LastSafeBlock:        "22817988",
	}, nil
}

func (s *NetworkService) CreateStake(userAddress string, poolID uint, stakedAmount float64) (*models.UserStake, error) {
	stake := &models.UserStake{
		UserAddress:     userAddress,
		PoolID:          poolID,
		StakedAmount:    stakedAmount,
		RewardsEarned:   0,
		StakeTimestamp:  time.Now().Unix(),
		Active:          true,
	}

	if err := s.db.Create(stake).Error; err != nil {
		return nil, err
	}

	return stake, nil
}
