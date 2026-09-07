import "dotenv/config";
import app from "./app.js";
import pool from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash, created_at, updated_at FROM users LIMIT 1"
    );

    console.log("PostgreSQL connected successfully");
    console.log("Users table accessible");
    console.log(`Current users: ${result.rowCount}`);

    app.listen(PORT, () => {
      console.log(`CloudVault server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL:", error);
    process.exit(1);
  }
};

startServer();