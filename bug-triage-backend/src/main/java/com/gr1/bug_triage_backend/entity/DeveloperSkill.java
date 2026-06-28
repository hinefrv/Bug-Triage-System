package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "developer_skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeveloperSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dev_id")
    private Developer developer;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    // Trình độ của Developer đối với Skill này
    private Integer proficiencyLevel;
}