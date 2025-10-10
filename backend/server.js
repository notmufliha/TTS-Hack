//anna was here
//Sanmita was here

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
// const routes = require("./routes/routers");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;
const path = require("path");

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOSTNAME,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Node.js API Test" });
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, created_at, is_active FROM users ORDER BY created_at DESC"
    );
    res.json({
      success: true,
      count: result.rowCount,
      users: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
