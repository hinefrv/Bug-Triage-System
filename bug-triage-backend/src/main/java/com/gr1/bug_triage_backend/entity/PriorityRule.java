package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "priority_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriorityRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleID;

    private String ruleName;
    private Double severityWeight;
    private Double frequencyWeight;
    private Double impactWeight;

    // 1 Quy tắc có thể áp dụng cho nhiều Incident
    @OneToMany(mappedBy = "priorityRule")
    private List<Incident> incidents;
}