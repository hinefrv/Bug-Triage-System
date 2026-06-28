package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incidentID;

    @Column(columnDefinition = "TEXT")
    private String clusterSummary;

    private String createdPosition;
    private Double priorityScore;
    private String priorityLevel;
    private String status;

    // --- CÁC MỐI QUAN HỆ ---

    // 1 Incident gồm nhiều BugReport trùng lặp
    @OneToMany(mappedBy = "incident", fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("incident")
    private List<BugReport> bugReports;

    // Nhiều Incident có thể áp dụng chung 1 Quy tắc ưu tiên (PriorityRule)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private PriorityRule priorityRule;
}