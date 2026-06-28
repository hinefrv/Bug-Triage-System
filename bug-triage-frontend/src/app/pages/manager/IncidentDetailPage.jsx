import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { fetchIncidentById, closeAllBugsInIncident, updateIncidentStatus } from "../../api/incidentApi";
import { ArrowLeft, AlertTriangle, CheckCircle2, Bug, ListChecks, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../../components/StatusBadge";
import { SeverityBadge } from "../../components/SeverityBadge";

export default function IncidentDetailPage() {
    const { incidentId } = useParams();
    const [incident, setIncident] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        loadIncident();
    }, [incidentId]);

    const loadIncident = async () => {
        try {
            setIsLoading(true);
            const data = await fetchIncidentById(incidentId);
            setIncident(data);
        } catch (error) {
            console.error("Failed to load incident details:", error);
            toast.error("Không thể tải thông tin sự cố");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseAllBugs = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn đóng TOÀN BỘ lỗi con thuộc sự cố này không?")) return;
        
        try {
            setIsClosing(true);
            await closeAllBugsInIncident(incidentId);
            toast.success("Đã đóng toàn bộ lỗi thành công!");
            // Reload to get updated statuses
            await loadIncident();
        } catch (error) {
            console.error("Failed to close bugs:", error);
            toast.error("Đã xảy ra lỗi khi đóng các lỗi con");
        } finally {
            setIsClosing(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const updated = await updateIncidentStatus(incidentId, newStatus);
            setIncident(updated);
            toast.success(`Đã chuyển trạng thái sự cố sang ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Không thể thay đổi trạng thái!");
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Đang tải Chi tiết Sự cố...</div>;
    }

    if (!incident) {
        return (
            <div className="p-6">
                <div className="bg-card rounded-lg border border-border p-8 text-center">
                    <p className="text-muted-foreground">Không tìm thấy Sự cố {incidentId}</p>
                    <Link to="/manager/incidents" className="text-primary hover:underline mt-4 inline-block">
                        Quay lại Danh sách
                    </Link>
                </div>
            </div>
        );
    }

    const openBugsCount = incident.bugReports?.filter(b => b.status !== 'Closed' && b.status !== 'Resolved').length || 0;
    const closedBugsCount = incident.bugReports?.length - openBugsCount;

    return (
        <div className="p-6 space-y-6">
            <div>
                <Link to="/manager/incidents" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại Danh sách Sự cố
                </Link>
                
                <div className="flex items-start justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h1 className="text-3xl font-bold text-foreground">INC-{incident.incidentID}</h1>
                            
                            <select 
                                value={incident.status || "OPEN"}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md border appearance-none outline-none cursor-pointer ${
                                    incident.status === 'CLOSED' 
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : incident.status === 'IN_PROGRESS'
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : incident.status === 'RESOLVED'
                                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                                        : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                            >
                                <option value="OPEN">Mở (Open)</option>
                                <option value="IN_PROGRESS">Đang xử lý (In Progress)</option>
                                <option value="RESOLVED">Đã giải quyết (Resolved)</option>
                                <option value="CLOSED">Đã đóng (Closed)</option>
                            </select>

                            <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-sm font-semibold rounded-md flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4" /> Priority: {incident.priorityLevel || "P1"}
                            </span>
                        </div>
                        <h2 className="text-xl text-muted-foreground mb-4">{incident.clusterSummary}</h2>
                        
                        <div className="flex gap-6 mt-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Tổng số lỗi</span>
                                <span className="text-2xl font-bold text-foreground">{incident.bugReports?.length || 0}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Lỗi Đang mở</span>
                                <span className="text-2xl font-bold text-amber-600">{openBugsCount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm text-muted-foreground">Lỗi Đã đóng</span>
                                <span className="text-2xl font-bold text-green-600">{closedBugsCount}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 ml-6 min-w-[200px]">
                        <button 
                            disabled={isClosing || openBugsCount === 0}
                            onClick={handleCloseAllBugs}
                            className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
                        >
                            <ListChecks className="w-5 h-5" />
                            Đóng toàn bộ {openBugsCount > 0 ? openBugsCount : ''} Lỗi con
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border bg-muted/10 flex items-center gap-2">
                    <Bug className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg text-foreground">Danh sách Lỗi (Bugs) Liên kết</h3>
                </div>
                
                {incident.bugReports?.length > 0 ? (
                    <div className="divide-y divide-border">
                        {incident.bugReports.map((bug) => (
                            <div key={bug.bugID} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <Link to={`/manager/bugs/${bug.bugID}`} className="font-mono font-bold text-primary hover:underline">
                                            {bug.bugID}
                                        </Link>
                                        <StatusBadge status={bug.status} />
                                        <SeverityBadge severity={bug.severityLabel || 'P3'} />
                                    </div>
                                    <p className="text-sm text-foreground truncate">{bug.title}</p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
                                    <p>Thành phần: <span className="font-medium text-foreground">{bug.componentLabel || 'N/A'}</span></p>
                                    <p>Người giao: <span className="font-medium text-foreground">{bug.assignee || 'Chưa giao'}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        Sự cố này hiện chưa liên kết với lỗi nào.
                    </div>
                )}
            </div>
        </div>
    );
}
