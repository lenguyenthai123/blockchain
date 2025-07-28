package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"sancoin/api"
	"sancoin/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

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

	// Run migrations
	// In a real app, use a migration tool like goose or migrate
	sqlFile, err := os.ReadFile("scripts/001_init_schema.sql")
	if err != nil {
		log.Fatalf("Could not read migration file: %v", err)
	}
	_, err = dbpool.Exec(context.Background(), string(sqlFile))
	if err != nil {
		log.Printf("Warning: Could not apply migrations, might already exist: %v", err)
	} else {
		fmt.Println("Database schema initialized.")
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
