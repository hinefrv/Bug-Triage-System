import { useState } from "react";
import { Check, X, Edit } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { SeverityBadge } from "../../components/SeverityBadge";
import { UserAvatar } from "../../components/UserAvatar";
import { useBugs } from "../../contexts/BugContext";
export default function AITriagePage() {
    const { bugs: mockBugs, approveAISuggestion, rejectAISuggestion } = useBugs();
    const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(false);
    
    // Chỉ lấy những lỗi có AI Suggestion, đang ở trạng thái Open và chưa được duyệt
    const bugsWithAISuggestions = mockBugs.filter((b) => b.aiSuggestion && b.status === "Open" && !b.aiApproved && !b.classificationApplied);
    
    const waitingForReview = bugsWithAISuggestions.length;
    const highConfidence = bugsWithAISuggestions.filter((b) => b.aiSuggestion.confidence >= 85).length;
    const lowConfidence = bugsWithAISuggestions.filter((b) => b.aiSuggestion.confidence < 70).length;
    const autoClassified = mockBugs.filter((b) => b.status === "Triaged" && b.aiApproved).length;
    return (<div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hàng đợi AI Duyệt lỗi</h1>
        <p className="text-muted-foreground">Xem xét và phê duyệt các gợi ý phân loại từ AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Đang chờ duyệt</p>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">{waitingForReview}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{waitingForReview}</p>
          <p className="text-xs text-muted-foreground mt-1">Chờ người quản lý xem xét</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Độ tin cậy cao</p>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">{highConfidence}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{highConfidence}</p>
          <p className="text-xs text-muted-foreground mt-1">Độ tin cậy ≥ 85%</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Độ tin cậy thấp</p>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-yellow-600">{lowConfidence}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{lowConfidence}</p>
          <p className="text-xs text-muted-foreground mt-1">Độ tin cậy &lt; 70%</p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Đã phân loại tự động</p>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600">{autoClassified}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{autoClassified}</p>
          <p className="text-xs text-muted-foreground mt-1">Đã phê duyệt tự động</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Hàng đợi Phân loại bằng AI</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mã Lỗi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Xem trước
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mức độ AI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ưu tiên AI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thành phần AI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Độ tin cậy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Dev được đề xuất
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {bugsWithAISuggestions.map((bug) => (<tr key={bug.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/manager/bugs/${bug.id}`} className="text-primary hover:underline font-medium">{bug.id}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-sm font-medium text-foreground truncate">{bug.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{bug.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge severity={bug.aiSuggestion.severity}/>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground">{bug.aiSuggestion.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground">{bug.aiSuggestion.component}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${bug.aiSuggestion.confidence >= 85
                ? "bg-green-500"
                : bug.aiSuggestion.confidence >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"}`} style={{ width: `${bug.aiSuggestion.confidence}%` }}/>
                      </div>
                      <span className="text-sm font-medium text-foreground">{bug.aiSuggestion.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={bug.aiSuggestion.assignee} size="sm"/>
                      <span className="text-sm text-foreground">{bug.aiSuggestion.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button onClick={() => { approveAISuggestion(bug.id); toast.success(`${bug.id} approved`); }} className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors" title="Approve">
                        <Check className="w-4 h-4"/>
                      </button>
                      <Link to={`/manager/bugs/${bug.id}`} className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors" title="Edit/View detail">
                        <Edit className="w-4 h-4"/>
                      </Link>
                      <button onClick={() => { rejectAISuggestion(bug.id); toast.error(`${bug.id} suggestion rejected`); }} className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors" title="Reject">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-accent/50 rounded-lg border border-primary/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold">AI</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-2">Cách hoạt động của AI Triage</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Hệ thống AI của chúng tôi phân tích các báo cáo lỗi sử dụng xử lý ngôn ngữ tự nhiên để phân loại mức độ nghiêm trọng, mức độ ưu tiên, thành phần, và đề xuất lập trình viên phù hợp nhất để giao việc. Các đề xuất có độ tin cậy cao (≥85%) có thể được tự động phê duyệt nếu bạn cho phép.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setAutoApprovalEnabled((value) => !value); toast.success(autoApprovalEnabled ? "Đã tắt Tự động phê duyệt" : "Đã bật Tự động phê duyệt cho các đề xuất độ tin cậy cao"); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                {autoApprovalEnabled ? "Tắt Tự động phê duyệt" : "Bật Tự động phê duyệt"}
              </button>
              <Link to="/manager/settings" className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors text-sm">
                Cấu hình AI
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
