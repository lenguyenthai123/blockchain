require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const winston = require("winston")

const UTXOBlockchain = require("./core/UTXOBlockchain")
const blockchainRoutes = require("./routes/blockchain")
const utxoRoutes = require("./routes/utxo-blockchain")
const { generalLimit, transactionLimit, miningLimit } = require("./middleware/security")
const createTables = require("./database/migrate")
const { testConnection } = require("./database/config")

// Initialize UTXO blockchain
const sanCoinBlockchain = new UTXOBlockchain()

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "sancoin-utxo-backend" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  )
}

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Rate limiting
app.use("/api/", generalLimit)
app.use("/api/blockchain/transaction", transactionLimit)
app.use("/api/blockchain/utxo-transaction", transactionLimit)
app.use("/api/blockchain/mine", miningLimit)

// Blockchain middleware
app.use((req, res, next) => {
  req.blockchain = sanCoinBlockchain
  req.logger = logger
  next()
})

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })
  next()
})

// Health check
app.get("/health", async (req, res) => {
  const dbConnected = await testConnection()

  res.json({
    success: true,
    message: "SanCoin UTXO Blockchain Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: dbConnected ? "connected" : "disconnected",
    model: "UTXO",
  })
})

// API Health check
app.get("/api/health", async (req, res) => {
  const dbConnected = await testConnection()

  res.json({
    success: true,
    data: {
      message: "SanCoin API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: dbConnected ? "connected" : "disconnected",
      model: "UTXO",
    },
  })
})

// Routes
app.use("/api/blockchain", blockchainRoutes)
app.use("/api/blockchain", utxoRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error)

  res.status(500).json({
    success: false,
    error: "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  })
})

// Initialize database and start server
async function startServer() {
  try {
    console.log("🚀 Starting SanCoin UTXO Blockchain Backend...")
    console.log("📊 Environment:", process.env.NODE_ENV || "development")

    // Test database connection first
    console.log("🔍 Testing database connection...")
    const dbConnected = await testConnection()

    if (!dbConnected) {
      console.error("❌ Cannot start server without database connection")
      console.error("🔧 Please check:")
      console.error("1. DATABASE_URL in .env file")
      console.error("2. Network connectivity to database")
      console.error("3. Database credentials")
      process.exit(1)
    }

    // Create database tables
    await createTables()
    logger.info("UTXO database tables created/verified")

    // Initialize blockchain
    await sanCoinBlockchain.initialize()
    logger.info("UTXO Blockchain initialized")

    // Start server
    app.listen(PORT, () => {
      logger.info(`SanCoin UTXO Blockchain Backend running on port ${PORT}`)
      console.log(`🎉 SanCoin UTXO Blockchain Backend running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
      console.log(`💾 Database: Connected to PostgreSQL`)
      console.log(`🔗 Model: UTXO (Bitcoin-like)`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    console.error("❌ Failed to start server:", error.message)

    if (error.code === "ECONNREFUSED") {
      console.error("🔧 Database connection refused. Please check:")
      console.error("1. DATABASE_URL in .env file")
      console.error("2. Database server is running")
      console.error("3. Network connectivity")
    }

    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully")
  process.exit(0)
})

module.exports = app
