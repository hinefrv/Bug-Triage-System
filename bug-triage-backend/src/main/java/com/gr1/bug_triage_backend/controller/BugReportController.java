package com.gr1.bug_triage_backend.controller;

import com.gr1.bug_triage_backend.entity.BugReport;
import com.gr1.bug_triage_backend.security.UserDetailsImpl;
import com.gr1.bug_triage_backend.service.BugReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bugs")
public class BugReportController {

    @Autowired
    private BugReportService bugService;

    // API 1: Xem danh sách lỗi (GET /api/v1/bugs)
    @GetMapping
    public ResponseEntity<List<BugReport>> getAllBugs() {
        return ResponseEntity.ok(bugService.getAllBugs());
    }

    // API 2: Gửi lỗi mới vào hệ thống (POST /api/v1/bugs)
    @PostMapping
    public ResponseEntity<BugReport> createBug(@RequestBody BugReport bugReport) {
        BugReport savedBug = bugService.saveBug(bugReport);
        return ResponseEntity.ok(savedBug);
    }

    // API 3: Lay danh sach task cua toi
    @GetMapping("/my-tasks")
    public ResponseEntity<List<BugReport>> getMyTask() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        String myEmail = userDetails.getUsername();
        return ResponseEntity.ok(bugService.getBugsByAssignee(myEmail));
    }

    // API 4: Cap nhat status Bug
    @PatchMapping("/{bugId}/status")
    public ResponseEntity<BugReport> updateBugStatus(@PathVariable String bugId,
            @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        BugReport updateBug = bugService.updateStatus(bugId, newStatus);
        return ResponseEntity.ok(updateBug);
    }

    // API 5: Cập nhật toàn bộ thông tin Bug (Status, Assignee, Severity...)
    @PutMapping("/{bugId}")
    public ResponseEntity<BugReport> updateBug(@PathVariable String bugId, @RequestBody BugReport bugDetails) {
        BugReport updatedBug = bugService.updateBug(bugId, bugDetails);
        return ResponseEntity.ok(updatedBug);
    }

    // API 6: Đánh dấu lỗi là trùng lặp
    @PostMapping("/{bugId}/duplicate/{targetId}")
    public ResponseEntity<BugReport> markAsDuplicate(@PathVariable String bugId, @PathVariable String targetId) {
        BugReport bug = bugService.markAsDuplicate(bugId, targetId);
        return ResponseEntity.ok(bug);
    }

    // API 7: Liên kết lỗi vào một Incident
    @PostMapping("/{bugId}/link-incident/{incidentId}")
    public ResponseEntity<BugReport> linkToIncident(@PathVariable String bugId, @PathVariable Long incidentId) {
        BugReport bug = bugService.linkToIncident(bugId, incidentId);
        return ResponseEntity.ok(bug);
    }
}