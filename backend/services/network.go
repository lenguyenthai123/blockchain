package services

import (
	"errors"
	"fmt"
	"math/rand"
	"mycoin-backend/models"
	"time"

	"gorm.io/gorm"
)

type NetworkService struct {
	db *gorm.DB
}

type NetworkStatistics struct {
	TotalNodes          int     `json:"total_nodes"`
	ActiveMiners        int     `json:"active_miners"`
	TotalHashRate       string  `json:"total_hash_rate"`
	NetworkDifficulty   int     `json:"network_difficulty"`
	BlockHeight         int     `json:"block_height"`
	AvgBlockTime        string  `json:"avg_block_time"`
	TotalStaked         float64 `json:"total_staked"`
	ActiveStakingPools  int     `json:"active_staking_pools"`
	PendingTransactions int     `json:"pending_transactions"`
	NetworkStatus       string  `json:"network_status"`
}

type MiningResult struct {
	Success     bool    `json:"success"`
	Message     string  `json:"message"`
	BlockHash   string  `json:"block_hash,omitempty"`
	BlockNumber int     `json:"block_number,omitempty"`
	Reward      float64 `json:"reward,omitempty"`
}

func NewNetworkService(db *gorm.DB) *NetworkService {
	return &NetworkService{db: db}
}

func (s *NetworkService) GetNetworkStatistics() (*NetworkStatistics, error) {
	var stats NetworkStatistics

	// Count total blocks (block height)
	var blockCount int64
	s.db.Model(&models.Block{}).Count(&blockCount)
	stats.BlockHeight = int(blockCount)

	// Count active miners
	var minerCount int64
	s.db.Model(&models.MiningStats{}).Where("last_block_time > ?", time.Now().Add(-24*time.Hour)).Count(&minerCount)
	stats.ActiveMiners = int(minerCount)

	// Calculate total hash rate
	var totalHashRate float64
	s.db.Model(&models.MiningStats{}).Select("COALESCE(SUM(hash_rate), 0)").Scan(&totalHashRate)
	stats.TotalHashRate = formatHashRate(totalHashRate)

	// Get network difficulty (from latest block)
	var latestBlock models.Block
	if err := s.db.Order("block_number DESC").First(&latestBlock).Error; err == nil {
		stats.NetworkDifficulty = latestBlock.Difficulty
	} else {
		stats.NetworkDifficulty = 4 // Default difficulty
	}

	// Calculate average block time
	stats.AvgBlockTime = "10.2s" // Simplified for demo

	// Calculate total staked amount
	var totalStaked float64
	s.db.Model(&models.UserStake{}).Where("active = ?", true).Select("COALESCE(SUM(staked_amount), 0)").Scan(&totalStaked)
	stats.TotalStaked = totalStaked

	// Count active staking pools
	var poolCount int64
	s.db.Model(&models.StakingPool{}).Where("active = ?", true).Count(&poolCount)
	stats.ActiveStakingPools = int(poolCount)

	// Count pending transactions
	var pendingTxCount int64
	s.db.Model(&models.Transaction{}).Where("status = ?", "pending").Count(&pendingTxCount)
	stats.PendingTransactions = int(pendingTxCount)

	// Set network status
	stats.NetworkStatus = "healthy"
	stats.TotalNodes = 150 // Simulated value

	return &stats, nil
}

func (s *NetworkService) StartMining(minerAddress string, difficulty int) (*MiningResult, error) {
	if difficulty <= 0 {
		difficulty = 4 // Default difficulty
	}

	// Check if miner exists, create if not
	var miner models.MiningStats
	if err := s.db.Where("miner_address = ?", minerAddress).First(&miner).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			miner = models.MiningStats{
				MinerAddress: minerAddress,
				BlocksMined:  0,
				TotalRewards: 0,
				HashRate:     0,
			}
			s.db.Create(&miner)
		} else {
			return nil, err
		}
	}

	// Simulate mining process
	result := &MiningResult{
		Success: true,
		Message: "Mining started successfully",
	}

	// In a real implementation, this would start actual mining
	// For demo, we'll simulate a successful mine
	go s.simulateMining(minerAddress, difficulty)

	return result, nil
}

