package config

import (
	"os"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgresql://neondb_owner:npg_XcZWPD6u2Cjh@ep-young-union-a1i53myc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
