import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Clock } from "lucide-react";
import { toast } from "sonner";
import { SeverityBadge } from "../../components/SeverityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { UserAvatar } from "../../components/UserAvatar";
import { useBugs } from "../../contexts/BugContext";
export default function DeveloperBugDetailPage() {
    const { bugId } = useParams();
    const { bugs: mockBugs, updateBugStatus, requestReview, saveDeveloperNotes, addComment } = useBugs();
    const bug = mockBugs.find((b) => b.id === bugId);
    const [status, setStatus] = useState(bug?.status || "In Progress");
    const [comment, setComment] = useState("");
    const [rootCause, setRootCause] = useState(bug?.rootCause || "");
    const [solution, setSolution] = useState(bug?.solution || "");
    if (!bug) {
        return (<div className="p-6">
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">Không tìm thấy lỗi</p>
          <Link to="/developer" className="text-primary hover:underline mt-4 inline-block">
            Quay lại Bảng điều khiển
          </Link>
        </div>
      </div>);
    }
    const handleUpdateStatus = () => {
        updateBugStatus(bug.id, status);
        toast.success(`Đã cập nhật trạng thái thành ${status}`);
    };
    const handleAddComment = () => {
        if (comment.trim()) {
            addComment(bug.id, comment);
            setComment("");
            toast.success("Đã thêm bình luận");
        }
        else {
            toast.error("Vui lòng nhập bình luận trước");
        }
    };
    const handleSaveNotes = () => {
        saveDeveloperNotes(bug.id, { rootCause, solution });
        toast.success("Đã lưu nguyên nhân và giải pháp");
    };
    const handleMarkResolved = () => {
        updateBugStatus(bug.id, "Resolved");
        setStatus("Resolved");
        toast.success(`${bug.id} đã được đánh dấu hoàn thành`);
    };
    const handleRequestReview = () => {
        saveDeveloperNotes(bug.id, { rootCause, solution });
        requestReview(bug.id);
        setStatus("Code Review");
        toast.success("Đã gửi yêu cầu Review");
    };
    return (<div className="p-6 space-y-6">
      <div>
        <Link to="/developer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4"/>
          Quay lại Bảng điều khiển
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground">{bug.id}</h1>
              <StatusBadge status={bug.status}/>
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

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Log Lỗi</h3>
            <div className="bg-muted/30 p-4 rounded-md font-mono text-sm overflow-x-auto">
              <pre className="text-destructive">
                {`Error: Internal Server Error
  at PaymentController.process (payment.controller.ts:45)
  at async POST /api/payment/submit
  Status: 500
  Message: "Database connection timeout"`}
              </pre>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Cập nhật Trạng thái</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Trạng thái</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="Assigned">Đã giao</option>
                  <option value="In Progress">Đang xử lý</option>
                  <option value="Code Review">Review Code</option>
                  <option value="Resolved">Đã giải quyết</option>
                </select>
              </div>
              <button onClick={handleUpdateStatus} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Cập nhật
              </button>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Phân tích Nguyên nhân</h3>
            <textarea value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Mô tả nguyên nhân gốc rễ của lỗi này..." className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"/>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Ghi chú Giải pháp</h3>
            <textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="Mô tả cách bạn đã sửa lỗi này..." className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"/>
            <button onClick={handleSaveNotes} className="mt-3 px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
              Lưu Ghi chú
            </button>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Bình luận</h3>
            <div className="space-y-4 mb-4">
              <div className="flex gap-4">
                <UserAvatar name="Minh Tran" size="md" className="flex-shrink-0"/>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">Minh Tran</p>
                    <span className="text-xs text-muted-foreground">2 giờ trước</span>
                  </div>
                  <p className="text-sm text-foreground">Đã bắt đầu điều tra vấn đề timeout kết nối cơ sở dữ liệu.</p>
                </div>
              </div>
              {(bug.comments || []).map((item, index) => (
                <div key={index} className="flex gap-4">
                  <UserAvatar name={item.author} size="md" className="flex-shrink-0"/>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{item.author}</p>
                      <span className="text-xs text-muted-foreground">{item.createdAt}</span>
                    </div>
                    <p className="text-sm text-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Thêm bình luận..." className="w-full px-4 py-3 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"/>
              <button onClick={handleAddComment} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Thêm Bình luận
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Chi tiết Lỗi</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mức độ nghiêm trọng</p>
                <SeverityBadge severity={bug.severity}/>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Độ ưu tiên</p>
                <p className="font-medium text-foreground">{bug.priority}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Thành phần</p>
                <p className="font-medium text-foreground">{bug.component}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Nguồn</p>
                <p className="font-medium text-foreground">{bug.source}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Người báo cáo</p>
                <p className="font-medium text-foreground">{bug.reporter}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                <p className="font-medium text-foreground">{bug.createdDate}</p>
              </div>

              {bug.dueDate && (<div>
                  <p className="text-sm text-muted-foreground mb-1">Hạn chót</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600"/>
                    <p className="font-medium text-orange-600">{bug.dueDate}</p>
                  </div>
                </div>)}
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Hành động</h3>
            <div className="space-y-3">
              <button onClick={handleMarkResolved} className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors">
                Đánh dấu Hoàn thành
              </button>
              <button onClick={handleRequestReview} className="w-full px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
                Yêu cầu Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
