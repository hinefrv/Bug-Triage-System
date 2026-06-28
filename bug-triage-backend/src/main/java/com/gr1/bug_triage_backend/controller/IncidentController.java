package com.gr1.bug_triage_backend.controller;

import com.gr1.bug_triage_backend.entity.Incident;
import com.gr1.bug_triage_backend.service.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @PostMapping("/create-from-cluster")
    public ResponseEntity<Incident> createFromCluster(@RequestBody Map<String, Object> request) {
        String clusterName = (String) request.get("clusterName");
        List<String> bugIds = (List<String>) request.get("bugIds");
        Incident incident = incidentService.createIncidentFromCluster(bugIds, clusterName);
        return ResponseEntity.ok(incident);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable Long id) {
        Incident incident = incidentService.getIncidentById(id);
        if (incident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(incident);
    }

    @PostMapping("/{id}/close-all-bugs")
    public ResponseEntity<Void> closeAllBugsInIncident(@PathVariable Long id) {
        incidentService.closeAllBugsInIncident(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateIncidentStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");
        Incident updatedIncident = incidentService.updateIncidentStatus(id, newStatus);
        if (updatedIncident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedIncident);
    }
}
