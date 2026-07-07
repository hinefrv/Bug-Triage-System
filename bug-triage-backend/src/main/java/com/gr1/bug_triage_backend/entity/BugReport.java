package com.gr1.bug_triage_backend.entity;

import com.gr1.bug_triage_backend.entity.Category;
import com.gr1.bug_triage_backend.entity.Incident;
import com.gr1.bug_triage_backend.entity.Source;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bug_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BugReport {
    // Vì ID từ GitHub dạng chuỗi (VD: GH-1234), ta dùng String làm ID
    @Id
    private String bugID;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rawText;

    @Column(columnDefinition = "TEXT")
    private String stackTrace;

    @Column(name = "cluster_id")
    private Integer clusterId;

    @Column(name = "assignee")
    private String assignee;

    private String severityLabel;
    private String componentLabel;
    private String status;

    private Double aiConfidence;
    private Double similarityScore;
    
    @Column(name = "ai_suggested_assignee")
    private String aiSuggestedAssignee;

    @Column(name = "duplicate_of")
    private String duplicateOf;

    // --- MỐI QUAN HỆ KHÓA NGOẠI (FOREIGN KEYS) ---

    // N Lỗi thuộc về 1 Nguồn (GitHub, Jira...)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private Source source;

    // N Lỗi thuộc về 1 Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // N Lỗi bị gom vào 1 Incident
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "incident_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("bugReports")
    private Incident incident;
}