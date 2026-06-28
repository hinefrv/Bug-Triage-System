export const CLUSTER_DEFINITIONS = [
  {
    id: "CL-01",
    name: "Payment API Errors",
    description: "Issues related to payment processing failures and API timeout errors",
    keywords: ["payment", "checkout", "500", "timeout", "order"],
    component: "Backend",
    severity: "P5",
    representativeBugId: "BUG-1024",
  },
  {
    id: "CL-02",
    name: "Database Connection Issues",
    description: "Database deadlocks, connection timeouts, and transaction failures",
    keywords: ["database", "deadlock", "connection", "transaction", "timeout"],
    component: "Database",
    severity: "P4",
    representativeBugId: "BUG-1025",
  },
  {
    id: "CL-03",
    name: "Memory Leaks",
    description: "High RAM usage and memory leak issues in workers and services",
    keywords: ["memory", "leak", "ram", "worker", "oom"],
    component: "DevOps",
    severity: "P5",
    representativeBugId: "BUG-1026",
  },
  {
    id: "CL-04",
    name: "UI Validation Errors",
    description: "Form validation and error message display issues",
    keywords: ["validation", "form", "message", "display", "ui"],
    component: "Frontend",
    severity: "P2",
    representativeBugId: "BUG-1027",
  },
  {
    id: "CL-05",
    name: "API Performance Issues",
    description: "Slow API responses and timeout errors",
    keywords: ["api", "timeout", "slow", "performance", "response"],
    component: "API",
    severity: "P3",
    representativeBugId: "BUG-1028",
  },
  {
    id: "CL-06",
    name: "Authentication Problems",
    description: "Token expiration and login session issues",
    keywords: ["auth", "token", "session", "login", "jwt"],
    component: "Authentication",
    severity: "P3",
    representativeBugId: "BUG-1029",
  },
  {
    id: "CL-07",
    name: "Notification Delivery Failures",
    description: "Email, Slack, and in-app notification delivery problems",
    keywords: ["notification", "email", "delivery", "sent", "mail"],
    component: "Notification",
    severity: "P4",
    representativeBugId: "BUG-1030",
  },
  { id: "CL-08", name: "Deployment Pipeline Failures", description: "Build, deploy, and CI/CD pipeline failures", keywords: ["deploy", "pipeline", "build", "ci", "cd"], component: "DevOps", severity: "P3", representativeBugId: null },
  { id: "CL-09", name: "Permission and Access Issues", description: "Role, permission, and access control bugs", keywords: ["permission", "role", "access", "forbidden", "403"], component: "Authentication", severity: "P3", representativeBugId: null },
  { id: "CL-10", name: "Data Synchronization Errors", description: "Data mismatch, stale cache, and sync conflicts", keywords: ["sync", "cache", "stale", "mismatch", "conflict"], component: "Backend", severity: "P3", representativeBugId: null },
  { id: "CL-11", name: "Search and Filtering Issues", description: "Search, filtering, and sorting bugs", keywords: ["search", "filter", "sort", "query", "result"], component: "Frontend", severity: "P2", representativeBugId: null },
  { id: "CL-12", name: "File Upload Problems", description: "Attachment, import, and file upload issues", keywords: ["upload", "file", "attachment", "import", "csv"], component: "API", severity: "P2", representativeBugId: null },
  { id: "CL-13", name: "Monitoring Alert Noise", description: "False positives and noisy monitoring alerts", keywords: ["alert", "monitor", "noise", "false", "metric"], component: "DevOps", severity: "P2", representativeBugId: null },
  { id: "CL-14", name: "Mobile Layout Issues", description: "Responsive layout problems on smaller screens", keywords: ["mobile", "responsive", "layout", "screen", "width"], component: "Frontend", severity: "P1", representativeBugId: null },
  { id: "CL-15", name: "Unclassified Similar Bugs", description: "Fallback cluster for bugs that need manual review", keywords: ["unknown", "general", "misc", "review"], component: "Unclassified", severity: "P2", representativeBugId: null },
];

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function formatClusterId(rawClusterId) {
  if (!rawClusterId && rawClusterId !== 0) return null;
  const number = Number(rawClusterId);
  if (Number.isNaN(number)) return String(rawClusterId);
  const oneBased = number >= 0 && number < 15 ? number + 1 : number;
  return `CL-${String(oneBased).padStart(2, "0")}`;
}

