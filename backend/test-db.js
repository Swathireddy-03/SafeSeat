require("dotenv").config();
const mysql = require("mysql2/promise");

async function testDatabase() {
  let connection;

  try {
    console.log("=================================");
    console.log("🔍 TESTING RAILWAY MYSQL + SSL");
    console.log("=================================");

    console.log("Host:", process.env.DB_HOST);
    console.log("Port:", process.env.DB_PORT);
    console.log("User:", process.env.DB_USER);
    console.log("Database:", process.env.DB_NAME);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      connectTimeout: 20000,

      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log("=================================");
    console.log("✅ DATABASE CONNECTED!");
    console.log("=================================");

    const [rows] = await connection.query(
      "SELECT DATABASE() AS database_name, @@hostname AS hostname"
    );

    console.log("Database:", rows[0].database_name);
    console.log("MySQL Host:", rows[0].hostname);

    const [tables] = await connection.query("SHOW TABLES");

    console.log("=================================");
    console.log("📋 TABLES");
    console.log("=================================");

    console.table(tables);

  } catch (error) {
    console.log("=================================");
    console.log("❌ CONNECTION FAILED");
    console.log("=================================");

    console.log("Code:", error.code);
    console.log("Message:", error.message);
    console.log("System Call:", error.syscall);
    console.log("Full Error:", error);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabase();