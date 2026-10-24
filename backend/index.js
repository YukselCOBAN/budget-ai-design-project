const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Veritabanı bağlantımızı dahil ediyoruz
const pool = require("./db");

const app = express();

// Middleware (Ara yazılımlar)
app.use(cors());
app.use(express.json()); // Frontend'den gelen JSON verilerini okumak için

// -------------------------------------------------------------
// API ENDPOINTS (ROTALAR)
// -------------------------------------------------------------

// 1. Sağlık Kontrolü
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Bütçe AI Backend Sunucusu Çalışıyor!" });
});

// 2. Tüm Kategorileri Getir (GET)
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "Kategoriler alınırken sunucu hatası oluştu." });
  }
});

// 3. Tüm Harcamaları Getir (GET)
app.get("/api/transactions", async (req, res) => {
  try {
    // Harcamaları kategorileriyle birleştirerek (JOIN) getiriyoruz
    const query = `
      SELECT t.id, t.title, t.amount, t.transaction_date, c.name AS category_name, c.icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "Harcamalar alınırken sunucu hatası oluştu." });
  }
});

// 4. Yeni Harcama Ekle (POST)
app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category_id, transaction_date } = req.body;

    const newTransaction = await pool.query(
      `INSERT INTO transactions (title, amount, category_id, transaction_date) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, amount, category_id, transaction_date || new Date()],
    );

    res.status(201).json({
      message: "Harcama başarıyla eklendi!",
      transaction: newTransaction.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Harcama eklenirken bir hata oluştu." });
  }
});

// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif!`);
});
