import requests
import pandas as pd
import re
import joblib
from datetime import datetime, timedelta
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

def fetch_recent_bugs(repo="spring-projects/spring-boot", days_ago=1):
    import os
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "your_token_here") # Đã ẩn Token bảo mật
    headers = {"Authorization": f"token {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    since_date = (datetime.utcnow() - timedelta(days=days_ago)).strftime('%Y-%m-%dT%H:%M:%SZ')
    url = f"https://api.github.com/repos/{repo}/issues?state=all&since={since_date}"

    print(f"[1/5] Đang lấy bug từ GitHub từ {since_date}...")
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return []

    new_bugs = []
    for issue in response.json():
        if 'pull_request' not in issue:
            title = issue.get('title') or ""
            body = issue.get('body') or ""
            new_bugs.append({
                'bug_id': f"GH-{issue['number']}",
                'title': title,
                'raw_text': title + " " + body,
                'severity_label': 'Unknown',
                'status': issue.get('state') or "unknown",
                'source': 'GitHub'
            })
    return new_bugs

def run_full_pipeline():
    print("="*50)
    print(" BẮT ĐẦU CHẠY PIPELINE TỰ ĐỘNG ")
    print("="*50)
    
    # 1. Thu thập dữ liệu mới
    new_data = fetch_recent_bugs()
    if new_data:
        df_new = pd.DataFrame(new_data)
        # Append tạm vào file lưu trữ (nếu cần)
        df_new.to_csv(r'D:\GR1\Cleaned_Dataset_ReadyForAI.csv', mode='a', header=False, index=False, encoding='utf-8')
    else:
        df_new = pd.DataFrame()

    # 2. Cân bằng dữ liệu (Undersampling & Oversampling)
    print("[2/5] Đang gộp và cân bằng dữ liệu...")
    df_raw = pd.read_csv(r'D:\GR1\Final_Unified_Dataset (1).csv')
    df_synthetic = pd.read_csv(r'D:\GR1\synthetic_p4_p5.csv')
    
    df_raw = df_raw.dropna(subset=['severity_label'])
    df_p3 = df_raw[df_raw['severity_label'] == 'P3'].sample(n=3000, random_state=42)
    df_others = df_raw[df_raw['severity_label'] != 'P3']
    
    # Trộn Dataset cũ + Synthetic + Bug mới từ GitHub
    df_final = pd.concat([df_p3, df_others, df_synthetic, df_new], ignore_index=True)
    
    # 3. Làm sạch (Clean Text)
    print("[3/5] Đang làm sạch chữ nghĩa...")
    df_final['cleaned_text'] = df_final['raw_text'].apply(clean_text)
    df_final = df_final.dropna(subset=['cleaned_text', 'severity_label'])
    df_final.to_csv(r'D:\GR1\Balanced_Cleaned_Dataset.csv', index=False)

    # 4. Retrain Random Forest & TF-IDF
    print("[4/5] Đang dạy lại AI phân loại mức độ nghiêm trọng (RF)...")
    X = df_final['cleaned_text']
    y = df_final['severity_label']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    tfidf = TfidfVectorizer(max_features=5000)
    X_train_vec = tfidf.fit_transform(X_train)
    rf_model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
    rf_model.fit(X_train_vec, y_train)
    
    joblib.dump(tfidf, r'D:\AI_Service\tfidf_vectorizer_v2.pkl')
    joblib.dump(rf_model, r'D:\AI_Service\bug_severity_rf_model_v2.pkl')

    # 5. Retrain KMeans
    print("[5/5] Đang dạy lại AI gom cụm lỗi (K-Means)...")
    X_vec_all = tfidf.transform(X)
    kmeans = KMeans(n_clusters=30, random_state=42, n_init='auto')
    kmeans.fit(X_vec_all)
    joblib.dump(kmeans, r'D:\AI_Service\bug_clustering_kmeans_v2.pkl')

    print("✅ Hoàn tất toàn bộ quy trình! AI đã thông minh hơn với dữ liệu mới.")

if __name__ == "__main__":
    # Để test code chạy độc lập
    run_full_pipeline()
