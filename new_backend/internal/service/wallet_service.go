package service

import (
	"context"
	"fmt"
	"sancoin/internal/core"
	"sancoin/internal/model"
	"sancoin/internal/repository"

	"github.com/tyler-smith/go-bip39"
)

type WalletService struct {
	repo repository.Repository
}

func NewWalletService(repo repository.Repository) *WalletService {
	return &WalletService{repo: repo}
}

// GenerateNewWallet creates a brand new wallet with a new mnemonic.
func (s *WalletService) GenerateNewWallet() (*core.Wallet, string, error) {
	// Changed from 128 to 256 bits for a 24-word mnemonic
	entropy, err := bip39.NewEntropy(256)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate entropy: %w", err)
	}
	mnemonic, err := bip39.NewMnemonic(entropy)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate mnemonic: %w", err)
	}

	// For new wallets, we use an empty string as the BIP39 passphrase.
	// The user's "password" is for encryption, not key generation.
	wallet, err := s.CreateWalletFromMnemonic(mnemonic, "")
	if err != nil {
		return nil, "", err
	}

	return wallet, mnemonic, nil
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

// CreateWalletFromMnemonic creates a wallet from a mnemonic phrase and an optional BIP39 passphrase.
func (s *WalletService) CreateWalletFromMnemonic(mnemonic, passphrase string) (*core.Wallet, error) {
	if !bip39.IsMnemonicValid(mnemonic) {
		return nil, fmt.Errorf("invalid mnemonic phrase")
	}

	seed := bip39.NewSeed(mnemonic, passphrase)
	wallet, err := core.NewWalletFromSeed(seed)
	if err != nil {
		return nil, fmt.Errorf("failed to create wallet from seed: %w", err)
	}

	return wallet, nil
}
