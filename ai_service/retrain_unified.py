import psycopg2
import pandas as pd
import re
import joblib
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier

def clean_text(text):
    if pd.isna(text): return ""
    text = str(text).lower()
    text = re.sub(r'```.*?```', ' ', text, flags=re.DOTALL)
    text = re.sub(r'<.*?>', ' ', text)
    text = re.sub(r'http\S+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def run_unified_retraining():
    print("1. Đọc dữ liệu cũ (Eclipse/GitHub) từ CSV...")
    try:
        df_old = pd.read_csv(r'D:\GR1\Balanced_Cleaned_Dataset.csv')
        df_old = df_old[['cleaned_text', 'severity_label']].rename(columns={'cleaned_text': 'text', 'severity_label': 'label'})
    except Exception as e:
        print("Lỗi đọc CSV cũ:", e)
        df_old = pd.DataFrame(columns=['text', 'label'])

    print("2. Đọc dữ liệu mới (Jira) từ PostgreSQL...")
    conn = psycopg2.connect(dbname="bug_triage_db", user="postgres", password="asd123hien", host="localhost", port="5432")
    query = "SELECT title, description, severity_label FROM bug_reports WHERE bugid LIKE 'ENTMQMAAS-%'"
    df_new = pd.read_sql_query(query, conn)
    conn.close()

    df_new['text'] = (df_new['title'].fillna('') + ' ' + df_new['description'].fillna('')).apply(clean_text)
    df_new = df_new[['text', 'severity_label']].rename(columns={'severity_label': 'label'})

    print("3. Gộp siêu tập dữ liệu (Unified Dataset)...")
    df_final = pd.concat([df_old, df_new], ignore_index=True)
    df_final = df_final.dropna(subset=['text', 'label'])
    
    print(f"Tổng số lượng lỗi dùng để huấn luyện: {len(df_final)}")

    print("4. Huấn luyện lại AI Phân loại Mức độ nghiêm trọng (RF)...")
    X = df_final['text']
    y = df_final['label']
    
    # Chú ý: Stratify có thể lỗi nếu 1 nhãn có quá ít sample, ta cẩn thận
    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    except:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Tăng vốn từ vựng lên 10000 để chứa cả tiếng Anh từ Eclipse và Red Hat
    tfidf = TfidfVectorizer(max_features=10000, stop_words='english')
    X_train_vec = tfidf.fit_transform(X_train)
    
    rf_model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
    rf_model.fit(X_train_vec, y_train)

    print("5. Huấn luyện lại AI Phân cụm (K-Means) với 40 cụm...")
    X_vec_all = tfidf.transform(X)
    kmeans = KMeans(n_clusters=40, random_state=42, n_init=10)
    kmeans.fit(X_vec_all)

    print("6. Lưu đè đống Model mới...")
    joblib.dump(tfidf, r'D:\AI_Service\tfidf_vectorizer_v2.pkl')
    joblib.dump(rf_model, r'D:\AI_Service\bug_severity_rf_model_v2.pkl')
    joblib.dump(kmeans, r'D:\AI_Service\bug_clustering_kmeans_v2.pkl')
    
    print("✅ HOÀN TẤT UNIFIED RETRAINING. Vui lòng khởi động lại AI Server!")

if __name__ == "__main__":
    run_unified_retraining()
