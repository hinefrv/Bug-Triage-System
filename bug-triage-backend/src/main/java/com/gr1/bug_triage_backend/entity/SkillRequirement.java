package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillRequirement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requirementID;

    // Mức độ yêu cầu
    private Integer proficiencyLevel;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;
}