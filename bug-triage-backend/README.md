# 🐞 AI-Powered Bug Triage System



Hệ thống phân loại, dự đoán mức độ nghiêm trọng và tự động phân công xử lý lỗi phần mềm sử dụng Trí tuệ nhân tạo (Machine Learning \& NLP). 



**Dự án thuộc: Nghiên cứu Đồ án tốt nghiệp 1 - Đại học Bách Khoa Hà Nội (HUST)**

* **Sinh viên thực hiện:** Phạm Minh Hiển

* **Giảng viên hướng dẫn:** Thầy Nguyễn Mạnh Tuấn



---



## 🏗️ Kiến trúc Hệ thống (System Architecture)

Dự án được thiết kế theo mô hình Microservices, bao gồm 3 phân hệ chính:



1. **Frontend (`/frontend`)**: Ứng dụng Web SPA quản lý lỗi, xây dựng bằng \*\*ReactJS\*\*.

2. **Core Backend (`/backend`)**: Xử lý nghiệp vụ lõi, xác thực và lưu trữ, xây dựng bằng \*\*Java Spring Boot\*\* \& PostgreSQL.

3. **AI Engine (`/ai-engine`)**: Dịch vụ suy luận Trí tuệ nhân tạo độc lập, xây dựng bằng \*\*Python (FastAPI)\*\*, Scikit-learn và Pandas.



## 📁 Cấu trúc Thư mục



```text

AI-Bug-Triage-System/

├── ai-engine/             # Python API \& Machine Learning Models

│   ├── data/              # Chứa file Cleaned\_Dataset.csv

│   ├── models/            # Chứa các file model đã train (.pkl)

│   └── main.py            # Entry point của FastAPI

├── backend/               # Java Spring Boot REST API

│   ├── src/main/java/     # Source code Java

│   └── src/main/resources/# Cấu hình application.yml \& Database

├── frontend/              # UI/UX components (React)

├── .gitignore             # Git ignore rules

└── README.md              # Tài liệu dự án

