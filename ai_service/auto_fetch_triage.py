import requests
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime

def extract_adf_text(adf_node):
    if not isinstance(adf_node, dict): return ""
    text = ""
    if adf_node.get("type") == "text": return adf_node.get("text", "")
    for child in adf_node.get("content", []): text += extract_adf_text(child) + "\n"
    return text

def run_auto_triage():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Đang quét các lỗi mới trên Jira...")
    
    # Chỉ lấy các lỗi tạo trong 24h qua (-1d)
    jql = "project=ENTMQMAAS AND created >= -1d ORDER BY created DESC"
    url = f"https://redhat.atlassian.net/rest/api/3/search/jql?jql={jql}&maxResults=50&fields=summary,description,components"
    
    res = requests.get(url)
    if res.status_code != 200:
        print("Lỗi kết nối Jira API")
        return
        
    issues = res.json().get("issues", [])
    if not issues:
        print("Không có lỗi mới nào trong 24h qua.")
        return
        
    print(f"Tìm thấy {len(issues)} lỗi mới. Đang nhờ AI Server phân loại...")
    
    # Kết nối DB sớm để lấy profiles và insert sau
    conn = psycopg2.connect(dbname="bug_triage_db", user="postgres", password="asd123hien", host="localhost", port="5432")
    cur = conn.cursor()

    # Lấy thông tin kỹ năng của Developer
    cur.execute("""
        SELECT d.name, string_agg(s.skill_tag, ' ') 
        FROM developers d
        JOIN developer_skills ds ON d.developerid = ds.developer_id
        JOIN skills s ON ds.skill_id = s.skillid
        GROUP BY d.name
    """)
    dev_profiles = {row[0]: row[1] for row in cur.fetchall() if row[0] and row[1]}

    bugs_data = []
    
    for bug in issues:
        ma_bug = bug.get("key")
        fields = bug.get("fields", {})
        tieu_de = fields.get("summary", "")
        mo_ta = extract_adf_text(fields.get("description", {}))
        
        # Component từ Jira
        components = fields.get("components", [])
        comp_name = components[0].get("name", "Unclassified")[:50] if components else "Unclassified"
            
        raw_text = tieu_de + " " + mo_ta
        
        # Gọi sang AI Server để phân loại
        try:
            ai_res = requests.post("http://127.0.0.1:8000/api/predict", json={
                "raw_text": raw_text,
                "developer_profiles": dev_profiles
            })
            
            severity_label = "P3"
            cluster_id = -1
            cluster_sim = 0.0
            ai_assignee = "Unassigned"
            match_confidence = 0.0
            
            if ai_res.status_code == 200:
                ai_data = ai_res.json()
                if ai_data.get("status") == "success":
                    severity_label = ai_data.get("severity", "P3")
                    cluster_id = ai_data.get("cluster_id", -1)
                    cluster_sim = ai_data.get("cluster_similarity", 0.0)
                    ai_assignee = ai_data.get("assignee", "Unassigned")
                    match_confidence = ai_data.get("match_confidence", 0.0)
        except Exception:
            severity_label = "P3"
            cluster_id = -1
            cluster_sim = 0.0
            ai_assignee = "Unassigned"
            match_confidence = 0.0
                
        bugs_data.append((
            ma_bug, tieu_de, mo_ta, raw_text, "Open", 
            severity_label, comp_name, cluster_id, cluster_sim, ai_assignee, match_confidence
        ))
        
    # Ghi vào DB
    insert_query = """
        INSERT INTO bug_reports (bugid, title, description, raw_text, status, severity_label, component_label, cluster_id, similarity_score, ai_suggested_assignee, ai_confidence)
        VALUES %s
        ON CONFLICT (bugid) DO NOTHING
    """
    execute_values(cur, insert_query, bugs_data)
    conn.commit()
    
    print(f"✅ Đã quét và lưu thành công các lỗi mới vào Database cùng với nhãn của AI!")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    run_auto_triage()
