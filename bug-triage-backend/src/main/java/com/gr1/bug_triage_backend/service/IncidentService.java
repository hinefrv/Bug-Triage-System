package com.gr1.bug_triage_backend.service;

import com.gr1.bug_triage_backend.entity.BugReport;
import com.gr1.bug_triage_backend.entity.Incident;
import com.gr1.bug_triage_backend.repository.BugReportRepository;
import com.gr1.bug_triage_backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private BugReportRepository bugRepository;

    public Incident createIncidentFromCluster(List<String> bugIds, String clusterName) {
        // 1. Tạo Incident mới
        Incident incident = new Incident();
        incident.setClusterSummary(clusterName != null ? clusterName : "Unclassified Cluster");
        incident.setStatus("OPEN");
        Incident savedIncident = incidentRepository.save(incident);

        // 2. Tìm tất cả bug theo danh sách ID và tính toán mức độ ưu tiên
        List<BugReport> bugs = bugRepository.findAllById(bugIds);
        String highestPriority = "P5"; // Giả định thấp nhất
        
        for (BugReport bug : bugs) {
            bug.setIncident(savedIncident);
            bugRepository.save(bug);
            
            // P1 là cao nhất, P5 là thấp nhất. So sánh chuỗi giảm dần.
            if (bug.getSeverityLabel() != null && bug.getSeverityLabel().compareTo(highestPriority) < 0) {
                highestPriority = bug.getSeverityLabel();
            }
        }
        
        savedIncident.setPriorityLevel(highestPriority);
        return incidentRepository.save(savedIncident);
    }
    
    public Incident updateIncidentStatus(Long id, String newStatus) {
        Incident incident = getIncidentById(id);
        if (incident != null) {
            incident.setStatus(newStatus.toUpperCase());
            return incidentRepository.save(incident);
        }
        return null;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id).orElse(null);
    }

    public void closeAllBugsInIncident(Long incidentId) {
        Incident incident = getIncidentById(incidentId);
        if (incident != null && incident.getBugReports() != null) {
            for (BugReport bug : incident.getBugReports()) {
                bug.setStatus("Closed");
                bugRepository.save(bug);
            }
        }
    }
}
