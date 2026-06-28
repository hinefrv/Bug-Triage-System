import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SeverityBadge } from "../../components/SeverityBadge";
import { PriorityBadge } from "../../components/PriorityBadge";
import { UserAvatar } from "../../components/UserAvatar";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

// THÊM: Import Axios và Auth
import axiosInstance from "../../api/axiosConfig";
import { getCurrentUser } from "../../utils/auth";

const ItemType = "DEVELOPER_BUG_CARD";

function DeveloperBugCard({ bug, onAction }) {
    // Lưu ý: ID từ API trả về là "bugID" thay vì "id"
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { id: bug.bugID, status: bug.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    // Logic nút bấm chuyển trạng thái
    let actionBtn = null;
    if (bug.status === "NEW" || bug.status === "Assigned") {
        actionBtn = (
            <button type="button" onClick={(e) => { e.stopPropagation(); onAction(bug.bugID, "In Progress"); }} className="w-full mt-2 text-xs px-2 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition">
                ▶ Bắt đầu xử lý
            </button>
        );
    } else if (bug.status === "In Progress") {
        actionBtn = (
            <button type="button" onClick={(e) => { e.stopPropagation(); onAction(bug.bugID, "Code Review"); }} className="w-full mt-2 text-xs px-2 py-1.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium transition">
                📋 Yêu cầu Review
            </button>
        );
    } else if (bug.status === "Code Review") {
        actionBtn = (
            <button type="button" onClick={(e) => { e.stopPropagation(); onAction(bug.bugID, "Resolved"); }} className="w-full mt-2 text-xs px-2 py-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium transition">
                ✅ Đánh dấu hoàn thành
            </button>
        );
    }

    return (
        <div ref={drag} className={`bg-card p-4 rounded-lg border border-border cursor-move hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-primary">{bug.bugID}</span>
                <SeverityBadge severity={bug.severityLabel || bug.severity} />
            </div>

            <Link to={`/developer/bugs/${bug.bugID}`} className="block text-sm font-medium text-foreground mb-3 line-clamp-2 hover:text-primary">
                {bug.title}
            </Link>

            <div className="flex items-center gap-2 mb-3">
                <PriorityBadge priority={bug.severityLabel || bug.priority} />
                <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">{bug.category?.name || "Frontend"}</span>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserAvatar name={bug.assignee || "Unknown"} size="sm" />
                    <span className="text-xs text-muted-foreground">{bug.assignee ? bug.assignee.split("@")[0] : ""}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Hôm nay</span>
                </div>
            </div>

            {actionBtn}
        </div>
    );
}

function DeveloperColumn({ title, status, bugs, onDrop, onAction }) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemType,
        canDrop: (item) => {
            // Chỉ cho kéo đi tới (Forward), ngăn không cho kéo lùi
            const flow = ["NEW", "Assigned", "In Progress", "Code Review", "Resolved"];
            let fromIndex = flow.indexOf(item.status);
            if (fromIndex === -1) fromIndex = 0; // Nếu là NEW thì từ 0

            // Xử lý chung NEW và Assigned thành 1 cột
            const adjustedStatus = status === "Assigned" ? ["NEW", "Assigned"] : [status];

            return fromIndex !== -1 && !adjustedStatus.includes(item.status);
        },
        drop: (item) => onDrop(item.id, status),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    return (
        <div className="flex-shrink-0 w-80">
            <div className="bg-muted/30 rounded-lg p-4 h-full relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <span className="text-sm px-2 py-1 bg-card rounded-full text-muted-foreground">{bugs.length}</span>
                </div>

                <div ref={drop} className={`space-y-3 min-h-[500px] ${isOver && canDrop ? "bg-primary/5 rounded-lg border border-dashed border-primary" : ""}`}>
                    {bugs.map((bug) => (
                        <DeveloperBugCard key={bug.bugID} bug={bug} onAction={onAction} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function MyTasksBoardPage() {
    const [myBugs, setMyBugs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = getCurrentUser();

    // 1. Fetch dữ liệu khi vừa vào trang
    useEffect(() => {
        fetchMyBugs();
    }, []);

    const fetchMyBugs = async () => {
        try {
            setIsLoading(true);
            // Gọi GET /api/v1/bugs/my-tasks
            const response = await axiosInstance.get("/v1/bugs/my-tasks");
            setMyBugs(response.data);
        } catch (error) {
            console.error("Lỗi khi tải tasks:", error);
            toast.error("Không thể tải danh sách công việc từ Server");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Hàm gọi API cập nhật trạng thái khi Kéo/Thả hoặc Bấm nút
    const handleUpdateStatus = async (bugId, newStatus) => {
        try {
            // Hiệu ứng "Optimistic Update": Cập nhật giao diện mượt mà lập tức
            setMyBugs((prev) =>
                prev.map((b) => (b.bugID === bugId ? { ...b, status: newStatus } : b))
            );

            // Gọi PATCH /api/v1/bugs/{bugId}/status
            await axiosInstance.patch(`/v1/bugs/${bugId}/status`, { status: newStatus });
            toast.success(`Bug đã được chuyển sang ${newStatus}`);
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            toast.error("Cập nhật thất bại. Hệ thống đang đồng bộ lại dữ liệu!");
            fetchMyBugs(); // Nếu Backend lỗi thì tải lại data cũ
        }
    };

    const columns = [
        { title: "Cần làm (Đã giao)", status: "Assigned" },
        { title: "Đang xử lý", status: "In Progress" },
        { title: "Review Code", status: "Code Review" },
        { title: "Đã giải quyết", status: "Resolved" },
    ];

    if (isLoading) {
        return <div className="p-6 text-center text-muted-foreground">Đang tải dữ liệu nhiệm vụ của bạn...</div>;
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Bảng nhiệm vụ của tôi</h1>
                    <p className="text-muted-foreground">
                        Xin chào <b>{currentUser?.email?.split('@')[0]}</b>, đây là những task thuộc trách nhiệm của bạn. Kéo thả để cập nhật tiến độ.
                    </p>
                </div>

                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {columns.map((column) => {
                            // Filter gộp chung "NEW" và "Assigned" vào cột To Do
                            const filteredBugs = myBugs.filter((bug) => {
                                if (column.status === "Assigned") {
                                    return bug.status === "NEW" || bug.status === "Assigned";
                                }
                                return bug.status === column.status;
                            });

                            return (
                                <DeveloperColumn
                                    key={column.status}
                                    title={column.title}
                                    status={column.status}
                                    bugs={filteredBugs}
                                    onDrop={handleUpdateStatus}
                                    onAction={handleUpdateStatus}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}
