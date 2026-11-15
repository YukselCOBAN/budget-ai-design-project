const axios = require("axios");
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

// Yapay Zekâ Kategori Önerisi Uç Noktası
app.post("/api/predict-category", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Harcama başlığı boş olamaz." });
    }

    // 1. Python AI servisine (Port 5001) tahmin isteği at
    const aiResponse = await axios.post(
      "http://127.0.0.1:5001/predict-category",
      {
        title: title.trim(),
      },
    );

    const { predicted_category, confidence } = aiResponse.data;

    // 2. Veritabanındaki categories tablosundan eşleşen kategorinin ID'sini bul
    const catResult = await pool.query(
      "SELECT id, name FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1",
      [predicted_category],
    );

    const matchedCategory = catResult.rows[0] || null;

    res.json({
      title: title.trim(),
      predicted_category,
      confidence,
      category_id: matchedCategory ? matchedCategory.id : null,
    });
  } catch (error) {
    console.error("AI Servis Hatası:", error.message);
    res.status(502).json({
      error: "Yapay zekâ servisine şu an ulaşılamıyor.",
      details: error.message,
    });
  }
});

// Harcama Kaydı Silme Uç Noktası
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Silinecek harcama bulunamadı." });
    }

    res.json({
      message: "Harcama başarıyla silindi.",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("Silme hatası:", error.message);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
});

// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda aktif!`);
});
