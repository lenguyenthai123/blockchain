package services

import (
	"errors"
	"math/rand"
	"mycoin-backend/models"
	"mycoin-backend/utils"
	"time"

	"gorm.io/gorm"
)

type TransactionService struct {
	db *gorm.DB
}

type TransactionResponse struct {
	Hash      string  `json:"hash"`
	From      string  `json:"from"`
	To        string  `json:"to"`
	Value     float64 `json:"value"`
	Timestamp int64   `json:"timestamp"`
}

func NewTransactionService(db *gorm.DB) *TransactionService {
	return &TransactionService{db: db}
}

func (s *TransactionService) SendTransaction(from, to string, amount float64, gasPrice int64, message, privateKey string) (string, error) {
	// Verify wallet balance
	var wallet models.Wallet
	if err := s.db.Where("address = ?", from).First(&wallet).Error; err != nil {
		return "", errors.New("wallet not found")
	}

	fee := s.calculateFee(gasPrice)
	if wallet.Balance < amount+fee {
		return "", errors.New("insufficient balance")
	}

	// Create transaction
	txHash := utils.GenerateTransactionHash()
	tx := &models.Transaction{
		TxHash:         txHash,
		FromAddress:    from,
		ToAddress:      to,
		Value:          amount,
		GasPrice:       gasPrice,
		GasLimit:       21000,
		GasUsed:        21000,
		TransactionFee: fee,
		Status:         "pending",
		Message:        message,
		Timestamp:      time.Now().Unix(),
	}

	if err := s.db.Create(tx).Error; err != nil {
		return "", err
	}

	// Update wallet balance
	wallet.Balance -= (amount + fee)
	s.db.Save(&wallet)

	// Update recipient balance
	var recipientWallet models.Wallet
	if err := s.db.Where("address = ?", to).First(&recipientWallet).Error; err != nil {
		// Create recipient wallet if it doesn't exist
		recipientWallet = models.Wallet{
			Address: to,
			Balance: amount,
			Nonce:   0,
		}
		s.db.Create(&recipientWallet)
	} else {
		recipientWallet.Balance += amount
		s.db.Save(&recipientWallet)
	}

	// Simulate confirmation after delay
	go s.confirmTransaction(txHash)

	return txHash, nil
}

func (s *TransactionService) EstimateFee(to string, amount float64, gasPrice int64) (float64, error) {
	return s.calculateFee(gasPrice), nil
}

func (s *TransactionService) GetLatestTransactions(limit int) ([]TransactionResponse, error) {
	var transactions []models.Transaction
	if err := s.db.Order("timestamp DESC").Limit(limit).Find(&transactions).Error; err != nil {
		return nil, err
	}

	var response []TransactionResponse
	for _, tx := range transactions {
		response = append(response, TransactionResponse{
			Hash:      tx.TxHash,
			From:      tx.FromAddress,
			To:        tx.ToAddress,
			Value:     tx.Value,
			Timestamp: tx.Timestamp,
		})
	}

	// Generate sample data if no transactions exist
	if len(response) == 0 {
		for i := 0; i < limit; i++ {
			response = append(response, TransactionResponse{
				Hash:      "0x" + generateRandomHex(64),
				From:      "0x" + generateRandomHex(40),
				To:        "0x" + generateRandomHex(40),
				Value:     rand.Float64() * 10,
				Timestamp: time.Now().Unix() - int64(i*17),
			})
		}
	}

	return response, nil
}

func (s *TransactionService) GetTransaction(hash string) (*models.Transaction, error) {
	var transaction models.Transaction
	if err := s.db.Where("tx_hash = ?", hash).First(&transaction).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

func (s *TransactionService) GetTransactionHistory(address string, limit int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	if err := s.db.Where("from_address = ? OR to_address = ?", address, address).
		Order("timestamp DESC").Limit(limit).Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}

func (s *TransactionService) calculateFee(gasPrice int64) float64 {
	gasLimit := int64(21000)
	return float64(gasPrice*gasLimit) / 1e9
}

func (s *TransactionService) confirmTransaction(txHash string) {
	// Simulate network confirmation delay
	time.Sleep(time.Duration(rand.Intn(5)+2) * time.Second)

	var tx models.Transaction
	if err := s.db.Where("tx_hash = ?", txHash).First(&tx).Error; err != nil {
		return
	}

	tx.Status = "confirmed"
	s.db.Save(&tx)
}
