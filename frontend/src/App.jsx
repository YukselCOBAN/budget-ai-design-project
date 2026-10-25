import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  ShoppingBag,
  Receipt,
  Bus,
  Film,
  Repeat,
  MoreHorizontal,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function App() {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Verileri REST API'den Çekme
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

  // Yeni Harcama Kaydetme
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !categoryId) return;

    try {
      await axios.post(`${API_URL}/transactions`, {
        title,
        amount: parseFloat(amount),
        category_id: parseInt(categoryId),
      });

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
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "40px 20px",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Başlık */}
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "30px",
            color: "#1e293b",
          }}
        >
          Yapay Zekâ Destekli Bütçe ve Gider Takibi
        </h1>

        {/* Harcama Ekleme Kartı */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            marginBottom: "32px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#334155",
            }}
          >
            Yeni Harcama Ekle
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Harcama Başlığı (örn: Migros, Trendyol)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  flex: "2",
                  minWidth: "200px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#0f172a",
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
                  flex: "1",
                  minWidth: "110px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "#fff",
                  color: "#0f172a",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  flex: "1",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  backgroundColor: "#fff",
                  color: "#0f172a",
                  cursor: "pointer",
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
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 24px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "background-color 0.2s",
                }}
              >
                <Plus size={18} /> Ekle
              </button>
            </div>
          </form>
        </div>

        {/* Harcama Listesi */}
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#334155",
          }}
        >
          Son Harcamalar
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                color: "#64748b",
              }}
            >
              Henüz kayıtlı bir harcama bulunmuyor.
            </div>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      color: "#0f172a",
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    {t.category_name || "Kategorisiz"}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
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
    </div>
  );
}