func (s *NetworkService) simulateMining(minerAddress string, difficulty int) {
	// Simulate mining time (5-15 seconds)
	time.Sleep(time.Duration(5+difficulty) * time.Second)

	// Create a new block
	var latestBlock models.Block
	s.db.Order("block_number DESC").First(&latestBlock)

	newBlock := models.Block{
		BlockNumber:  latestBlock.BlockNumber + 1,
		BlockHash:    generateBlockHash(),
		PreviousHash: latestBlock.BlockHash,
		Timestamp:    time.Now().Unix(),
		Nonce:        generateNonce(),
		Difficulty:   difficulty,
		MinerAddress: minerAddress,
	}

	if err := s.db.Create(&newBlock).Error; err != nil {
		return
	}

	// Update miner stats
	var miner models.MiningStats
	if err := s.db.Where("miner_address = ?", minerAddress).First(&miner).Error; err == nil {
		miner.BlocksMined++
		miner.TotalRewards += 5.0                  // 5 MYC reward per block
		miner.HashRate = rand.Float64()*1000 + 500 // Random hash rate for demo
		miner.LastBlockTime = time.Now()           // ✅ Sửa lỗi: gán trực tiếp time.Time thay vì pointer
		s.db.Save(&miner)
	}

	// Update miner wallet balance
	var wallet models.Wallet
	if err := s.db.Where("address = ?", minerAddress).First(&wallet).Error; err == nil {
		wallet.Balance += 5.0
		s.db.Save(&wallet)
	} else {
		// Create wallet if it doesn't exist
		wallet = models.Wallet{
			Address: minerAddress,
			Balance: 5.0,
			Nonce:   0,
		}
		s.db.Create(&wallet)
	}
}

func (s *NetworkService) CreateStake(userAddress string, poolID uint, stakedAmount float64) (*models.UserStake, error) {
	// Validate staking pool
	var pool models.StakingPool
	if err := s.db.Where("id = ? AND active = ?", poolID, true).First(&pool).Error; err != nil {
		return nil, errors.New("staking pool not found or inactive")
	}

	// Check minimum stake amount
	if stakedAmount < pool.MinimumStake {
		return nil, errors.New("stake amount below minimum required")
	}

	// Check user wallet balance
	var wallet models.Wallet
	if err := s.db.Where("address = ?", userAddress).First(&wallet).Error; err != nil {
		return nil, errors.New("wallet not found")
	}

	if wallet.Balance < stakedAmount {
		return nil, errors.New("insufficient balance")
	}

	// Create stake
	stake := &models.UserStake{
		UserAddress:    userAddress,
		PoolID:         poolID,
		StakedAmount:   stakedAmount,
		RewardsEarned:  0,
		StakeTimestamp: time.Now().Unix(),
		Active:         true,
	}

	if err := s.db.Create(stake).Error; err != nil {
		return nil, err
	}

	// Update wallet balance
	wallet.Balance -= stakedAmount
	s.db.Save(&wallet)

	// Update pool total staked
	pool.TotalStaked += stakedAmount
	s.db.Save(&pool)

	return stake, nil
}

func (s *NetworkService) GetMiningStats(minerAddress string) (interface{}, error) {
	if minerAddress != "" {
		// Get specific miner stats
		var miner models.MiningStats
		if err := s.db.Where("miner_address = ?", minerAddress).First(&miner).Error; err != nil {
			return nil, errors.New("miner not found")
		}
		return miner, nil
	}

	// Get all miners stats
	var miners []models.MiningStats
	if err := s.db.Order("total_rewards DESC").Find(&miners).Error; err != nil {
		return nil, err
	}

	return miners, nil
}

func (s *NetworkService) GetStakingPools() ([]models.StakingPool, error) {
	var pools []models.StakingPool
	if err := s.db.Where("active = ?", true).Find(&pools).Error; err != nil {
		return nil, err
	}

	return pools, nil
}

// Helper functions
func formatHashRate(hashRate float64) string {
	if hashRate >= 1000000000000 { // TH/s
		return fmt.Sprintf("%.2f TH/s", hashRate/1000000000000)
	} else if hashRate >= 1000000000 { // GH/s
		return fmt.Sprintf("%.2f GH/s", hashRate/1000000000)
	} else if hashRate >= 1000000 { // MH/s
		return fmt.Sprintf("%.2f MH/s", hashRate/1000000)
	} else if hashRate >= 1000 { // KH/s
		return fmt.Sprintf("%.2f KH/s", hashRate/1000)
	}
	return fmt.Sprintf("%.2f H/s", hashRate)
}

func generateBlockHash() string {
	// Simplified block hash generation
	return "0x" + generateRandomHex(64)
}

func generateNonce() int {
	return rand.Intn(1000000)
}

func generateRandomHex(length int) string {
	const charset = "0123456789abcdef"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
