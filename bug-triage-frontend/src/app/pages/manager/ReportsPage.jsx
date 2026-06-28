import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartCard } from "../../components/ChartCard";
import { UserAvatar } from "../../components/UserAvatar";
import { SeverityBadge } from "../../components/SeverityBadge";
import { useBugs } from "../../contexts/BugContext";
export default function ReportsPage() {
    const { bugs: mockBugs, developers } = useBugs();
    const severityData = [
        { id: "p1", name: "P1 Low", value: mockBugs.filter((b) => b.severity === "P1").length, color: "#36b37e" },
        { id: "p2", name: "P2 Medium", value: mockBugs.filter((b) => b.severity === "P2").length, color: "#0052cc" },
        { id: "p3", name: "P3 High", value: mockBugs.filter((b) => b.severity === "P3").length, color: "#ffab00" },
        { id: "p4", name: "P4 Critical", value: mockBugs.filter((b) => b.severity === "P4").length, color: "#ff991f" },
        { id: "p5", name: "P5 Blocker", value: mockBugs.filter((b) => b.severity === "P5").length, color: "#de350b" },
    ];
    const visibleSeverityData = severityData.filter((item) => item.value > 0);
    const renderPieLabel = ({ name, percent, value }) => {
        if (!value || value === 0) return null;
        return `${name} ${(percent * 100).toFixed(0)}%`;
    };
    const componentData = [
        { component: "Backend", count: mockBugs.filter((b) => b.component === "Backend").length },
        { component: "Frontend", count: mockBugs.filter((b) => b.component === "Frontend").length },
        { component: "Database", count: mockBugs.filter((b) => b.component === "Database").length },
        { component: "DevOps", count: mockBugs.filter((b) => b.component === "DevOps").length },
        { component: "API", count: mockBugs.filter((b) => b.component === "API").length },
        { component: "Auth", count: mockBugs.filter((b) => b.component === "Authentication").length },
        { component: "Notif", count: mockBugs.filter((b) => b.component === "Notification").length },
    ];
    const weeklyTrendData = [
        { week: "Tuần 1", bugs: 12 },
        { week: "Tuần 2", bugs: 19 },
        { week: "Tuần 3", bugs: 15 },
        { week: "Tuần 4", bugs: 25 },
        { week: "Tuần 5", bugs: 22 },
        { week: "Tuần 6", bugs: 18 },
    ];
    const resolutionTimeData = [
        { priority: "Low", time: 8.5 },
        { priority: "Medium", time: 6.2 },
        { priority: "High", time: 4.1 },
        { priority: "Urgent", time: 2.8 },
    ];
    const incidentHistory = [
        { date: "2026-05-29", title: "Payment Gateway Down", severity: "P5", duration: "2.5h", impact: "High" },
        { date: "2026-05-27", title: "Database Connection Lost", severity: "P5", duration: "1.8h", impact: "Critical" },
        { date: "2026-05-25", title: "API Rate Limit Exceeded", severity: "P4", duration: "45m", impact: "Medium" },
        { date: "2026-05-23", title: "Authentication Service Slow", severity: "P4", duration: "3.2h", impact: "High" },
        { date: "2026-05-20", title: "Memory Leak in Worker", severity: "P5", duration: "4.5h", impact: "Critical" },
    ];
    return (<div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Báo cáo & Phân tích</h1>
        <p className="text-muted-foreground">Hiệu suất nhóm và thống kê lỗi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Lỗi theo Mức độ">
          {visibleSeverityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={visibleSeverityData} cx="50%" cy="50%" labelLine={false} label={renderPieLabel} outerRadius={100} fill="#8884d8" dataKey="value">
                  {visibleSeverityData.map((entry) => (<Cell key={entry.id} fill={entry.color}/>))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </ChartCard>

        <ChartCard title="Lỗi theo Thành phần">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={componentData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="component"/>
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0052cc"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Xu hướng Xử lý Lỗi (Hàng tuần)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyTrendData}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="week"/>
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bugs" stroke="#0052cc" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Thời gian Xử lý Trung bình theo Độ ưu tiên (Giờ)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={resolutionTimeData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="priority"/>
            <YAxis />
            <Tooltip />
            <Bar dataKey="time" fill="#36b37e"/>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Hiệu suất Lập trình viên</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lập trình viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Số lỗi được giao
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Đã xử lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Đang xử lý
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thời gian xử lý TB
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Lỗi nghiêm trọng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Hiệu suất
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {developers.map((dev) => {
            const performance = (dev.resolvedBugs / (dev.resolvedBugs + dev.inProgress)) * 100;
            return (<tr key={dev.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={dev.name} size="md"/>
                        <div>
                          <p className="font-medium text-foreground">{dev.name}</p>
                          <p className="text-xs text-muted-foreground">{dev.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-foreground font-medium">{dev.assignedBugs}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-600 font-medium">{dev.resolvedBugs}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-yellow-600 font-medium">{dev.inProgress}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-foreground">{dev.avgResolutionTime}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-red-600 font-medium">{dev.criticalBugsHandled}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${performance}%` }}/>
                        </div>
                        <span className="text-sm text-foreground">{performance.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Lịch sử Sự cố Nghiêm trọng</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tên Sự cố
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mức độ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thời lượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tác động
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {incidentHistory.map((incident, index) => (<tr key={index} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{incident.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">{incident.title}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge severity={incident.severity}/>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground">{incident.duration}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${incident.impact === "Critical"
                ? "text-red-600"
                : incident.impact === "High"
                    ? "text-orange-600"
                    : "text-yellow-600"}`}>
                      {incident.impact}
                    </span>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
