import requests
import json
import time

API_URL = "http://localhost:8080/api/v1/bugs"

test_bugs = [
    {
        "bugID": "TEST-006",
        "title": "Java Spring Database connection deadlock transaction timeout",
        "description": "The java spring backend is experiencing a database deadlock during transaction commit. The connection timeout is causing 500 errors. Need to fix the sql query.",
        "reporter": "tester_english@bugtriage.com",
        "source": "Manual",
        "stackTrace": "java.sql.SQLException: Deadlock found when trying to get lock\n  at com.mysql.jdbc.SQLError.createSQLException"
    }
]

print("Đang gửi dữ liệu test tiếng Anh vào hệ thống...")

for bug in test_bugs:
    try:
        response = requests.post(API_URL, json=bug)
        if response.status_code == 200:
            res_data = response.json()
            print(f"✅ Gửi thành công: {bug['bugID']}")
            print(f"   -> AI Phân loại Component: {res_data.get('componentLabel')}")
            print(f"   -> Cụm (Cluster): {res_data.get('clusterId')} (Độ tương đồng: {res_data.get('similarityScore')}%)")
            print(f"   -> AI Tự tin giao việc cho {res_data.get('assignee')} (Confidence): {res_data.get('aiConfidence')}%\n")
        else:
            print(f"❌ Lỗi gửi {bug['bugID']}: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Lỗi kết nối khi gửi {bug['bugID']}: {e}")
    time.sleep(1)

print("Hoàn tất!")
