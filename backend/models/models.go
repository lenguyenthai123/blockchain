package models

import (
	"time"

	_ "gorm.io/gorm"
)

type Wallet struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Address   string    `json:"address" gorm:"unique;not null"`
	Balance   float64   `json:"balance" gorm:"default:0"`
	Nonce     int       `json:"nonce" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Block struct {
	ID           uint          `json:"id" gorm:"primaryKey"`
	BlockNumber  int           `json:"block_number" gorm:"unique;not null"`
	BlockHash    string        `json:"block_hash" gorm:"unique;not null"`
	PreviousHash string        `json:"previous_hash" gorm:"not null"`
	Timestamp    int64         `json:"timestamp" gorm:"not null"`
	Nonce        int           `json:"nonce" gorm:"not null"`
	Difficulty   int           `json:"difficulty" gorm:"not null"`
	MinerAddress string        `json:"miner_address" gorm:"not null"`
	Transactions []Transaction `json:"transactions" gorm:"foreignKey:BlockNumber;references:BlockNumber"`
	CreatedAt    time.Time     `json:"created_at"`
}

type Transaction struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	TxHash         string    `json:"tx_hash" gorm:"unique;not null"`
	BlockNumber    *int      `json:"block_number"`
	FromAddress    string    `json:"from_address" gorm:"not null"`
	ToAddress      string    `json:"to_address" gorm:"not null"`
	Value          float64   `json:"value" gorm:"not null"`
	GasPrice       int64     `json:"gas_price" gorm:"not null"`
	GasLimit       int64     `json:"gas_limit" gorm:"not null"`
	GasUsed        int64     `json:"gas_used" gorm:"not null"`
	TransactionFee float64   `json:"transaction_fee" gorm:"not null"`
	Status         string    `json:"status" gorm:"default:'pending'"`
	Message        string    `json:"message"`
	Timestamp      int64     `json:"timestamp" gorm:"not null"`
	CreatedAt      time.Time `json:"created_at"`
}

type MiningStats struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	MinerAddress  string    `json:"miner_address" gorm:"not null"`
	BlocksMined   int       `json:"blocks_mined" gorm:"default:0"`
	TotalRewards  float64   `json:"total_rewards" gorm:"default:0"`
	HashRate      float64   `json:"hash_rate" gorm:"default:0"`
	LastBlockTime time.Time `json:"last_block_time"` // ✅ Đã sửa: time.Time thay vì *time.Time
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type StakingPool struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	PoolAddress  string    `json:"pool_address" gorm:"unique;not null"`
	TotalStaked  float64   `json:"total_staked" gorm:"default:0"`
	RewardRate   float64   `json:"reward_rate" gorm:"default:0.05"`
	MinimumStake float64   `json:"minimum_stake" gorm:"default:1"`
	Active       bool      `json:"active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserStake struct {
	ID              uint        `json:"id" gorm:"primaryKey"`
	UserAddress     string      `json:"user_address" gorm:"not null"`
	PoolID          uint        `json:"pool_id"`
	StakedAmount    float64     `json:"staked_amount" gorm:"not null"`
	RewardsEarned   float64     `json:"rewards_earned" gorm:"default:0"`
	StakeTimestamp  int64       `json:"stake_timestamp" gorm:"not null"`
	LastRewardClaim *int64      `json:"last_reward_claim"`
	Active          bool        `json:"active" gorm:"default:true"`
	CreatedAt       time.Time   `json:"created_at"`
	Pool            StakingPool `json:"pool" gorm:"foreignKey:PoolID"`
}
