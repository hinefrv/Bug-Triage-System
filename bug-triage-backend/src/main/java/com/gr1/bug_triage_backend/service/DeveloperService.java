package com.gr1.bug_triage_backend.service;

import com.gr1.bug_triage_backend.dto.DeveloperDTO;
import com.gr1.bug_triage_backend.entity.BugReport;
import com.gr1.bug_triage_backend.entity.Developer;
import com.gr1.bug_triage_backend.entity.DeveloperSkill;
import com.gr1.bug_triage_backend.repository.BugReportRepository;
import com.gr1.bug_triage_backend.repository.DeveloperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeveloperService {
    @Autowired
    private DeveloperRepository developerRepository;

    @Autowired
    private BugReportRepository bugRepository;

    public List<DeveloperDTO> getAllDevelopers() {
        return developerRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public DeveloperDTO getDeveloperById(Long id) {
        Developer dev = developerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Developer not found"));
        return mapToDTO(dev);
    }

    private DeveloperDTO mapToDTO(Developer dev) {
        DeveloperDTO dto = new DeveloperDTO();
        dto.setId(dev.getDevID());
        dto.setName(dev.getName());
        dto.setEmail(dev.getEmail());
        dto.setResolvedBugsCount(dev.getResolvedBugsCount());

        List<DeveloperDTO.SkillDTO> skillDTOs = new ArrayList<>();
        if (dev.getDeveloperSkills() != null) {
            for (DeveloperSkill ds : dev.getDeveloperSkills()) {
                DeveloperDTO.SkillDTO sDto = new DeveloperDTO.SkillDTO();
                sDto.setSkillName(ds.getSkill().getSkillTag());
                sDto.setProficiencyLevel(ds.getProficiencyLevel());
                skillDTOs.add(sDto);
            }
        }
        dto.setSkills(skillDTOs);

        List<DeveloperDTO.BugDTO> bugDTOs = new ArrayList<>();
        List<BugReport> assignedBugs = bugRepository.findByAssignee(dev.getEmail());
        for (BugReport bug : assignedBugs) {
            DeveloperDTO.BugDTO bDto = new DeveloperDTO.BugDTO();
            bDto.setBugId(bug.getBugID());
            bDto.setTitle(bug.getTitle());
            bDto.setSeverity(bug.getSeverityLabel());
            bDto.setStatus(bug.getStatus());
            bugDTOs.add(bDto);
        }
        dto.setAssignedBugs(bugDTOs);

        return dto;
    }
}
