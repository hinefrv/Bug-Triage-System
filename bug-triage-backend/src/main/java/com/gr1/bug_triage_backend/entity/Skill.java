package com.gr1.bug_triage_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long skillID;

    private String skillTag;

    @OneToMany(mappedBy = "skill")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<DeveloperSkill> developerSkills;

    @OneToMany(mappedBy = "skill")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<SkillRequirement> skillRequirements;
}