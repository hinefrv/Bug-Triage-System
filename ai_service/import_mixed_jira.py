import requests
import psycopg2
from psycopg2.extras import execute_values
import time

def extract_adf_text(adf_node):
    if not isinstance(adf_node, dict): return ""
    text = ""
    if adf_node.get("type") == "text": return adf_node.get("text", "")
    for child in adf_node.get("content", []): text += extract_adf_text(child) + "\n"
    return text

def fetch_by_priority(jql, severity_label, limit):
    base_url = "https://redhat.atlassian.net/rest/api/3/search/jql"
    bugs_data = []
    
    start_at = 0
    while len(bugs_data) < limit:
        url = f"{base_url}?jql={jql} ORDER BY created DESC&startAt={start_at}&maxResults=100&fields=summary,description,priority,status"
        res = requests.get(url)
        if res.status_code != 200: break
        
        issues = res.json().get("issues", [])
        if not issues: break
        
        for bug in issues:
            ma_bug = bug.get("key")
            fields = bug.get("fields", {})
            tieu_de = fields.get("summary", "")
            mo_ta = extract_adf_text(fields.get("description", {}))
            status = fields.get("status", {}).get("name", "NEW")
            raw_text = tieu_de + " " + mo_ta
            
            bugs_data.append((ma_bug, tieu_de, mo_ta, raw_text, status, severity_label, "Unclassified"))
            if len(bugs_data) >= limit: break
            
        start_at += 100
        time.sleep(1)
        
    print(f"Fetched {len(bugs_data)} bugs for severity {severity_label}")
    return bugs_data

def run():
    print("Fetching bugs with mixed severities...")
    all_bugs = []
    
    # Priority mapping for Red Hat AMQ project:
    # Blocker -> P1, Critical -> P2, Major -> P3, Minor -> P4, Undefined -> P5
    all_bugs.extend(fetch_by_priority("project=ENTMQMAAS AND priority=Blocker", "P1", 200))
    all_bugs.extend(fetch_by_priority("project=ENTMQMAAS AND priority=Critical", "P2", 200))
    all_bugs.extend(fetch_by_priority("project=ENTMQMAAS AND priority=Major", "P3", 200))
    all_bugs.extend(fetch_by_priority("project=ENTMQMAAS AND priority=Minor", "P4", 200))
    all_bugs.extend(fetch_by_priority("project=ENTMQMAAS AND priority=Undefined", "P5", 200))

    if not all_bugs:
        print("No bugs fetched!")
        return

    print("Connecting to DB...")
    conn = psycopg2.connect(dbname="bug_triage_db", user="postgres", password="asd123hien", host="localhost", port="5432")
    cur = conn.cursor()
    
    print("Deleting old Jira bugs...")
    cur.execute("DELETE FROM bug_reports WHERE bugid LIKE 'ENTMQMAAS-%'")
    
    print("Inserting mixed bugs into DB...")
    insert_query = """
        INSERT INTO bug_reports (bugid, title, description, raw_text, status, severity_label, component_label)
        VALUES %s
        ON CONFLICT (bugid) DO NOTHING
    """
    execute_values(cur, insert_query, all_bugs)
    
    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Successfully inserted {len(all_bugs)} mixed-severity bugs!")

if __name__ == "__main__":
    run()
