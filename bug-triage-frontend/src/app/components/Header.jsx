import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Search, Bell, User, LogOut, Settings, Bug as BugIcon, AlertTriangle } from "lucide-react";
import { logout, getCurrentUser } from "../utils/auth";
import { useBugs } from "../contexts/BugContext";

export function Header({ title }) {
  const navigate = useNavigate();
  const { bugs } = useBugs();
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const currentUser = getCurrentUser() || { name: "Manager User", email: "manager@bugtriage.com", role: "MANAGER" };

  const searchResults = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return bugs
      .filter((bug) =>
        bug.id?.toLowerCase().includes(keyword) ||
        bug.title?.toLowerCase().includes(keyword) ||
        bug.component?.toLowerCase().includes(keyword) ||
        bug.clusterName?.toLowerCase().includes(keyword)
      )
      .slice(0, 6);
  }, [bugs, query]);

  const notifications = useMemo(() => {
    const criticalCount = bugs.filter((bug) => bug.severity === "P5" && bug.status !== "Closed").length;
    const unassignedCount = bugs.filter((bug) => !bug.assignee && bug.status !== "Closed").length;
    const triageCount = bugs.filter((bug) => bug.aiSuggestion).length;
    return [
      { title: `${criticalCount} blocker bugs need attention`, description: "Review P5 issues", to: "/manager/bugs", icon: AlertTriangle },
      { title: `${unassignedCount} bugs are unassigned`, description: "Assign developers", to: "/manager/assignment-board", icon: User },
      { title: `${triageCount} AI suggestions pending`, description: "Approve or reject triage results", to: "/manager/ai-triage", icon: BugIcon },
    ];
  }, [bugs]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between relative z-20">
      <div className="flex items-center gap-4 flex-1">
        {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
        <div className="flex-1 max-w-md ml-auto relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bugs..."
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {query && (
            <div className="absolute right-0 left-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {searchResults.length > 0 ? (
                searchResults.map((bug) => (
                  <Link
                    key={bug.id}
                    to={`/manager/bugs/${bug.id}`}
                    onClick={() => setQuery("")}
                    className="block px-4 py-3 hover:bg-accent border-b border-border last:border-b-0"
                  >
                    <p className="text-sm font-medium text-foreground">{bug.id} · {bug.title}</p>
                    <p className="text-xs text-muted-foreground">{bug.component} · {bug.status} · {bug.clusterId || "No cluster"}</p>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">No bugs found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="relative">
          <button
            className="p-2 hover:bg-accent rounded-md relative"
            type="button"
            onClick={() => {
              setShowNotifications((value) => !value);
              setShowAccount(false);
            }}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border font-semibold text-foreground">Notifications</div>
              {notifications.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    to={item.to}
                    onClick={() => setShowNotifications(false)}
                    className="flex gap-3 px-4 py-3 hover:bg-accent border-b border-border last:border-b-0"
                  >
                    <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
            type="button"
            onClick={() => {
              setShowAccount((value) => !value);
              setShowNotifications(false);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
          </button>
          {showAccount && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="font-semibold text-foreground">{currentUser.name || "Manager User"}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email || "manager@bugtriage.com"}</p>
                <p className="text-xs text-primary mt-1">{currentUser.role || "MANAGER"}</p>
              </div>
              <Link to="/manager/settings" onClick={() => setShowAccount(false)} className="flex items-center gap-2 px-4 py-3 hover:bg-accent text-sm text-foreground">
                <Settings className="w-4 h-4" />
                Account settings
              </Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-destructive/10 text-sm text-destructive">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
