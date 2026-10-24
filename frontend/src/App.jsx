import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  ShoppingCart,
  FileText,
  Car,
  Film,
  Tv,
  MoreHorizontal,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // 1. Verileri Backend REST API'den Çekme
  const fetchData = async () => {
    try {
      const catRes = await axios.get(`${API_URL}/categories`);
      const tranRes = await axios.get(`${API_URL}/transactions`);
      setCategories(catRes.data);
      setTransactions(tranRes.data);
      if (catRes.data.length > 0 && !categoryId) {
        setCategoryId(catRes.data[0].id);
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Form Üzerinden Yeni Harcama Ekleme (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !categoryId) return;

    try {
      await axios.post(`${API_URL}/transactions`, {
        title,
        amount: parseFloat(amount),
        category_id: parseInt(categoryId),
      });

      // Formu temizle ve listeyi veritabanından güncelle
      setTitle("");
      setAmount("");
      fetchData();
    } catch (error) {
      console.error("Harcama ekleme hatası:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "0 20px",
      }}
    >
      <h1 style={{ color: "#1e293b" }}>
        Yapay Zekâ Destekli Bütçe ve Gider Takibi
      </h1>

      {/* Harcama Ekleme Formu */}
      <div
        style={{
          background: "#f8fafc",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#334155" }}>Yeni Harcama Ekle</h3>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Harcama Başlığı (örn: Trendyol, Market)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Tutar (TL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "130px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
            required
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              background: "#fff",
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
            }}
          >
            <Plus size={18} /> Ekle
          </button>
        </form>
      </div>

      {/* Harcama Listesi */}
      <h3 style={{ color: "#334155" }}>Son Harcamalar</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {transactions.length === 0 ? (
          <p style={{ color: "#64748b" }}>
            Henüz kayıtlı bir harcama bulunmuyor.
          </p>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 20px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div>
                <strong style={{ fontSize: "16px", color: "#0f172a" }}>
                  {t.title}
                </strong>
                <br />
                <small style={{ color: "#64748b" }}>
                  {t.category_name || "Kategorisiz"}
                </small>
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#dc2626",
                }}
              >
                -
                {parseFloat(t.amount).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}{" "}
                TL
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
