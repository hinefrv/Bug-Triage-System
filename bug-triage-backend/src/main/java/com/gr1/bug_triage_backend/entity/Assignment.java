package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assignmentID;

    private LocalDateTime assignedTime;
    private LocalDateTime resolvedTime;

    @Column(columnDefinition = "TEXT")
    private String note;

    private String status;

    @ManyToOne
    @JoinColumn(name = "incident_id")
    private Incident incident;

    @ManyToOne
    @JoinColumn(name = "dev_id")
    private Developer developer;
}