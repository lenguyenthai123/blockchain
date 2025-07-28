package core

import "context"

// TransactionFinder định nghĩa interface để tìm một giao dịch.
// Interface này được sử dụng để phá vỡ vòng lặp import giữa 'core' và 'repository'.
type TransactionFinder interface {
	FindTransaction(ctx context.Context, txID []byte) (*Transaction, error)
}
