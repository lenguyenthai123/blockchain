package main

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	"sancoin/api"
	"sancoin/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// 2. Nhúng file SQL vào biến schemaSQL
// Đường dẫn ../../scripts/001_init_schema.sql là đường dẫn tương đối từ file main.go này
// đến file schema.
//
//go:embed scripts/001_init_schema.sql
var schemaSQL []byte

func main() {
	// NOTE: In a real app, use a config file or env variables
	// The user provided this connection string.
	dbURL := "postgresql://neondb_owner:npg_XcZWPD6u2Cjh@ep-young-union-a1i53myc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

	dbpool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbpool.Close()

	fmt.Println("Successfully connected to Neon database!")

	// 3. Sử dụng biến đã được nhúng thay vì đọc file
	fmt.Println("Initializing database schema...")
	_, err = dbpool.Exec(context.Background(), string(schemaSQL))
	if err != nil {
		// Lỗi ở đây có thể xảy ra nếu schema đã tồn tại, nên chúng ta chỉ cảnh báo
		log.Printf("Warning: Could not apply schema, it might already exist: %v", err)
	} else {
		fmt.Println("Database schema initialized successfully.")
	}

	// Setup dependencies
	repo := repository.NewPostgresRepository(dbpool)
	handler := api.NewHandler(repo)

	// Setup Gin router
	router := gin.Default()
	api.SetupRoutes(router, handler)

	fmt.Println("Server is running on port 8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
