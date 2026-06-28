package com.gr1.bug_triage_backend.repository;

import com.gr1.bug_triage_backend.entity.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BugReportRepository extends JpaRepository<BugReport, String> {
    // Kế thừa JpaRepository<Tên_Thực_Thể, Kiểu_Dữ_Liệu_Của_Khóa_Chính>
    // Khóa chính của BugReport là bugID (kiểu String)
    List<BugReport> findByAssignee(String assignee);
}