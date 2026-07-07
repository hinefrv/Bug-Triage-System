import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockBugs, developers as mockDevelopers } from "../data/mockData";
import { enrichBugWithCluster } from "../utils/clusterUtils";
import { createBug as createBugApi, fetchBugs, normalizeBug, severityToPriority, updateBugApi, markAsDuplicateApi, linkToIncidentApi, createIncidentFromClusterApi } from "../api/bugApi";
import { getDevelopers } from "../api/developerApi";

const BugContext = createContext(null);

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function BugProvider({ children }) {
  const [bugs, setBugs] = useState(mockBugs.map(enrichBugWithCluster));
  const [developers, setDevelopers] = useState(mockDevelopers);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [usingMockData, setUsingMockData] = useState(true);

  async function refreshBugs() {
    setLoading(true);
    setApiError("");
    try {
      const [data, devData] = await Promise.all([
        fetchBugs(),
        getDevelopers().catch(() => null)
      ]);
      
      if (data.length > 0) {
        setBugs(data.map(enrichBugWithCluster));
        setUsingMockData(false);
      } else {
        setUsingMockData(true);
      }
      
      if (devData && devData.length > 0) {
        setDevelopers(devData);
      }
    } catch (error) {
      setApiError(error.message || "Cannot connect to backend API");
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      refreshBugs();
    }
  }, []);

  async function updateBugLocal(id, changes) {
    setBugs((current) => current.map((bug) => bug.id === id ? { ...bug, ...changes, updatedDate: today() } : bug));
    
    if (!usingMockData) {
      try {
        const payload = {};
        if (changes.status) payload.status = changes.status;
        if (changes.assignee !== undefined) payload.assignee = changes.assignee;
        if (changes.severityLabel) payload.severityLabel = changes.severityLabel;
        if (changes.severity) payload.severityLabel = changes.severity;
        if (changes.priority) payload.priority = changes.priority;
        
        if (Object.keys(payload).length > 0) {
          await updateBugApi(id, payload);
        }
      } catch (err) {
        console.error("Lỗi khi đồng bộ bug lên backend:", err);
      }
    }
  }

  async function addBug(payload) {
    setApiError("");
    try {
      const saved = await createBugApi(payload);
      setBugs((current) => [enrichBugWithCluster(saved), ...current.filter((bug) => bug.id !== saved.id)]);
      setUsingMockData(false);
      return saved;
    } catch (error) {
      const fallback = enrichBugWithCluster(normalizeBug({
        ...payload,
        id: payload.id || `BUG-${Date.now()}`,
        bugID: payload.bugID || payload.id || `BUG-${Date.now()}`,
        status: payload.status || "Open",
        severityLabel: payload.severity || "P3",
        createdDate: today(),
        updatedDate: today(),
      }));
      setBugs((current) => [fallback, ...current]);
      setApiError(`Backend chưa lưu được bug mới, đang lưu tạm trên UI: ${error.message}`);
      setUsingMockData(true);
      return fallback;
    }
  }

  function updateBugStatus(id, status) {
    updateBugLocal(id, { status });
  }

  function approveAISuggestion(id) {
    const bug = bugs.find((item) => item.id === id);
    if (!bug?.aiSuggestion) return;

    const suggestedAssignee =
      bug.aiSuggestion.assignee === "Unassigned"
        ? null
        : bug.aiSuggestion.assignee;

    updateBugLocal(id, {
      severity: bug.aiSuggestion.severity,
      severityLabel: bug.aiSuggestion.severity,
      priority:
        bug.aiSuggestion.priority ||
        severityToPriority(bug.aiSuggestion.severity),
      component: bug.aiSuggestion.component,
      assignee: suggestedAssignee,
      status: suggestedAssignee ? "Assigned" : "Triaged",

      aiApproved: true,
      classificationApplied: true,
    });
  }

  function rejectAISuggestion(id) {
    updateBugLocal(id, {
      aiSuggestion: null,
      status: "Open",
      aiApproved: false,
      classificationApplied: false,
    });
  }

  function assignBug(id, assignee) {
    updateBugLocal(id, { assignee, status: assignee ? "Assigned" : "Triaged" });
  }

  function editClassification(id, changes) {
    const nextChanges = {
      ...changes,
      classificationApplied: true,
    };

    if (!nextChanges.priority && nextChanges.severity) {
      nextChanges.priority = severityToPriority(nextChanges.severity);
    }

    if (!nextChanges.status) {
      nextChanges.status = "Triaged";
    }

    updateBugLocal(id, nextChanges);
  }

  async function markAsDuplicate(id, duplicateOf) {
    if (!duplicateOf) return;
    try {
      if (!usingMockData) {
        await markAsDuplicateApi(id, duplicateOf);
      }
      updateBugLocal(id, {
        isDuplicate: true,
        duplicateOf: duplicateOf,
        status: "Duplicate",
      });
    } catch (err) {
      console.error("Lỗi khi đánh dấu trùng lặp:", err);
      setApiError(err.message);
    }
  }

  async function linkToIncident(id, incidentId) {
    if (!incidentId) return;
    try {
      if (!usingMockData) {
        // Chỉ hỗ trợ gọi nếu Backend đã có API này, tạm thời log
        await linkToIncidentApi(id, incidentId).catch(() => console.log("Backend chưa có sẵn bảng Incidents, giả lập thành công"));
      }
      updateBugLocal(id, {
        incidentId,
        linkedIncidentId: incidentId,
      });
    } catch (err) {
      console.error("Lỗi khi link incident:", err);
    }
  }

  async function createIncidentFromCluster(id, clusterId, clusterName) {
    try {
      let newIncidentId = `INC-${Date.now().toString().slice(-6)}`;
      
      // Tìm tất cả các lỗi hiện có trong cụm này trên Frontend
      const bugIdsInCluster = bugs.filter(b => b.clusterId === clusterId).map(b => b.id);
      
      if (bugIdsInCluster.length === 0) {
          console.warn("Không tìm thấy lỗi nào trong cụm này để tạo sự cố!");
          return null;
      }

      // Luôn cố gắng gọi Backend API trước tiên, truyền danh sách bugIds
      const incident = await createIncidentFromClusterApi(bugIdsInCluster, clusterName).catch((err) => {
        console.warn("Lỗi khi gọi API tạo Incident, dùng ID giả lập", err);
        return null;
      });
      
      if (incident && incident.incidentID) {
        newIncidentId = `INC-${incident.incidentID}`;
      }
      
      // Cập nhật TẤT CẢ các lỗi trong cùng cụm trên Frontend thay vì chỉ 1 lỗi
      setBugs((current) => current.map((b) => 
        b.clusterId === clusterId ? { ...b, incidentId: newIncidentId, isIncident: true, updatedDate: today() } : b
      ));

      return newIncidentId;
    } catch (err) {
      console.error("Lỗi khi tạo sự cố từ cụm:", err);
      return null;
    }
  }

  function requestReview(id) {
    updateBugLocal(id, {
      reviewRequested: true,
      status: "Code Review",
    });
  }

  function saveDeveloperNotes(id, notes) {
    updateBugLocal(id, {
      rootCause: notes.rootCause || "",
      solution: notes.solution || "",
    });
  }

  function addComment(id, comment) {
    if (!comment?.trim()) return;
    const bug = bugs.find((item) => item.id === id);
    const newComment = {
      author: "Current User",
      text: comment.trim(),
      createdAt: new Date().toLocaleString(),
    };
    updateBugLocal(id, {
      comments: [...(bug?.comments || []), newComment],
    });
  }

  const value = useMemo(() => ({
    bugs,
    developers,
    loading,
    apiError,
    usingMockData,
    refreshBugs,
    addBug,
    updateBugStatus,
    approveAISuggestion,
    rejectAISuggestion,
    assignBug,
    editClassification,
    markAsDuplicate,
    linkToIncident,
    createIncidentFromCluster,
    requestReview,
    saveDeveloperNotes,
    addComment,
  }), [bugs, loading, apiError, usingMockData]);

  return <BugContext.Provider value={value}>{children}</BugContext.Provider>;
}

export function useBugs() {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error("useBugs must be used inside BugProvider");
  }
  return context;
}
