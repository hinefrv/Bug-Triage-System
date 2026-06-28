export function PriorityBadge({ priority, className = "" }) {
    const variants = {
        Low: "bg-gray-100 text-gray-700 border-gray-200",
        Medium: "bg-blue-100 text-blue-700 border-blue-200",
        High: "bg-orange-100 text-orange-700 border-orange-200",
        Urgent: "bg-red-100 text-red-700 border-red-200",
    };
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${variants[priority]} ${className}`}>
      {priority}
    </span>);
}
