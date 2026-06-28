import psycopg2
from psycopg2.extras import execute_batch
import requests
import math

def update_components():
    print("Connecting to DB...")
    conn = psycopg2.connect(dbname="bug_triage_db", user="postgres", password="asd123hien", host="localhost", port="5432")
    cur = conn.cursor()

    cur.execute("SELECT bugid FROM bug_reports WHERE bugid LIKE 'ENTMQMAAS-%'")
    rows = cur.fetchall()
    
    if not rows:
        print("No Jira bugs found!")
        return

    bug_ids = [row[0] for row in rows]
    print(f"Found {len(bug_ids)} Jira bugs. Fetching components from Jira in batches...")

    batch_size = 50
    updates = []
    
    base_url = "https://redhat.atlassian.net/rest/api/3/search/jql"

    for i in range(0, len(bug_ids), batch_size):
        chunk = bug_ids[i:i+batch_size]
        jql = "issueKey IN (" + ",".join(chunk) + ")"
        url = f"{base_url}?jql={jql}&maxResults={batch_size}&fields=components"
        
        try:
            res = requests.get(url)
            if res.status_code == 200:
                issues = res.json().get("issues", [])
                for issue in issues:
                    ma_bug = issue.get("key")
                    components = issue.get("fields", {}).get("components", [])
                    if components:
                        comp_name = components[0].get("name", "Unclassified")
                        comp_name = comp_name[:50]
                    else:
                        comp_name = "Unclassified"
                        
                    updates.append((comp_name, ma_bug))
            else:
                print(f"Error fetching batch {i}: {res.status_code}")
        except Exception as e:
            print(f"Exception fetching batch {i}: {e}")

    print(f"Updating {len(updates)} records in Database...")
    update_query = """
        UPDATE bug_reports 
        SET component_label = %s
        WHERE bugid = %s
    """
    execute_batch(cur, update_query, updates)
    
    conn.commit()
    cur.close()
    conn.close()
    print("✅ Completed updating components!")

if __name__ == "__main__":
    update_components()
