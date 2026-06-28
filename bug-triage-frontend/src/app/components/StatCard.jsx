export function StatCard({ title, value, subtitle, icon: Icon, iconBgColor = "bg-primary/10", subtitleColor = "text-green-600", }) {
    return (<div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className={`text-xs mt-1 ${subtitleColor}`}>{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6"/>
        </div>
      </div>
    </div>);
}
