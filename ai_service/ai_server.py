from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import uvicorn
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from data_pipeline import run_full_pipeline

app = FastAPI(title="Bug Triage AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Trong thực tế nên để "http://localhost:5173", nhưng lúc demo cứ để "*" cho an toàn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
print("Đang tải mô hình")
tfidf = joblib.load('tfidf_vectorizer_v2.pkl')
rf_model = joblib.load('bug_severity_rf_model_v2.pkl')
kmeans = joblib.load('bug_clustering_kmeans_v2.pkl')
print("Sẵn sàng nhận lệnh")

def predict_component(text):
    text = str(text).lower()
    if any(k in text for k in ['database', 'sql', 'query', 'migration', 'table', 'db']):
        return "Database"
    if any(k in text for k in ['ui', 'button', 'color', 'margin', 'css', 'react', 'frontend']):
        return "Frontend"
    if any(k in text for k in ['server', 'docker', 'deploy', 'pipeline', 'devops', 'timeout']):
        return "DevOps"
    if any(k in text for k in ['api', 'rest', 'endpoint', 'json']):
        return "API"
    if any(k in text for k in ['login', 'auth', 'token', 'jwt', 'password']):
        return "Authentication"
    if any(k in text for k in ['email', 'sms', 'notification', 'alert']):
        return "Notification"
    return "Backend"

class BugRequest(BaseModel):
    raw_text: str
    developer_profiles: Dict[str, str] #{"Tên", "Skill Tags"}

@app.post("/api/predict")
def analyze_bug(bug: BugRequest):
    try:
        # 1. Biến câu văn thành số
        bug_vector = tfidf.transform([bug.raw_text])

        # 2. Phân loại mức độ nghiêm trọng
        severity_pred = rf_model.predict(bug_vector)[0]

        # 3. Tìm cụm lỗi trùng lặp và tính độ tương đồng
        cluster_id = kmeans.predict(bug_vector)[0]
        centroid = kmeans.cluster_centers_[cluster_id]
        
        # Tính độ tương đồng với tâm cụm
        cluster_sim = cosine_similarity(bug_vector, centroid.reshape(1, -1))[0][0]
        
        if cluster_sim < 0.3:
            cluster_id = -1
            
        cluster_similarity_score = float(round(cluster_sim * 100, 2))

        # 4. Gợi ý phân công công việc
        dev_names = list(bug.developer_profiles.keys())
        dev_skill_texts = list(bug.developer_profiles.values())

        if not dev_names:
            return {"status": "success", "severity": str(severity_pred), "cluster_id": int(cluster_id), "assignee": "Chua co data"}

        # Bo tu dien tam thoi gom ca van ban loi va ky nang Dev
        corpus = [bug.raw_text.lower()] + [text.lower() for text in dev_skill_texts]

        try:
            # Sinh ra ma tran vector tai thoi diem thuc thi
            local_tfidf = TfidfVectorizer()
            vectors = local_tfidf.fit_transform(corpus)

            bug_vec_local = vectors[0]
            dev_vecs_local = vectors[1:]

            # Tinh do khop
            similarities = cosine_similarity(bug_vec_local, dev_vecs_local)[0]
            best_match_idx = np.argmax(similarities)
            match_score = similarities[best_match_idx]

            if match_score > 0:
                suggested_assignee = dev_names[best_match_idx]
            else:
                suggested_assignee = "Chua the de xuat"
        except Exception:
            suggested_assignee = "Chua the de xuat"
            match_score = 0.0

        # 5. Phân loại Component
        component = predict_component(bug.raw_text)

        return {
            "status": "success",
            "severity": str(severity_pred),
            "cluster_id": int(cluster_id),
            "assignee": str(suggested_assignee),
            "match_confidence": float(round(match_score * 100, 2)),
            "cluster_similarity": cluster_similarity_score,
            "component": component
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/admin/trigger-pipeline")
def trigger_pipeline(background_tasks: BackgroundTasks):
    try:
        # Lệnh này sẽ bỏ hàm run_full_pipeline vào chạy nền
        # Nhờ vậy Frontend không phải chờ 2-3 phút, API sẽ trả lời "started" ngay lập tức
        background_tasks.add_task(run_full_pipeline)
        return {"status": "success", "message": "Pipeline retrain started in background"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/api/admin/reload-models")
def reload_models():
    global tfidf, rf_model, kmeans
    try:
        print("Đang nạp lại bộ não AI mới nhất từ ổ cứng...")
        tfidf = joblib.load('tfidf_vectorizer_v2.pkl')
        rf_model = joblib.load('bug_severity_rf_model_v2.pkl')
        kmeans = joblib.load('bug_clustering_kmeans_v2.pkl')
        print("✅ Đã nạp thành công!")
        return {"status": "success", "message": "Models reloaded successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)