require("dotenv").config();

const db = require("./config/db");

async function checkBookings() {
  try {
    console.log("=================================");
    console.log("CHECKING DATABASE");
    console.log("=================================");

    const [database] = await db.execute(
      "SELECT DATABASE() AS database_name"
    );

    console.log("Database:", database);

    const [columns] = await db.execute(
      "DESCRIBE bookings"
    );

    console.log("Bookings columns:");
    console.table(columns);

    const [tables] = await db.execute(
      "SHOW TABLES"
    );

    console.log("Tables:");
    console.table(tables);

    process.exit(0);

  } catch (error) {
    console.error("DATABASE CHECK ERROR");
    console.error(error);
    process.exit(1);
  }
}

checkBookings();