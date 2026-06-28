package com.gr1.bug_triage_backend.service;

import org.springframework.transaction.annotation.Transactional;
import com.gr1.bug_triage_backend.entity.BugReport;
import com.gr1.bug_triage_backend.entity.Developer;
import com.gr1.bug_triage_backend.entity.DeveloperSkill;
import com.gr1.bug_triage_backend.entity.Incident;
import com.gr1.bug_triage_backend.repository.BugReportRepository;
import com.gr1.bug_triage_backend.repository.DeveloperRepository;
import com.gr1.bug_triage_backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class BugReportService {

    @Autowired
    private BugReportRepository bugRepository;
    @Autowired
    private DeveloperRepository developerRepository;

    // Gọi API REST
    private final RestTemplate restTemplate = new RestTemplate();

    private final String DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/your_webhook_id";

    public List<BugReport> getAllBugs() {
        return bugRepository.findAll();
    }

    @Transactional
    public BugReport saveBug(BugReport bugReport) {
        // Tự động gộp tiêu đề và mô tả theo đúng quy trình xử lý data
        String rawText = bugReport.getTitle() + " " + bugReport.getDescription();
        String aiUrl = "http://127.0.0.1:8000/api/predict";

        try {
            // Dong goi Headers va Body JSON dang {"raw_text": "..."}
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            List<Developer> allDevelopers = developerRepository.findAll();
            Map<String, String> devProfiles = new HashMap<>();

            for (Developer dev : allDevelopers) {
                if (dev.getName() != null) {
                    StringBuilder skillTags = new StringBuilder();

                    if (dev.getDeveloperSkills() != null) {
                        for (DeveloperSkill ds : dev.getDeveloperSkills()) {
                            if (ds.getSkill() != null && ds.getSkill().getSkillTag() != null) {
                                skillTags.append(ds.getSkill().getSkillTag()).append(" ");
                            }
                        }
                    }

                    if (skillTags.length() > 0) {
                        devProfiles.put(dev.getName(), skillTags.toString().trim());
                    }
                }
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("raw_text", rawText);
            requestBody.put("developer_profiles", devProfiles);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Goi API sang FastAPI
            ResponseEntity<Map> response = restTemplate.postForEntity(aiUrl, request, Map.class);
            Map<String, Object> responseBody = response.getBody();

            // Boc tach ket qua
            if (responseBody != null && "success".equals(responseBody.get("status"))) {
                String aiSeverity = (String) responseBody.get("severity");
                Integer aiClusterId = (Integer) responseBody.get("cluster_id");
                String aiAssignee = (String) responseBody.get("assignee");
                String aiComponent = (String) responseBody.get("component");
                
                Double aiConfidence = null;
                if (responseBody.get("match_confidence") instanceof Number) {
                    aiConfidence = ((Number) responseBody.get("match_confidence")).doubleValue();
                }
                
                Double clusterSim = null;
                if (responseBody.get("cluster_similarity") instanceof Number) {
                    clusterSim = ((Number) responseBody.get("cluster_similarity")).doubleValue();
                }

                // Gan ket qua vao Entity
                bugReport.setClusterId(aiClusterId);
                bugReport.setSeverityLabel(aiSeverity);
                bugReport.setComponentLabel(aiComponent != null ? aiComponent : "Unclassified");
                bugReport.setAiConfidence(aiConfidence);
                bugReport.setSimilarityScore(clusterSim);

                // Goi y phan cong
                // bugReport.setAssignee(suggestAssignee(rawText));
                bugReport.setAssignee(aiAssignee);

                // Canh bao khan cap (Webhook)
                if ("P4".equals(aiSeverity) || "P5".equals(aiSeverity)) {
                    sendUrgentAlert(bugReport.getTitle(), aiSeverity);
                }

                System.out.println(
                        "[AI Microservice] Phán đoán -> Mức độ: " + aiSeverity + " | Thuộc cụm: " + aiClusterId);
            } else {
                System.err.println("❌ PYTHON BÁO LỖI: " + responseBody.get("message"));
                // Fallback
                fallbackBug(bugReport);
            }
        } catch (Exception e) {
            System.err.println("Lỗi kết nối đến AI Server (FastAPI): " + e.getMessage());
            // Tu dong gan nhan an toan neu server Python chua bat
            bugReport.setSeverityLabel("P3");
            bugReport.setClusterId(-1);
        }

        bugReport.setStatus("NEW");

        return bugRepository.save(bugReport);
    }

    // Fallback
    private void fallbackBug(BugReport bugReport) {
        bugReport.setSeverityLabel("P3");
        bugReport.setClusterId(-1);
        bugReport.setComponentLabel("Unclassified");
        bugReport.setAssignee("Manager");
    }

    // // Phan tich giao viec
    // private String suggestAssignee(String text) {
    // String lowerText = text.toLowerCase();
    // if (lowerText.contains("database") || lowerText.contains("sql") ||
    // lowerText.contains("500")) {
    // return "Backend Team";
    // } else if (lowerText.contains("ui") || lowerText.contains("button") ||
    // lowerText.contains("màu")) {
    // return "Frontend Team";
    // } else if (lowerText.contains("server") || lowerText.contains("timeout") ||
    // lowerText.contains("memory")) {
    // return "DevOps Team";
    // }
    //
    // return "Support Team";
    // }

    private void sendUrgentAlert(String title, String severity) {
        try {
            Map<String, String> discordMsg = new HashMap<>();
            discordMsg.put("content",
                    "CẢNH BÁO KHẨN CẤP (" + severity + "): " + title + "\nĐề nghị team DevOps kiểm tra ngay lập tức!");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(discordMsg, headers);

            // Bo cmt neu co link Discord
            // restTemplate.postForEntity(DISCORD_WEBHOOK_URL, entity, String.class);
            System.out.println("[WEBHOOK BẮN RA]: " + discordMsg.get("content"));
        } catch (Exception e) {
            System.err.println("Không thể gửi Webhook");
        }
    }

    // Lay danh sach Bug theo Asssignee
    public List<BugReport> getBugsByAssignee(String assigneeEmail) {
        return bugRepository.findByAssignee(assigneeEmail);
    }

    // Cap nhat status cua Bug khi keo tha
    @Transactional
    public BugReport updateStatus(String bugId, String status) {
        BugReport bug = bugRepository.findById(bugId).orElseThrow(() -> new RuntimeException("Bug not found"));
        bug.setStatus(status);
        return bugRepository.save(bug);
    }

    // Cap nhat nhieu field cung luc
    @Transactional
    public BugReport updateBug(String bugId, BugReport bugDetails) {
        BugReport bug = bugRepository.findById(bugId).orElseThrow(() -> new RuntimeException("Bug not found"));
        if (bugDetails.getStatus() != null) bug.setStatus(bugDetails.getStatus());
        if (bugDetails.getAssignee() != null) bug.setAssignee(bugDetails.getAssignee());
        if (bugDetails.getSeverityLabel() != null) bug.setSeverityLabel(bugDetails.getSeverityLabel());
        // Co the them update clusterId neu can trong tuong lai
        return bugRepository.save(bug);
    }

    public BugReport markAsDuplicate(String bugId, String targetId) {
        BugReport bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Bug với ID: " + bugId));
        
        bug.setStatus("Duplicate");
        bug.setDuplicateOf(targetId);
        return bugRepository.save(bug);
    }

    @Autowired
    private IncidentRepository incidentRepository;

    public BugReport linkToIncident(String bugId, Long incidentId) {
        BugReport bug = bugRepository.findById(bugId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Bug với ID: " + bugId));
        
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Incident với ID: " + incidentId));
                
        bug.setIncident(incident);
        return bugRepository.save(bug);
    }
}