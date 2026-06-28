import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Check, UserPlus, AlertTriangle, X, Search } from "lucide-react";
import { toast } from "sonner";
import { SeverityBadge } from "../../components/SeverityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { UserAvatar } from "../../components/UserAvatar";
import { useBugs } from "../../contexts/BugContext";
import { getSimilarBugs, getClusterDefinition } from "../../utils/clusterUtils";
import { fetchIncidents } from "../../api/incidentApi";

export default function BugDetailPage() {
    const { bugId } = useParams();
    const { bugs: mockBugs, approveAISuggestion, assignBug, editClassification, markAsDuplicate, linkToIncident, createIncidentFromCluster, developers } = useBugs();
    const bug = mockBugs.find((b) => b.id === bugId);
    const similarBugs = bug ? getSimilarBugs(bug, mockBugs) : [];
    const clusterInfo = bug ? getClusterDefinition(bug.clusterId) : null;
    const isAIApproved = bug?.aiApproved === true;
    const isClassificationApplied = bug?.classificationApplied === true;

    const [editableForm, setEditableForm] = useState({
        severity: bug?.severity || "P3",
        priority: bug?.priority || "Medium",
        component: bug?.component || "Backend"
    });

    const [assignModal, setAssignModal] = useState({ isOpen: false, bugId: null });
    const [searchQuery, setSearchQuery] = useState("");
    
    // States cho 3 Modal mới
    const [duplicateModal, setDuplicateModal] = useState({ isOpen: false, targetId: similarBugs[0]?.id || "" });
    const [searchDuplicate, setSearchDuplicate] = useState("");
    const [incidentModal, setIncidentModal] = useState({ isOpen: false, incidentId: bug?.incidentId || "INC-001" });
    const [searchIncident, setSearchIncident] = useState("");
    const [createIncidentModal, setCreateIncidentModal] = useState(false);
    const [realIncidents, setRealIncidents] = useState([]);

    useEffect(() => {
        // Load danh sách Incidents thật khi mở modal
        if (incidentModal.isOpen && realIncidents.length === 0) {
            fetchIncidents().then(data => setRealIncidents(data)).catch(err => console.error("Failed to load incidents:", err));
        }
    }, [incidentModal.isOpen]);

    const handleAssign = (developerName) => {
        assignBug(assignModal.bugId, developerName);
        toast.success(`${assignModal.bugId} assigned to ${developerName}`);
        setAssignModal({ isOpen: false, bugId: null });
        setSearchQuery("");
    };

    const filteredDevs = (developers || []).filter(dev => 
        dev.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (dev.skills && dev.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    const filteredBugsForDuplicate = (mockBugs || []).filter(b => 
        b?.id !== bug?.id && 
        (b?.id?.toLowerCase().includes(searchDuplicate.toLowerCase()) || 
         b?.title?.toLowerCase().includes(searchDuplicate.toLowerCase()))
    );
    // Ưu tiên hiển thị similarBugs lên đầu nếu không search. Nếu không có similarBugs thì hiện tất cả.
    const duplicateListDisplay = searchDuplicate 
        ? filteredBugsForDuplicate 
        : (similarBugs.length > 0 ? similarBugs : filteredBugsForDuplicate);

    const filteredIncidents = realIncidents.filter(i => 
        i.incidentID?.toString().includes(searchIncident.toLowerCase()) || 
        i.clusterSummary?.toLowerCase().includes(searchIncident.toLowerCase())
    );

    useEffect(() => {
        if (bug) {
            setEditableForm({
                severity: bug.severity,
                priority: bug.priority,
                component: bug.component
            });
        }
    }, [bug?.severity, bug?.priority, bug?.component]);

    if (!bug) {
        return (<div className="p-6">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">Không tìm thấy lỗi</p>
          <Link to="/manager/bugs" className="text-primary hover:underline mt-4 inline-block">
            Quay lại Danh sách Lỗi
          </Link>
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      <div>
        <Link to="/manager/bugs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4"/>
          Quay lại Danh sách Lỗi
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{bug.id}</h1>
              <StatusBadge status={bug.status}/>
              {bug.duplicateOf && (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-md">
                  Duplicate of {bug.duplicateOf}
                </span>
              )}
              {bug.incidentId && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold rounded-md">
                  Thuộc Sự cố: {bug.incidentId}
                </span>
              )}
            </div>
            <h2 className="text-xl text-foreground">{bug.title}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Mô tả</h3>
            <p className="text-foreground whitespace-pre-wrap">{bug.description}</p>
          </div>

          {/* Placeholder cho Các bước Tái hiện (hiện tại backend chưa lưu field này, có thể mở rộng sau) */}
          {/* <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Các bước Tái hiện</h3>
            ...
          </div> */}

          {bug.stackTrace && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Log Lỗi (Error Log)</h3>
              <div className="bg-muted/30 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre className="text-destructive whitespace-pre-wrap">
                  {bug.stackTrace}
                </pre>
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Phân cụm Lỗi trùng lặp (K-Means)</h3>
                <p className="text-sm text-muted-foreground">Phần này hiển thị các lỗi tương tự được phát hiện nhờ thuật toán phân cụm.</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200 text-sm font-medium">
                {bug.clusterId || "CL-N/A"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tên cụm (Cluster)</p>
                <p className="font-medium text-foreground">{bug.clusterName || clusterInfo?.name || "Chưa phân loại"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Độ tương đồng</p>
                <p className="font-medium text-foreground">{bug.similarityScore ? `${bug.similarityScore}%` : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Các từ khóa chính</p>
                <div className="flex flex-wrap gap-1">
                  {(bug.clusterKeywords || clusterInfo?.keywords || []).slice(0, 4).map((keyword) => (
                    <span key={keyword} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">{keyword}</span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-foreground mb-3">Các Lỗi tương tự trong Cùng cụm</h4>
              {similarBugs.length > 0 ? (
                <div className="space-y-3">
                  {similarBugs.map((similarBug) => (
                    <div key={similarBug.id} className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                      <div className="min-w-0">
                        <Link to={`/manager/bugs/${similarBug.id}`} className="text-primary hover:underline font-medium">
                          {similarBug.id}
                        </Link>
                        <p className="text-sm text-foreground truncate">{similarBug.title}</p>
                        <p className="text-xs text-muted-foreground">Thành phần: {similarBug.component}</p>
                      </div>
                      <span className="text-sm font-medium text-foreground whitespace-nowrap">Giống {similarBug.similarityScore || 0}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có lỗi nào khác trong cụm này. Lỗi này có thể trở thành lỗi đại diện cho cụm.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={() => setDuplicateModal(prev => ({ ...prev, isOpen: true }))} 
                className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
                Đánh dấu là Trùng lặp
              </button>
              
              <button onClick={() => setIncidentModal(prev => ({ ...prev, isOpen: true }))} 
                className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
                Liên kết tới Sự cố hiện có
              </button>
              
              {!bug.incidentId && (
                <button onClick={() => setCreateIncidentModal(true)} 
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
                  Tạo Sự cố từ Cụm này
                </button>
              )}
            </div>
          </div>

          {bug.aiSuggestion && (<div className="bg-accent/50 rounded-lg border border-primary/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-bold">AI</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Gợi ý Phân loại từ AI</h3>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border bg-muted text-muted-foreground">
                    Độ tin cậy: {bug.aiSuggestion.confidence}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mức độ gợi ý</p>
                  <SeverityBadge severity={bug.aiSuggestion.severity}/>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ưu tiên gợi ý</p>
                  <p className="font-medium text-foreground">{bug.aiSuggestion.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Thành phần gợi ý</p>
                  <p className="font-medium text-foreground">{bug.aiSuggestion.component}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lập trình viên đề xuất</p>
                  <p className="font-medium text-foreground">{bug.aiSuggestion.assignee}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Lời giải thích</p>
                <p className="text-foreground">{bug.aiSuggestion.explanation}</p>
              </div>

              <div className="flex gap-3">
                {isAIApproved ? (
                  <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Đã duyệt Gợi ý AI
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      approveAISuggestion(bug.id)
                      toast.success("Đã duyệt gợi ý AI")
                    }}
                    disabled={isClassificationApplied || bug.status !== "Open"}
                    className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                      isClassificationApplied || bug.status !== "Open"
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Duyệt Gợi ý AI
                  </button>
                )}

                {isClassificationApplied && !isAIApproved ? (
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium">
                    Đã áp dụng Phân loại
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      editClassification(bug.id, {
                        severity: editableForm.severity,
                        priority: editableForm.priority,
                        component: editableForm.component,
                        status: "Triaged",
                        classificationApplied: true,
                      })
                      toast.info("Đã áp dụng phân loại và chuyển sang Trạng thái Đã phân loại")
                    }}
                    disabled={isAIApproved || bug.status !== "Open"}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      isAIApproved || bug.status !== "Open"
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-card border border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    Áp dụng Phân loại hiện tại
                  </button>
                )}
              </div>
            </div>)}

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Dòng thời gian Hoạt động</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground flex-shrink-0">
                  SM
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">Hệ thống Giám sát</p>
                    <span className="text-xs text-muted-foreground">đã tạo lỗi này</span>
                    <span className="text-xs text-muted-foreground ml-auto">{bug.createdDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Lỗi được báo cáo từ hệ thống giám sát</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground flex-shrink-0">
                  AI
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">Hệ thống AI</p>
                    <span className="text-xs text-muted-foreground">đã phân loại lỗi này</span>
                    <span className="text-xs text-muted-foreground ml-auto">{bug.updatedDate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Mức độ: P5, Thành phần: Backend</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Chi tiết Lỗi</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                <StatusBadge status={bug.status}/>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Mức độ</p>
                {bug.status === "Open" ? (
                  <select 
                    value={editableForm.severity} 
                    onChange={(e) => setEditableForm({...editableForm, severity: e.target.value})}
                    className="w-full px-3 py-1.5 bg-input-background border border-border rounded-md text-sm"
                  >
                    <option value="P1">P1 Thấp</option>
                    <option value="P2">P2 Trung bình</option>
                    <option value="P3">P3 Cao</option>
                    <option value="P4">P4 Nghiêm trọng</option>
                    <option value="P5">P5 Chặn hệ thống</option>
                  </select>
                ) : (
                  <SeverityBadge severity={bug.severity}/>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ưu tiên</p>
                {bug.status === "Open" ? (
                  <select 
                    value={editableForm.priority} 
                    onChange={(e) => setEditableForm({...editableForm, priority: e.target.value})}
                    className="w-full px-3 py-1.5 bg-input-background border border-border rounded-md text-sm"
                  >
                    <option value="Low">Thấp</option>
                    <option value="Medium">Trung bình</option>
                    <option value="High">Cao</option>
                    <option value="Urgent">Khẩn cấp</option>
                  </select>
                ) : (
                  <p className="font-medium text-foreground">{bug.priority}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Thành phần</p>
                {bug.status === "Open" ? (
                  <select 
                    value={editableForm.component} 
                    onChange={(e) => setEditableForm({...editableForm, component: e.target.value})}
                    className="w-full px-3 py-1.5 bg-input-background border border-border rounded-md text-sm"
                  >
                    <option value="Backend">Backend</option>
                    <option value="Frontend">Frontend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="API">API</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Notification">Notification</option>
                  </select>
                ) : (
                  <p className="font-medium text-foreground">{bug.component}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Cụm lỗi</p>
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    {bug.clusterId || "CL-N/A"}
                  </span>
                  <p className="font-medium text-foreground">{bug.clusterName || "Chưa phân loại"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Nguồn</p>
                <p className="font-medium text-foreground">{bug.source}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Người được giao</p>
                {bug.assignee ? (<div className="flex items-center gap-2">
                    <UserAvatar name={bug.assignee} size="sm"/>
                    <span className="font-medium text-foreground">{bug.assignee}</span>
                  </div>) : (<p className="text-muted-foreground">Chưa giao</p>)}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Người báo cáo</p>
                <p className="font-medium text-foreground">{bug.reporter}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                <p className="font-medium text-foreground">{bug.createdDate}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Cập nhật lần cuối</p>
                <p className="font-medium text-foreground">{bug.updatedDate}</p>
              </div>

              {bug.dueDate && (<div>
                  <p className="text-sm text-muted-foreground mb-1">Hạn chót</p>
                  <p className="font-medium text-foreground">{bug.dueDate}</p>
                </div>)}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Thao tác</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setAssignModal({ isOpen: true, bugId: bug.id })} 
                disabled={bug.status === "Closed" || bug.status === "Resolved"}
                className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${bug.status === "Closed" || bug.status === "Resolved" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                <UserPlus className="w-4 h-4"/>
                Giao Lập trình viên
              </button>
              <button onClick={() => { editClassification(bug.id, { severity: editableForm.severity, priority: editableForm.priority, component: editableForm.component, status: "Triaged" }); toast.info("Đã cập nhật phân loại"); }} 
                disabled={bug.status !== "Open"}
                className={`w-full px-4 py-2 rounded-md transition-colors ${bug.status !== "Open" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-card border border-border text-foreground hover:bg-accent"}`}>
                Áp dụng Phân loại
              </button>
              <button onClick={() => { editClassification(bug.id, { status: "Triaged", priority: "Urgent", isIncident: true }); toast.warning(`${bug.id} đã được đánh dấu là sự cố`); }} className="w-full px-4 py-2 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition-colors flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4"/>
                Đánh dấu là Sự cố
              </button>
              <button onClick={() => { editClassification(bug.id, { status: "Closed" }); toast.success(`${bug.id} đã đóng`); }} className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
                Đóng Lỗi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal Popup */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-foreground">Giao việc cho Lập trình viên</h3>
                <p className="text-xs text-muted-foreground mt-1">Bug ID: <span className="font-mono text-primary font-medium">{assignModal.bugId}</span></p>
              </div>
              <button onClick={() => setAssignModal({ isOpen: false, bugId: null })} className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên hoặc kỹ năng (VD: Java, React)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-3 space-y-1 bg-muted/10">
              {filteredDevs.length > 0 ? (
                filteredDevs.map(dev => (
                  <div 
                    key={dev.id || dev.email} 
                    onClick={() => handleAssign(dev.name)}
                    className="flex items-center gap-4 p-3 bg-card hover:bg-primary/5 border border-transparent hover:border-primary/20 rounded-lg cursor-pointer transition-all group"
                  >
                    <UserAvatar name={dev.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{dev.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{dev.email}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] font-medium bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {dev.skills?.slice(0,2).join(", ")}
                        {dev.skills?.length > 2 && "..."}
                      </span>
                      {dev.currentTasks !== undefined && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">Đang làm: {dev.currentTasks} task</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Không tìm thấy Lập trình viên</p>
                  <p className="text-xs text-muted-foreground mt-1">Thử tìm kiếm bằng từ khóa khác</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {duplicateModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-foreground">Đánh dấu Trùng lặp</h3>
                <p className="text-xs text-muted-foreground mt-1">Chọn lỗi gốc mà <span className="font-mono text-primary font-medium">{bug.id}</span> trùng lặp.</p>
              </div>
              <button onClick={() => setDuplicateModal(prev => ({ ...prev, isOpen: false }))} className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchDuplicate} 
                  onChange={e => setSearchDuplicate(e.target.value)}
                  placeholder="Tìm theo ID (VD: BUG-001) hoặc Tiêu đề..."
                  className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-3 space-y-1 bg-muted/10">
              {duplicateListDisplay.length > 0 ? (
                duplicateListDisplay.map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => setDuplicateModal(prev => ({ ...prev, targetId: b.id }))}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                      duplicateModal.targetId === b.id 
                        ? "bg-primary/10 border-primary" 
                        : "bg-card border-transparent hover:border-primary/30"
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm truncate ${duplicateModal.targetId === b.id ? "text-primary" : "text-foreground"}`}>
                          {b.id}
                        </p>
                        {b.clusterId === bug.clusterId && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-medium rounded-full whitespace-nowrap">
                            Cùng cụm
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{b.title}</p>
                    </div>
                    {duplicateModal.targetId === b.id && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Không tìm thấy lỗi phù hợp
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-card rounded-b-xl">
              <button onClick={() => setDuplicateModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Hủy</button>
              <button 
                disabled={!duplicateModal.targetId}
                onClick={async () => {
                  if (!duplicateModal.targetId) return;
                  await markAsDuplicate(bug.id, duplicateModal.targetId);
                  toast.success(`${bug.id} đã được đánh dấu trùng lặp với ${duplicateModal.targetId}`);
                  setDuplicateModal(prev => ({ ...prev, isOpen: false }));
                }} 
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Xác nhận Trùng lặp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Incident Modal */}
      {incidentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-border flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-foreground">Liên kết Sự cố</h3>
                <p className="text-xs text-muted-foreground mt-1">Chọn Sự cố lớn (Incident) để gộp lỗi này vào.</p>
              </div>
              <button onClick={() => setIncidentModal(prev => ({ ...prev, isOpen: false }))} className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchIncident} 
                  onChange={e => setSearchIncident(e.target.value)}
                  placeholder="Tìm theo ID Sự cố hoặc Tiêu đề..."
                  className="w-full pl-9 pr-4 py-2.5 bg-input-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-3 space-y-1 bg-muted/10">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map(i => (
                  <div 
                    key={i.incidentID} 
                    onClick={() => setIncidentModal(prev => ({ ...prev, incidentId: i.incidentID }))}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                      incidentModal.incidentId === i.incidentID 
                        ? "bg-blue-500/10 border-blue-500" 
                        : "bg-card border-transparent hover:border-blue-500/30"
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <p className={`font-semibold text-sm truncate ${incidentModal.incidentId === i.incidentID ? "text-blue-600" : "text-foreground"}`}>
                        INC-{i.incidentID}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{i.clusterSummary || "Chưa phân loại"}</p>
                    </div>
                    {incidentModal.incidentId === i.incidentID && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Không tìm thấy Sự cố phù hợp
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-card rounded-b-xl">
              <button onClick={() => setIncidentModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Hủy</button>
              <button 
                disabled={!incidentModal.incidentId}
                onClick={async () => {
                  if (!incidentModal.incidentId) return;
                  await linkToIncident(bug.id, incidentModal.incidentId);
                  toast.success(`${bug.id} đã được liên kết với sự cố ${incidentModal.incidentId}`);
                  setIncidentModal(prev => ({ ...prev, isOpen: false }));
                }} 
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Xác nhận Liên kết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {createIncidentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-sm rounded-xl shadow-2xl border border-border p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-lg text-foreground">Tạo Sự cố Tổng</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Bạn có chắc chắn muốn tạo một Sự cố (Incident) đại diện cho toàn bộ Cụm lỗi <strong className="text-foreground">{bug.clusterName || bug.clusterId}</strong> không?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCreateIncidentModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Hủy</button>
              <button 
                onClick={async () => {
                  const incidentId = await createIncidentFromCluster(bug.id, bug.clusterId, bug.clusterName);
                  if (incidentId) {
                    toast.success(`Đã tạo Sự cố ${incidentId} từ cụm này`);
                  } else {
                    toast.error("Lỗi khi tạo Sự cố");
                  }
                  setCreateIncidentModal(false);
                }} 
                className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors">
                Đồng ý tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>);
}
