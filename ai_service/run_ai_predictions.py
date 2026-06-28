import psycopg2
import joblib
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from psycopg2.extras import execute_batch

def run_predictions():
    print("Loading models...")
    tfidf = joblib.load(r'D:\AI_Service\tfidf_vectorizer_v2.pkl')
    rf_model = joblib.load(r'D:\AI_Service\bug_severity_rf_model_v2.pkl')
    kmeans = joblib.load(r'D:\AI_Service\bug_clustering_kmeans_v2.pkl')

    print("Connecting to DB...")
    conn = psycopg2.connect(dbname="bug_triage_db", user="postgres", password="asd123hien", host="localhost", port="5432")
    cur = conn.cursor()
    
    cur.execute("SELECT bugid, title, description, raw_text FROM bug_reports WHERE cluster_id IS NULL OR similarity_score IS NULL")
    rows = cur.fetchall()
    
    if not rows:
        print("All bugs already have predictions!")
        return

    print(f"Found {len(rows)} bugs needing predictions. Processing...")
    
    updates = []
    for row in rows:
        bugid = row[0]
        title = row[1] or ""
        desc = row[2] or ""
        # Dùng title + description làm text
        text = str(title + " " + desc).lower()
        
        bug_vector = tfidf.transform([text])
        severity_pred = rf_model.predict(bug_vector)[0]
        cluster_id = kmeans.predict(bug_vector)[0]
        
        centroid = kmeans.cluster_centers_[cluster_id]
        cluster_sim = cosine_similarity(bug_vector, centroid.reshape(1, -1))[0][0]
        
        if cluster_sim < 0.1: # Giảm ngưỡng xíu vì data mới phân cụm có thể hơi xa tâm
            cluster_id = -1
            
        cluster_similarity_score = float(round(cluster_sim * 100, 2))
        
        updates.append((int(cluster_id), cluster_similarity_score, str(severity_pred), bugid))

    print("Updating database...")
    update_query = """
        UPDATE bug_reports 
        SET cluster_id = %s, similarity_score = %s, severity_label = %s
        WHERE bugid = %s
    """
    execute_batch(cur, update_query, updates)
    conn.commit()
    
    cur.close()
    conn.close()
    print("✅ Completed predictions for all bugs!")

if __name__ == "__main__":
    run_predictions()
