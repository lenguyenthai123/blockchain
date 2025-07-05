package main

import (
	"log"
	"mycoin-backend/config"
	"mycoin-backend/database"
	"mycoin-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	log.Println("🚀 Starting MyCoin Backend Server...")

	// Load configuration
	cfg := config.Load()
	log.Printf("📊 Server will run on port: %s", cfg.Port)

	// Initialize database
	log.Println("🔌 Connecting to Neon database...")
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatal("❌ Failed to run migrations:", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "https://your-frontend-domain.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Setup routes
	api := r.Group("/api/v1")
	routes.SetupWalletRoutes(api, db)
	routes.SetupBlockchainRoutes(api, db)
	routes.SetupTransactionRoutes(api, db)
	routes.SetupNetworkRoutes(api, db)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "ok",
			"message":   "MyCoin Backend is running",
			"database":  "connected",
			"timestamp": "2024-01-01T00:00:00Z",
		})
	})

	// API info endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"name":        "MyCoin API",
			"version":     "1.0.0",
			"description": "MyCoin Blockchain Backend API",
			"endpoints": gin.H{
				"health":      "/health",
				"wallet":      "/api/v1/wallet/*",
				"blockchain":  "/api/v1/blockchain/*",
				"transaction": "/api/v1/transaction/*",
				"network":     "/api/v1/network/*",
			},
		})
	})

	log.Printf("🎉 Server starting on port %s", cfg.Port)
	log.Printf("🔗 Health check: http://localhost:%s/health", cfg.Port)
	log.Printf("📚 API docs: http://localhost:%s/", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("❌ Failed to start server:", err)
	}
}
