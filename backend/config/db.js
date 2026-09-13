const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Aiven MySQL requires SSL
  ssl: {
    rejectUnauthorized: false,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

async function testConnection() {
  let connection;

  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      "SELECT DATABASE() AS database_name, @@hostname AS hostname"
    );

    console.log("=================================");
    console.log("✅ DATABASE CONNECTED");
    console.log("Database:", rows[0].database_name);
    console.log("Host:", rows[0].hostname);
    console.log("=================================");

    const [columns] = await connection.query(
      "SHOW COLUMNS FROM bookings"
    );

    console.log("📋 BOOKINGS COLUMNS:");
    console.log(columns.map((column) => column.Field));

  } catch (error) {
    console.error("=================================");
    console.error("❌ DATABASE CONNECTION FAILED");
    console.error("=================================");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

testConnection();

module.exports = db;