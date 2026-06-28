package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "sources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Source {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sourceID;

    private String sourceName;

    // Quan hệ 1-N: 1 Source có nhiều BugReport
    @OneToMany(mappedBy = "source", cascade = CascadeType.ALL)
    private List<BugReport> bugReports;
}