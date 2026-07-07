const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  console.log("FETCH request to", path, "Token present?", !!token, "Token prefix:", token ? token.substring(0, 15) : "none");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function normalizeBug(raw) {
  if (!raw) return raw;

  const severity = raw.severity || raw.severityLabel || "P3";
  const component = raw.component || raw.category?.categoryName || raw.componentLabel || "Unclassified";
  const rawClusterId = raw.clusterId ?? raw.clusterID ?? raw.kmeansClusterId ?? raw.clusterLabel;
  const source = raw.source || raw.source?.sourceName || raw.sourceName || "Backend API";
  const status = normalizeStatus(raw.status);
  const id = raw.id || raw.bugID || raw.bugId;

  return {
    ...raw,
    id,
    bugID: raw.bugID || id,
    title: raw.title || "Untitled bug",
    description: raw.description || raw.rawText || "No description",
    rawText: raw.rawText || `${raw.title || ""} ${raw.description || ""}`.trim(),
    stackTrace: raw.stackTrace || "",
    severity,
    severityLabel: severity,
    priority: raw.priority || severityToPriority(severity),
    component,
    clusterId: rawClusterId,
    clusterName: raw.clusterName || raw.clusterLabel || "",
    similarityScore: raw.similarityScore || raw.clusterSimilarity || raw.duplicateScore || null,
    status,
    source,
    assignee: raw.assignee || null,
    duplicateOf: raw.duplicateOf || null,
    incidentId: raw.incident?.incidentID || null,
    reporter: raw.reporter || "System",
    createdDate: raw.createdDate || raw.createdAt || new Date().toISOString().slice(0, 10),
    updatedDate: raw.updatedDate || raw.updatedAt || new Date().toISOString().slice(0, 10),
    dueDate: raw.dueDate || "",
    aiSuggestion: raw.aiSuggestion || {
      severity,
      priority: raw.priority || severityToPriority(severity),
      component,
      assignee: raw.aiSuggestedAssignee || raw.assignee || "Unassigned",
      confidence: raw.aiConfidence != null ? raw.aiConfidence : 86,
      explanation: raw.clusterId === -1
        ? "AI đã xử lý nhưng độ tương đồng quá thấp (<80%), tạm thời đưa vào danh sách chưa phân cụm."
        : "AI service classified this bug based on raw text and developer profiles.",
    },
  };
}

export function normalizeBugs(rawBugs) {
  return Array.isArray(rawBugs) ? rawBugs.map(normalizeBug) : [];
}

export function severityToPriority(severity) {
  switch (severity) {
    case "P5":
      return "Urgent";
    case "P4":
      return "High";
    case "P3":
      return "Medium";
    case "P2":
      return "Low";
    case "P1":
      return "Lowest";
    default:
      return "Medium";
  }
}

export function normalizeStatus(status) {
  if (!status) return "Open";
  const map = {
    NEW: "Open",
    OPEN: "Open",
    TRIAGED: "Triaged",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    CODE_REVIEW: "Code Review",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  };
  return map[String(status).toUpperCase()] || status;
}

export async function fetchBugs() {
  return normalizeBugs(await request("/bugs"));
}

export async function createBug(payload) {
  const backendPayload = {
    bugID: payload.id || payload.bugID || `BUG-${Date.now()}`,
    title: payload.title,
    description: payload.description,
    rawText: payload.rawText || `${payload.title || ""} ${payload.description || ""}`.trim(),
    stackTrace: payload.stackTrace || "",
    status: payload.status || "NEW",
    assignee: payload.assignee || null,
  };

  return normalizeBug(await request("/bugs", {
    method: "POST",
    body: JSON.stringify(backendPayload),
  }));
}

export async function updateBugApi(id, payload) {
  const backendPayload = {};
  if (payload.status) backendPayload.status = payload.status;
  if (payload.assignee !== undefined) backendPayload.assignee = payload.assignee;
  if (payload.severityLabel) backendPayload.severityLabel = payload.severityLabel;
  if (payload.priority) backendPayload.priority = payload.priority;

  return normalizeBug(await request(`/bugs/${id}`, {
    method: "PUT",
    body: JSON.stringify(backendPayload),
  }));
}

export async function markAsDuplicateApi(bugId, targetId) {
  return normalizeBug(await request(`/bugs/${bugId}/duplicate/${targetId}`, {
    method: "POST"
  }));
}

export async function linkToIncidentApi(bugId, incidentId) {
  return normalizeBug(await request(`/bugs/${bugId}/link-incident/${incidentId}`, {
    method: "POST"
  }));
}

export async function createIncidentFromClusterApi(bugIds, clusterName) {
  return await request(`/incidents/create-from-cluster`, {
    method: "POST",
    body: JSON.stringify({ bugIds, clusterName })
  });
}
