package services

import (
	"math/rand"
	"mycoin-backend/models"
	"time"

	"gorm.io/gorm"
)

type BlockchainService struct {
	db *gorm.DB
}

type NetworkStats struct {
	HashRate             string `json:"hash_rate"`
	BlockHeight          int    `json:"block_height"`
	AvgBlockTime         string `json:"avg_block_time"`
	Difficulty           int    `json:"difficulty"`
	GasPrice             int    `json:"gas_price"`
	TotalTransactions    string `json:"total_transactions"`
	TPS                  string `json:"tps"`
	LastFinalizedBlock   string `json:"last_finalized_block"`
	LastSafeBlock        string `json:"last_safe_block"`
}

type PriceData struct {
	Price         string `json:"price"`
	Change        float64 `json:"change"`
	ChangePercent string `json:"change_percent"`
	MarketCap     string `json:"market_cap"`
}

type BlockResponse struct {
	Number           int     `json:"number"`
	Timestamp        int64   `json:"timestamp"`
	Miner            string  `json:"miner"`
	TransactionCount int     `json:"transaction_count"`
	Reward           string  `json:"reward"`
}

func NewBlockchainService(db *gorm.DB) *BlockchainService {
	return &BlockchainService{db: db}
}

func (s *BlockchainService) GetLatestBlocks(limit int) ([]BlockResponse, error) {
	var blocks []models.Block
	if err := s.db.Preload("Transactions").Order("block_number DESC").Limit(limit).Find(&blocks).Error; err != nil {
		return nil, err
	}

	var response []BlockResponse
	for _, block := range blocks {
		response = append(response, BlockResponse{
			Number:           block.BlockNumber,
			Timestamp:        block.Timestamp,
			Miner:            block.MinerAddress,
			TransactionCount: len(block.Transactions),
			Reward:           "5.0000", // Fixed reward for demo
		})
	}

	// If no blocks in DB, generate sample data
	if len(response) == 0 {
		for i := 0; i < limit; i++ {
			response = append(response, BlockResponse{
				Number:           22817956 - i,
				Timestamp:        time.Now().Unix() - int64(i*12),
				Miner:            "0x" + generateRandomHex(40),
				TransactionCount: rand.Intn(300) + 50,
				Reward:           "5.0000",
			})
		}
	}

	return response, nil
}

func (s *BlockchainService) GetBlock(number int) (*models.Block, error) {
	var block models.Block
	if err := s.db.Preload("Transactions").Where("block_number = ?", number).First(&block).Error; err != nil {
		return nil, err
	}

	return &block, nil
}

func (s *BlockchainService) GetNetworkStats() (*NetworkStats, error) {
	var blockCount int64
	s.db.Model(&models.Block{}).Count(&blockCount)

	var txCount int64
	s.db.Model(&models.Transaction{}).Count(&txCount)

	return &NetworkStats{
		HashRate:             "1.2",
		BlockHeight:          int(blockCount),
		AvgBlockTime:         "10.2",
		Difficulty:           4,
		GasPrice:             rand.Intn(10) + 10,
		TotalTransactions:    "2,847.61",
		TPS:                  "18.2",
		LastFinalizedBlock:   "22817956",
		LastSafeBlock:        "22817988",
	}, nil
}

func (s *BlockchainService) GetMyCoinPrice() (*PriceData, error) {
	change := rand.Float64()*10 - 5
	return &PriceData{
		Price:         "12.45",
		Change:        change,
		ChangePercent: "+2.15",
		MarketCap:     "298,054,191,819",
	}, nil
}

func generateRandomHex(length int) string {
	const charset = "0123456789abcdef"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
