import { Bug, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { StatCard } from "../../components/StatCard";
import { ChartCard } from "../../components/ChartCard";
import { BugTable } from "../../components/BugTable";
import { useBugs } from "../../contexts/BugContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
export default function DeveloperDashboard() {
    const { bugs: mockBugs } = useBugs();
    const developerName = "Minh Tran";
    const myBugs = mockBugs.filter((b) => b.assignee === developerName);
    const assignedToMe = myBugs.length;
    const inProgress = myBugs.filter((b) => b.status === "In Progress").length;
    const criticalBugs = myBugs.filter((b) => b.severity === "P5" || b.severity === "P4").length;
    const dueSoon = myBugs.filter((b) => b.dueDate && new Date(b.dueDate) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)).length;
    const statusData = [
        { status: "Assigned", count: myBugs.filter((b) => b.status === "Assigned").length },
        { status: "In Progress", count: inProgress },
        { status: "Code Review", count: myBugs.filter((b) => b.status === "Code Review").length },
        { status: "Resolved", count: myBugs.filter((b) => b.status === "Resolved").length },
    ];
    return (<div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển</h1>
        <p className="text-muted-foreground">Chào mừng trở lại, {developerName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Giao cho tôi" value={assignedToMe} subtitle="Nhiệm vụ đang mở" icon={Bug} iconBgColor="bg-primary/10" subtitleColor="text-blue-600"/>
        <StatCard title="Đang xử lý" value={inProgress} subtitle="Đang tiến hành" icon={Clock} iconBgColor="bg-yellow-100" subtitleColor="text-yellow-600"/>
        <StatCard title="Lỗi nghiêm trọng" value={criticalBugs} subtitle="Ưu tiên cao" icon={AlertCircle} iconBgColor="bg-red-100" subtitleColor="text-red-600"/>
        <StatCard title="Sắp đến hạn" value={dueSoon} subtitle="Trong 48 giờ tới" icon={CheckCircle2} iconBgColor="bg-orange-100" subtitleColor="text-orange-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Danh sách Lỗi của tôi</h3>
          </div>
          <BugTable bugs={myBugs} linkPrefix="/developer/bugs" columns={["id", "title", "severity", "priority", "status", "dueDate"]}/>
        </div>

        <div className="space-y-6">
          <ChartCard title="Khối lượng công việc">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="status" angle={-45} textAnchor="end" height={80}/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0052cc"/>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Thống kê trong tuần</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Lỗi đã giải quyết tuần này</p>
                  <span className="text-lg font-bold text-foreground">12</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}/>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Thời gian xử lý trung bình</p>
                  <span className="text-lg font-bold text-foreground">4.2h</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}/>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Lỗi nghiêm trọng đã xử lý</p>
                  <span className="text-lg font-bold text-foreground">5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: "50%" }}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
