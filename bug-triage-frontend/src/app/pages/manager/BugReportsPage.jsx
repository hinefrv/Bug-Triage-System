import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import { BugTable } from "../../components/BugTable";
import { useBugs } from "../../contexts/BugContext";
export default function BugReportsPage() {
    const { bugs: mockBugs, addBug, loading, apiError, usingMockData, refreshBugs } = useBugs();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", stackTrace: "", source: "Manual" });
    const [selectedSeverity, setSelectedSeverity] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedComponent, setSelectedComponent] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    async function handleCreateBug(e) {
        e.preventDefault();
        await addBug({
            ...form,
            rawText: `${form.title} ${form.description} ${form.stackTrace}`.trim(),
            id: `BUG-${Date.now()}`,
            status: "Open",
        });
        setForm({ title: "", description: "", stackTrace: "", source: "Manual" });
        setShowCreateForm(false);
    }
    const filteredBugs = mockBugs.filter((bug) => {
        if (selectedSeverity !== "all" && bug.severity !== selectedSeverity)
            return false;
        if (selectedStatus !== "all" && bug.status !== selectedStatus)
            return false;
        if (selectedComponent !== "all" && bug.component !== selectedComponent)
            return false;
        if (searchQuery &&
            !bug.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !bug.id.toLowerCase().includes(searchQuery.toLowerCase()))
            return false;
        return true;
    });
    return (<div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh sách Lỗi (Bugs)</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi tất cả các báo cáo lỗi</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refreshBugs} className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4"/>
            {loading ? "Đang tải..." : "Đồng bộ Dữ liệu"}
          </button>
          <button onClick={() => setShowCreateForm((value) => !value)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4"/>
            Tạo Lỗi mới
          </button>
        </div>
      </div>



      {apiError && (<div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-sm">
        {apiError}
      </div>)}

      {usingMockData && (<div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 text-sm">
        Đang dùng mock data hoặc dữ liệu tạm. Khi backend chạy ở <code>http://localhost:8080/api/v1/bugs</code>, bấm Sync Backend để lấy dữ liệu thật.
      </div>)}

      {showCreateForm && (<form onSubmit={handleCreateBug} className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Tiêu đề</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-4 py-2 bg-input-background border border-border rounded-md" placeholder="Nhập tiêu đề ngắn gọn"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">Nguồn</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-4 py-2 bg-input-background border border-border rounded-md">
              <option value="Manual">Thủ công</option>
              <option value="GitHub">GitHub</option>
              <option value="Jira">Jira</option>
              <option value="Slack">Slack</option>
              <option value="Email">Email</option>
              <option value="Monitoring Tool">Công cụ Giám sát</option>
              <option value="User Feedback">Phản hồi Người dùng</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Mô tả / Nội dung gốc</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} className="w-full px-4 py-2 bg-input-background border border-border rounded-md" placeholder="Dán báo cáo lỗi, triệu chứng, phản hồi người dùng..."/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Log lỗi / Stack Trace <span className="text-muted-foreground font-normal">(Không bắt buộc)</span></label>
          <textarea value={form.stackTrace} onChange={(e) => setForm({ ...form, stackTrace: e.target.value })} rows={3} className="w-full px-4 py-2 bg-input-background border border-border rounded-md font-mono text-sm" placeholder="(Tùy chọn) Dán log lỗi 500, tràn bộ nhớ..."/>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-md p-3 text-sm">
          Mức độ nghiêm trọng, mức ưu tiên và thành phần không được chọn thủ công ở đây. Sau khi bạn bấm <strong>Tạo & Phân loại AI</strong>, hệ thống AI sẽ tự động phân tích và đưa ra gợi ý phân loại.
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent">Hủy</button>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Tạo & Phân loại AI</button>
        </div>
      </form>)}

      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input type="text" placeholder="Tìm kiếm lỗi theo ID hoặc tiêu đề..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>

          <div className="flex gap-3 flex-wrap">
            <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">Tất cả Mức độ</option>
              <option value="P1">P1 Thấp</option>
              <option value="P2">P2 Trung bình</option>
              <option value="P3">P3 Cao</option>
              <option value="P4">P4 Nghiêm trọng</option>
              <option value="P5">P5 Chặn hệ thống</option>
            </select>

            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">Tất cả Trạng thái</option>
              <option value="Open">Open</option>
              <option value="Triaged">Triaged</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Code Review">Code Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select value={selectedComponent} onChange={(e) => setSelectedComponent(e.target.value)} className="px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="all">Tất cả Thành phần</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="API">API</option>
              <option value="Authentication">Authentication</option>
              <option value="Notification">Notification</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          Đang hiển thị {filteredBugs.length} trên tổng số {mockBugs.length} lỗi
        </div>
      </div>

      <BugTable bugs={filteredBugs} showCheckbox={true} columns={["id", "title", "source", "severity", "priority", "component", "cluster", "similarity", "status", "assignee", "created"]}/>
    </div>);
}
