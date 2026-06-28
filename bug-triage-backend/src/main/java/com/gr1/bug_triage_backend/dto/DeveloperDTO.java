package com.gr1.bug_triage_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class DeveloperDTO {
    private Long id;
    private String name;
    private String email;
    private Integer resolvedBugsCount;
    private List<SkillDTO> skills;
    private List<BugDTO> assignedBugs;

    @Data
    public static class SkillDTO {
        private String skillName;
        private Integer proficiencyLevel;
    }

    @Data
    public static class BugDTO {
        private String bugId;
        private String title;
        private String severity;
        private String status;
    }
}
