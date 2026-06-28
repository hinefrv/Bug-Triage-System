import { useState, useEffect } from "react";
import { Link } from "react-router";
import { fetchIncidents } from "../../api/incidentApi";
import { AlertTriangle, Search, Activity, CheckCircle2 } from "lucide-react";

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        try {
            setIsLoading(true);
            const data = await fetchIncidents();
            setIncidents(data);
        } catch (error) {
            console.error("Failed to load incidents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredIncidents = incidents.filter(incident => 
        incident.clusterSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.incidentID?.toString().includes(searchQuery)
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Quản lý Sự cố (Incidents)</h1>
                    <p className="text-muted-foreground mt-1">Danh sách các Sự cố hệ thống đã được nhóm từ nhiều Lỗi nhỏ.</p>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm">
                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/10">
                    <div className="relative w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Tìm theo ID hoặc Tóm tắt..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-input-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-md">
                        Tổng cộng: {filteredIncidents.length} Sự cố
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border text-sm text-muted-foreground">
                                <th className="p-4 font-medium w-24">ID</th>
                                <th className="p-4 font-medium">Tóm tắt Sự cố (Cluster Summary)</th>
                                <th className="p-4 font-medium w-32">Mức độ (Priority)</th>
                                <th className="p-4 font-medium w-32">Trạng thái</th>
                                <th className="p-4 font-medium w-24 text-center">Lỗi liên kết</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <Activity className="w-8 h-8 animate-pulse text-primary/50" />
                                            Đang tải dữ liệu Sự cố...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-muted-foreground">
                                        Không tìm thấy Sự cố nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredIncidents.map((incident) => (
                                    <tr key={incident.incidentID} className="hover:bg-muted/30 transition-colors group">
                                        <td className="p-4">
                                            <Link to={`/manager/incidents/${incident.incidentID}`} className="font-mono text-primary font-medium hover:underline">
                                                INC-{incident.incidentID}
                                            </Link>
                                        </td>
                                        <td className="p-4 font-medium text-foreground">
                                            {incident.clusterSummary || "Chưa phân loại"}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                                {incident.priorityLevel || "P1"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {incident.status === 'CLOSED' ? (
                                                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                                                    <CheckCircle2 className="w-4 h-4" /> Đã đóng
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                                                    <AlertTriangle className="w-4 h-4" /> Đang mở
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                                                {incident.bugReports?.length || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
