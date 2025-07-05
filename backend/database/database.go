package database

import (
	"fmt"
	"log"
	"mycoin-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	// Configure GORM with proper settings for Neon
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	// Connect to Neon database
	db, err := gorm.Open(postgres.Open(databaseURL), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Get underlying SQL DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Configure connection pool for Neon
	sqlDB.SetMaxOpenConns(25)   // Maximum number of open connections
	sqlDB.SetMaxIdleConns(5)    // Maximum number of idle connections
	sqlDB.SetConnMaxLifetime(0) // Maximum amount of time a connection may be reused

	// Test the connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Successfully connected to Neon database")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("🔄 Running database migrations...")

	err := db.AutoMigrate(
		&models.Wallet{},
		&models.Block{},
		&models.Transaction{},
		&models.MiningStats{},
		&models.StakingPool{},
		&models.UserStake{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Println("✅ Database migrations completed successfully")

	// Seed initial data if tables are empty
	if err := seedInitialData(db); err != nil {
		log.Printf("⚠️ Warning: Failed to seed initial data: %v", err)
	}

	return nil
}

func seedInitialData(db *gorm.DB) error {
	// Check if genesis block exists
	var blockCount int64
	db.Model(&models.Block{}).Count(&blockCount)

	if blockCount == 0 {
		log.Println("🌱 Seeding genesis block...")
		genesisBlock := &models.Block{
			BlockNumber:  0,
			BlockHash:    "0x0000000000000000000000000000000000000000000000000000000000000000",
			PreviousHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
			Timestamp:    1640995200, // 2022-01-01 00:00:00 UTC
			Nonce:        0,
			Difficulty:   4,
			MinerAddress: "0x0000000000000000000000000000000000000000",
		}

		if err := db.Create(genesisBlock).Error; err != nil {
			return fmt.Errorf("failed to create genesis block: %w", err)
		}
	}

	// Check if default staking pool exists
	var poolCount int64
	db.Model(&models.StakingPool{}).Count(&poolCount)

	if poolCount == 0 {
		log.Println("🌱 Seeding default staking pool...")
		defaultPool := &models.StakingPool{
			PoolAddress:  "0x1111111111111111111111111111111111111111",
			TotalStaked:  0,
			RewardRate:   0.05,
			MinimumStake: 1,
			Active:       true,
		}

		if err := db.Create(defaultPool).Error; err != nil {
			return fmt.Errorf("failed to create default staking pool: %w", err)
		}
	}

	return nil
}
