package service

import (
	"context"
	"sancoin/internal/model"
	"sancoin/internal/repository"
)

type WalletService struct {
	repo repository.Repository
}

func NewWalletService(repo repository.Repository) *WalletService {
	return &WalletService{repo: repo}
}

func (s *WalletService) GetBalance(ctx context.Context, address string) (int64, []model.UTXO, error) {
	utxos, err := s.repo.FindUTXOs(ctx, address)
	if err != nil {
		return 0, nil, err
	}

	var balance int64
	for _, utxo := range utxos {
		balance += utxo.Amount
	}

	return balance, utxos, nil
}
