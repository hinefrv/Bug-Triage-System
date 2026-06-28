export function SeverityBadge({ severity, className = "" }) {
    const variants = {
        P1: "bg-green-100 text-green-800 border-green-200",
        P2: "bg-blue-100 text-blue-800 border-blue-200",
        P3: "bg-yellow-100 text-yellow-800 border-yellow-200",
        P4: "bg-orange-100 text-orange-800 border-orange-200",
        P5: "bg-red-100 text-red-800 border-red-200",
    };
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${variants[severity]} ${className}`}>
      {severity}
    </span>);
}
