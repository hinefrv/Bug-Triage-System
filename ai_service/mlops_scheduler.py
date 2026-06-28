import schedule
import time
import requests
import subprocess
from datetime import datetime

# Lấy hàm cào dữ liệu từ file bạn vừa làm ở Bước 2
from auto_fetch_triage import run_auto_triage

def job_daily_fetch():
    print(f"\n--- [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] BẮT ĐẦU CÀO DỮ LIỆU JIRA (HẰNG NGÀY) ---")
    run_auto_triage()
    print("--- HOÀN TẤT CÀO DỮ LIỆU ---\n")

def job_weekly_retrain():
    print(f"\n--- [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] BẮT ĐẦU HỌC LẠI AI (HẰNG TUẦN) ---")
    
    # 1. Gọi file retrain_unified.py để ép AI học thêm dữ liệu mới
    try:
        print("Đang ép AI nạp thêm từ vựng và thuật toán mới, vui lòng chờ 1-2 phút...")
        subprocess.run(["python", "retrain_unified.py"], check=True)
        print("✅ Đã học lại xong, lưu file pkl thành công.")
        
        # 2. Bắn API sang Web Server để ép nó dùng Não mới (Hành động ở Bước 1)
        print("Đang yêu cầu AI Server (Cổng 8000) nạp não mới (Zero-downtime)...")
        res = requests.post("http://127.0.0.1:8000/api/admin/reload-models")
        if res.status_code == 200:
            print("✅ Web Server báo cáo: Đã nạp não mới thành công!")
        else:
            print(f"❌ Web Server báo lỗi: {res.text}")
    except Exception as e:
        print(f"❌ Có lỗi khi chạy tiến trình học lại: {e}")
        
    print("--- HOÀN TẤT TIẾN TRÌNH HỌC LẠI ---\n")

# ---- CẤU HÌNH LỊCH TRÌNH THEO Ý CỦA BẠN ----

# 1. Cào dữ liệu mới mỗi ngày vào lúc Nửa đêm (00:00)
schedule.every().day.at("00:00").do(job_daily_fetch)

# 2. Học lại mô hình mỗi Chủ nhật vào lúc 02:00 sáng
schedule.every().sunday.at("02:00").do(job_weekly_retrain)


if __name__ == "__main__":
    print("=========================================================")
    print("🚀 HỆ THỐNG MLOps SCHEDULER ĐANG CHẠY NGẦM...")
    print("⏰ Lịch đã đặt:")
    print("  - Kéo dữ liệu Jira (Auto-Ingest) : 00:00 mỗi ngày")
    print("  - Học lại mô hình (Continuous)   : 02:00 sáng Chủ nhật")
    print("Nhấn Ctrl+C để tắt tiến trình này.")
    print("=========================================================\n")
    
    # Vòng lặp vô tận: Cứ mỗi 1 phút thức dậy ngó đồng hồ 1 lần xem đã đến giờ chưa
    while True:
        schedule.run_pending()
        time.sleep(60)
