package service

import (
	"context"
	"sancoin/internal/repository"
)

type StatsService struct {
	repo repository.Repository
}

func NewStatsService(repo repository.Repository) *StatsService {
	return &StatsService{repo: repo}
}

type BlockchainSummary struct {
	SancoinPriceUSD      float64 `json:"sancoin_price_usd"` // Placeholder
	MarketCapUSD         float64 `json:"market_cap_usd"`   // Placeholder
	TotalTransactions    int64   `json:"total_transactions"`
	LastFinalizedBlock   int64   `json:"last_finalized_block"`
	TransactionsPerSecond float64 `json:"transactions_per_second"`
}

func (s *StatsService) GetSummary(ctx context.Context) (*BlockchainSummary, error) {
	stats, err := s.repo.GetStatsSummary(ctx)
	if err != nil {
		return nil, err
	}

	summary := &BlockchainSummary{
		SancoinPriceUSD:      0.0, // In a real app, this would come from an oracle or exchange API
		MarketCapUSD:         0.0, // Calculated from price * total supply
		TotalTransactions:    stats.TotalTransactions,
		LastFinalizedBlock:   stats.LastFinalizedBlock,
		TransactionsPerSecond: stats.TransactionsPerSecond,
	}

	return summary, nil
}

func (s *StatsService) GetLatestBlocks(ctx context.Context, limit int) ([]repository.BlockSummary, error) {
	return s.repo.GetLatestBlocks(ctx, limit)
}

func (s *StatsService) GetLatestTransactions(ctx context.Context, limit int) ([]repository.TransactionSummary, error) {
	return s.repo.GetLatestTransactions(ctx, limit)
}
