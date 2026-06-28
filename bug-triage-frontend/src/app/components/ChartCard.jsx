export function ChartCard({ title, children, className = "" }) {
    return (<div className={`bg-card p-6 rounded-lg border border-border ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      {children}
    </div>);
}
