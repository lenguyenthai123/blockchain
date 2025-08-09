const { Pool } = require("pg")

// Parse DATABASE_URL if provided
let config
if (process.env.DATABASE_URL) {
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
} else {
  // Fallback to individual environment variables
  config = {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "sancoin",
    password: process.env.DB_PASSWORD || "password",
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  }
}

const pool = new Pool(config)

// Test connection with better error handling
pool.on("connect", (client) => {
  console.log("✅ Connected to PostgreSQL database")
})

pool.on("error", (err, client) => {
  console.error("❌ Unexpected error on idle client:", err)
  console.error("Database connection details:", {
    host: config.host || "from connection string",
    database: config.database || "from connection string",
    port: config.port || "from connection string",
  })
})

// Test connection function
const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log("🔍 Database connection test successful")
    const result = await client.query("SELECT NOW()")
    console.log("📅 Database time:", result.rows[0].now)
    client.release()
    return true
  } catch (error) {
    console.error("❌ Database connection test failed:")
    console.error("Error code:", error.code)
    console.error("Error message:", error.message)

    if (error.code === "ECONNREFUSED") {
      console.error("🔧 Possible solutions:")
      console.error("1. Check if PostgreSQL is running")
      console.error("2. Verify DATABASE_URL in .env file")
      console.error("3. Check network connectivity")
      console.error("4. Verify SSL settings")
    }

    return false
  }
}

module.exports = { pool, testConnection }
