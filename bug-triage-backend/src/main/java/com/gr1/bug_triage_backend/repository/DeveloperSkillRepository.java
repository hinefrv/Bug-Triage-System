package com.gr1.bug_triage_backend.repository;

import com.gr1.bug_triage_backend.entity.DeveloperSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeveloperSkillRepository extends JpaRepository<DeveloperSkill, Long> {
}
