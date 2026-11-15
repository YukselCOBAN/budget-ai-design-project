from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Eğitilmiş modeli yükle
model = joblib.load("expense_classifier.pkl")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "ai-expense-classifier"})

@app.route("/predict-category", methods=["POST"])
def predict_category():
    data = request.get_json()
    if not data or "title" not in data or not str(data["title"]).strip():
        return jsonify({"error": "Geçerli bir 'title' alanı gönderilmelidir."}), 400

    title = str(data["title"]).strip()
    predicted_category = model.predict([title])[0]

    # Eğer model olasılık (predict_proba) destekliyorsa güven skorunu da döndür
    confidence = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba([title])[0]
        confidence = round(float(max(probs)), 4)

    return jsonify({
        "title": title,
        "predicted_category": predicted_category,
        "confidence": confidence
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)