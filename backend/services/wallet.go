package services

import (
	"errors"
	"math/rand"
	"mycoin-backend/models"
	"mycoin-backend/utils"
	"time"

	"gorm.io/gorm"
)

type WalletService struct {
	db *gorm.DB
}

type WalletResponse struct {
	Address    string    `json:"address"`
	PrivateKey string    `json:"private_key"`
	Mnemonic   string    `json:"mnemonic"`
	CreatedAt  time.Time `json:"created_at"`
}

type WalletStats struct {
	TotalTransactions int     `json:"total_transactions"`
	TotalSent         float64 `json:"total_sent"`
	TotalReceived     float64 `json:"total_received"`
	FirstTransaction  *string `json:"first_transaction"`
}

func NewWalletService(db *gorm.DB) *WalletService {
	return &WalletService{db: db}
}

func (s *WalletService) CreateWallet(password string) (*WalletResponse, error) {
	privateKey := utils.GeneratePrivateKey()
	address := utils.PrivateKeyToAddress(privateKey)
	mnemonic := utils.GenerateMnemonic()

	// Create wallet in database
	wallet := &models.Wallet{
		Address: address,
		Balance: 0, // Random initial balance for demo
		Nonce:   0,
	}

	if err := s.db.Create(wallet).Error; err != nil {
		return nil, err
	}

	return &WalletResponse{
		Address:    address,
		PrivateKey: privateKey,
		Mnemonic:   mnemonic,
		CreatedAt:  wallet.CreatedAt,
	}, nil
}

func (s *WalletService) ImportFromPrivateKey(privateKey, password string) (*WalletResponse, error) {
	if len(privateKey) != 64 {
		return nil, errors.New("invalid private key")
	}

	address := utils.PrivateKeyToAddress(privateKey)

	// Check if wallet already exists
	var existingWallet models.Wallet
	if err := s.db.Where("address = ?", address).First(&existingWallet).Error; err == nil {
		return &WalletResponse{
			Address:    address,
			PrivateKey: privateKey,
			CreatedAt:  existingWallet.CreatedAt,
		}, nil
	}

	// Create new wallet
	wallet := &models.Wallet{
		Address: address,
		Balance: rand.Float64()*100 + 10,
		Nonce:   0,
	}

	if err := s.db.Create(wallet).Error; err != nil {
		return nil, err
	}

	return &WalletResponse{
		Address:    address,
		PrivateKey: privateKey,
		CreatedAt:  wallet.CreatedAt,
	}, nil
}

func (s *WalletService) ImportFromMnemonic(mnemonic, password string) (*WalletResponse, error) {
	privateKey, err := utils.MnemonicToPrivateKey(mnemonic)
	if err != nil {
		return nil, err
	}

	return s.ImportFromPrivateKey(privateKey, password)
}

func (s *WalletService) GetBalance(address string) (float64, error) {
	var wallet models.Wallet
	if err := s.db.Where("address = ?", address).First(&wallet).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create wallet if it doesn't exist
			wallet = models.Wallet{
				Address: address,
				Balance: 0,
				Nonce:   0,
			}
			if err := s.db.Create(&wallet).Error; err != nil {
				return 0, err
			}
		} else {
			return 0, err
		}
	}

	return wallet.Balance, nil
}

func (s *WalletService) GetStats(address string) (*WalletStats, error) {
	var stats WalletStats

	// Count total transactions
	var totalTx int64
	s.db.Model(&models.Transaction{}).Where("from_address = ? OR to_address = ?", address, address).Count(&totalTx)
	stats.TotalTransactions = int(totalTx)

	// Calculate total sent
	var totalSent float64
	s.db.Model(&models.Transaction{}).Where("from_address = ? AND status = ?", address, "confirmed").Select("COALESCE(SUM(value), 0)").Scan(&totalSent)
	stats.TotalSent = totalSent

	// Calculate total received
	var totalReceived float64
	s.db.Model(&models.Transaction{}).Where("to_address = ? AND status = ?", address, "confirmed").Select("COALESCE(SUM(value), 0)").Scan(&totalReceived)
	stats.TotalReceived = totalReceived

	// Get first transaction date
	var firstTx models.Transaction
	if err := s.db.Where("from_address = ? OR to_address = ?", address, address).Order("timestamp ASC").First(&firstTx).Error; err == nil {
		firstDate := time.Unix(firstTx.Timestamp, 0).Format("2006-01-02")
		stats.FirstTransaction = &firstDate
	}

	return &stats, nil
}
