import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix

# 1. Veri setini yükle
df = pd.read_csv("expenses_dataset.csv")
print(f"Toplam kayıt sayısı: {len(df)}")
print(f"Kategori dağılımı:\n{df['category'].value_counts()}\n")

# 2. Eğitim ve Test olarak ayır (%80 Eğitim, %20 Test)
X_train, X_test, y_train, y_test = train_test_split(
    df["description"],
    df["category"],
    test_size=0.20,
    random_state=42,
    stratify=df["category"]
)

# Türkçe ekler ve POS kısaltmaları için Kelime + Karakter N-gram birleşimi
def build_features():
    return FeatureUnion([
        ("word_tfidf", TfidfVectorizer(analyzer="word", ngram_range=(1, 2), lowercase=True)),
        ("char_tfidf", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), lowercase=True))
    ])

# 3. Karşılaştırılacak modeller (2. Ara Rapor Deney 2 tablosu için)
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, C=2.0),
    "Multinomial Naive Bayes": MultinomialNB(alpha=0.5),
    "Calibrated Linear SVM": CalibratedClassifierCV(LinearSVC(random_state=42, C=1.0))
}

best_model = None
best_score = 0
best_name = ""

print("=" * 65)
print("DENEY 2: GELİŞMİŞ NLP (KELİME + KARAKTER N-GRAM) KARŞILAŞTIRMASI")
print("=" * 65)

for name, clf in models.items():
    pipeline = Pipeline([
        ("features", build_features()),
        ("clf", clf)
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro")

    print(f"\n▶ Model: {name}")
    print(f"  Accuracy : %{acc * 100:.2f}")
    print(f"  Macro-F1 : %{macro_f1 * 100:.2f}")

    if macro_f1 >= best_score:
        best_score = macro_f1
        best_model = pipeline
        best_name = name

print("\n" + "=" * 65)
print(f"🏆 Seçilen En İyi Model: {best_name} (Macro-F1: %{best_score * 100:.2f})")
print("=" * 65)

# Seçilen modelin detaylı sınıf bazlı raporu
y_best_pred = best_model.predict(X_test)
print("\nDetaylı Sınıflandırma Raporu:\n")
print(classification_report(y_test, y_best_pred))

labels = sorted(df["category"].unique())
cm = confusion_matrix(y_test, y_best_pred, labels=labels)
print("\nKarmaşıklık Matrisi (Confusion Matrix):\n")
print(pd.DataFrame(cm, index=labels, columns=labels))

# 4. Tüm veriyle yeniden eğitip kaydet
best_model.fit(df["description"], df["category"])
joblib.dump(best_model, "expense_classifier.pkl")
print("✅ Güncel model 'expense_classifier.pkl' olarak kaydedildi.")