export function StatusBadge({ status, className = "" }) {
    const variants = {
        Open: "bg-gray-100 text-gray-800 border-gray-200",
        Triaged: "bg-purple-100 text-purple-800 border-purple-200",
        Assigned: "bg-blue-100 text-blue-800 border-blue-200",
        "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
        "Code Review": "bg-indigo-100 text-indigo-800 border-indigo-200",
        Resolved: "bg-green-100 text-green-800 border-green-200",
        Closed: "bg-gray-200 text-gray-600 border-gray-300",
    };
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${variants[status]} ${className}`}>
      {status}
    </span>);
}
