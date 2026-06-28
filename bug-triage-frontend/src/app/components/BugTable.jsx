import { Link } from "react-router";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { UserAvatar } from "./UserAvatar";
export function BugTable({ bugs, showCheckbox = false, linkPrefix = "/manager/bugs", columns = ["id", "title", "source", "severity", "component", "status", "assignee"], }) {
    const columnHeaders = {
        checkbox: "",
        id: "Bug ID",
        title: "Title",
        source: "Source",
        severity: "Severity",
        priority: "Priority",
        component: "Component",
        cluster: "Cluster",
        similarity: "Similarity",
        status: "Status",
        assignee: "Assignee",
        created: "Created",
        updated: "Last Updated",
        dueDate: "Due Date",
    };
    return (<div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {showCheckbox && (<th className="px-4 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4 rounded border-border"/>
                </th>)}
              {columns.map((col) => (<th key={col} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {columnHeaders[col]}
                </th>))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {bugs.map((bug) => (<tr key={bug.id} className="hover:bg-muted/50">
                {showCheckbox && (<td className="px-4 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded border-border"/>
                  </td>)}
                {columns.map((col) => (<td key={`${bug.id}-${col}`} className="px-6 py-4 whitespace-nowrap">
                    {col === "id" && (<Link to={`${linkPrefix}/${bug.id}`} className="text-primary hover:underline font-medium">
                        {bug.id}
                      </Link>)}
                    {col === "title" && (<div className="text-sm text-foreground max-w-md truncate">{bug.title}</div>)}
                    {col === "source" && <span className="text-sm text-muted-foreground">{bug.source}</span>}
                    {col === "severity" && <SeverityBadge severity={bug.severity}/>}
                    {col === "priority" && <span className="text-sm text-foreground">{bug.priority}</span>}
                    {col === "component" && <span className="text-sm text-foreground">{bug.component}</span>}
                    {col === "cluster" && (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {bug.clusterId || "CL-N/A"}
                        </span>
                        <span className="text-xs text-muted-foreground max-w-[160px] truncate">{bug.clusterName || "Unclassified"}</span>
                      </div>
                    )}
                    {col === "similarity" && (
                      <span className="text-sm text-foreground">
                        {bug.similarityScore ? `${bug.similarityScore}%` : "N/A"}
                      </span>
                    )}
                    {col === "status" && <StatusBadge status={bug.status}/>}
                    {col === "assignee" &&
                    (bug.assignee ? (<div className="flex items-center gap-2">
                          <UserAvatar name={bug.assignee} size="sm"/>
                          <span className="text-sm text-foreground">{bug.assignee}</span>
                        </div>) : (<span className="text-sm text-muted-foreground">Unassigned</span>))}
                    {col === "created" && <span className="text-sm text-muted-foreground">{bug.createdDate}</span>}
                    {col === "updated" && <span className="text-sm text-muted-foreground">{bug.updatedDate}</span>}
                    {col === "dueDate" && (<span className="text-sm text-muted-foreground">{bug.dueDate || "N/A"}</span>)}
                  </td>))}
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
}