export function getClusterDefinition(clusterId) {
  return CLUSTER_DEFINITIONS.find((cluster) => cluster.id === clusterId) || null;
}

export function inferClusterForBug(bug) {
  const explicitClusterId = bug.clusterId || bug.clusterID || formatClusterId(bug.kmeansClusterId);
  
  if (bug.clusterId === -1 || bug.clusterID === -1 || explicitClusterId === -1) {
    return getClusterDefinition("CL-15");
  }

  if (explicitClusterId) {
    const existing = getClusterDefinition(explicitClusterId);
    if (existing) return existing;
  }

  const text = normalizeText(`${bug.id || ""} ${bug.title || ""} ${bug.description || ""} ${bug.rawText || ""} ${bug.stackTrace || ""} ${bug.component || ""}`);
  let bestCluster = CLUSTER_DEFINITIONS[14];
  let bestScore = 0;

  for (const cluster of CLUSTER_DEFINITIONS) {
    const score = cluster.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestCluster = cluster;
    }
  }

  return bestCluster;
}

export function enrichBugWithCluster(bug) {
  if (!bug) return bug;
  const cluster = inferClusterForBug(bug);
  const similarityScore = bug.similarityScore ?? bug.clusterSimilarity ?? null;

  return {
    ...bug,
    component: bug.component || cluster.component || "Unclassified",
    clusterId: cluster.id,
    clusterName: bug.clusterName || cluster.name,
    clusterKeywords: bug.clusterKeywords || cluster.keywords,
    similarityScore,
  };
}

function severityWeight(severity) {
  const map = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
  return map[severity] || 0;
}

export function buildBugClusters(bugs) {
  const enrichedBugs = bugs.map(enrichBugWithCluster);

  return CLUSTER_DEFINITIONS.map((definition) => {
    const clusterBugs = enrichedBugs.filter((bug) => bug.clusterId === definition.id);
    const highestSeverity = clusterBugs.reduce((highest, bug) => severityWeight(bug.severity) > severityWeight(highest) ? bug.severity : highest, definition.severity);
    const componentCounts = clusterBugs.reduce((counts, bug) => {
      const component = bug.component || definition.component;
      counts[component] = (counts[component] || 0) + 1;
      return counts;
    }, {});
    const mainComponent = Object.entries(componentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || definition.component;
    const representativeBug = clusterBugs.find((bug) => bug.id === definition.representativeBugId) || clusterBugs[0] || null;

    return {
      ...definition,
      bugs: clusterBugs,
      bugCount: clusterBugs.length,
      highestSeverity,
      mainComponent,
      representativeBug,
      potentialDuplicates: Math.max(0, clusterBugs.length - 1),
      averageSimilarity: clusterBugs.length
        ? Math.round(clusterBugs.reduce((sum, bug) => sum + Number(bug.similarityScore || 0), 0) / clusterBugs.length)
        : 0,
    };
  });
}

export function getSimilarBugs(currentBug, bugs, limit = 5) {
  if (!currentBug) return [];
  const enrichedCurrent = enrichBugWithCluster(currentBug);
  return bugs
    .map(enrichBugWithCluster)
    .filter((bug) => bug.id !== enrichedCurrent.id && bug.clusterId === enrichedCurrent.clusterId)
    .sort((a, b) => Number(b.similarityScore || 0) - Number(a.similarityScore || 0))
    .slice(0, limit);
}
