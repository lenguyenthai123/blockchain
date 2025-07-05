package database

import (
	"mycoin-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.Wallet{},
		&models.Block{},
		&models.Transaction{},
		&models.MiningStats{},
		&models.StakingPool{},
		&models.UserStake{},
	)
}
