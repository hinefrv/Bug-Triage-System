import { Bug, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useBugs } from "../../contexts/BugContext";
import { StatCard } from "../../components/StatCard";
import { ChartCard } from "../../components/ChartCard";
import { BugTable } from "../../components/BugTable";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
export default function ManagerDashboard() {
    const { bugs: mockBugs, loading, apiError, usingMockData, refreshBugs } = useBugs();
    const totalBugs = mockBugs.length;
    const criticalIncidents = mockBugs.filter((b) => b.severity === "P5" || b.severity === "P4").length;
    const pendingTriage = mockBugs.filter((b) => b.status === "Open").length;
    const resolvedThisWeek = mockBugs.filter((b) => b.status === "Resolved" || b.status === "Closed").length;
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
    const statusData = [
        { status: "Open", count: mockBugs.filter((b) => b.status === "Open").length },
        { status: "Triaged", count: mockBugs.filter((b) => b.status === "Triaged").length },
        { status: "Assigned", count: mockBugs.filter((b) => b.status === "Assigned").length },
        { status: "In Progress", count: mockBugs.filter((b) => b.status === "In Progress").length },
        { status: "Resolved", count: mockBugs.filter((b) => b.status === "Resolved").length },
    ];
    const componentData = [
        { component: "Backend", count: mockBugs.filter((b) => b.component === "Backend").length },
        { component: "Frontend", count: mockBugs.filter((b) => b.component === "Frontend").length },
        { component: "Database", count: mockBugs.filter((b) => b.component === "Database").length },
        { component: "DevOps", count: mockBugs.filter((b) => b.component === "DevOps").length },
        { component: "API", count: mockBugs.filter((b) => b.component === "API").length },
    ];
    const criticalBugs = mockBugs.filter((b) => b.severity === "P5" || b.severity === "P4").slice(0, 5);
    return (<div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển</h1>
        <p className="text-muted-foreground">Tổng quan về các báo cáo lỗi và sự cố</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Tổng số Lỗi" value={totalBugs} subtitle="+3 so với tuần trước" icon={Bug} iconBgColor="bg-primary/10" subtitleColor="text-green-600"/>
        <StatCard title="Sự cố Nghiêm trọng" value={criticalIncidents} subtitle="Cần chú ý ngay" icon={AlertCircle} iconBgColor="bg-red-100" subtitleColor="text-red-600"/>
        <StatCard title="Chờ phân loại" value={pendingTriage} subtitle="Đang chờ xem xét" icon={Clock} iconBgColor="bg-yellow-100" subtitleColor="text-yellow-600"/>
        <StatCard title="Đã giải quyết Tuần này" value={resolvedThisWeek} subtitle="Tiến độ tốt!" icon={CheckCircle2} iconBgColor="bg-green-100" subtitleColor="text-green-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Phân bổ mức độ nghiêm trọng">
          {visibleSeverityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={visibleSeverityData} cx="50%" cy="50%" labelLine={false} label={renderPieLabel} outerRadius={80} fill="#8884d8" dataKey="value">
                  {visibleSeverityData.map((entry) => (<Cell key={entry.id} fill={entry.color}/>))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Không có dữ liệu mức độ nghiêm trọng
            </div>
          )}
        </ChartCard>

        <ChartCard title="Tổng quan trạng thái Lỗi">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="status"/>
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0052cc"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Lỗi theo Thành phần">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={componentData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis type="number"/>
            <YAxis dataKey="component" type="category"/>
            <Tooltip />
            <Bar dataKey="count" fill="#36b37e"/>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Các Lỗi Nghiêm trọng Gần đây</h3>
        </div>
        <BugTable bugs={criticalBugs} columns={["id", "title", "source", "severity", "component", "cluster", "status", "assignee"]}/>
      </div>
    </div>);
}
