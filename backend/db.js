const { Pool } = require("pg");
require("dotenv").config();

// PostgreSQL Bağlantı Havuzu (Connection Pool)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Bağlantı Testi
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Veritabanına bağlanırken hata oluştu:", err.stack);
  }
  console.log("PostgreSQL Veritabanına başarıyla bağlandı!");
  release();
});

module.exports = pool;
