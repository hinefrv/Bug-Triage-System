import { useState } from "react";
import { Link } from "react-router";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SeverityBadge } from "../../components/SeverityBadge";
import { PriorityBadge } from "../../components/PriorityBadge";
import { UserAvatar } from "../../components/UserAvatar";
import { useBugs } from "../../contexts/BugContext";
import { Calendar, X, Search } from "lucide-react";
import { toast } from "sonner";
const ItemType = "BUG_CARD";
function BugCard({ bug }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemType,
        item: { id: bug.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));
    return (<div ref={drag} className={`bg-card p-4 rounded-lg border border-border cursor-move hover:shadow-md transition-shadow ${isDragging ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-primary">{bug.id}</span>
        <SeverityBadge severity={bug.severity}/>
      </div>

      <Link to={`/manager/bugs/${bug.id}`} className="block text-sm font-medium text-foreground mb-3 line-clamp-2 hover:text-primary">
        {bug.title}
      </Link>

      <div className="flex items-center gap-2 mb-3">
        <PriorityBadge priority={bug.priority}/>
        <span className="text-xs px-2 py-1 bg-muted rounded text-muted-foreground">{bug.component}</span>
      </div>

      <div className="flex items-center justify-between mb-1">
        {bug.assignee ? (<div className="flex items-center gap-2">
            <UserAvatar name={bug.assignee} size="sm"/>
            <span className="text-xs text-muted-foreground">{bug.assignee.split(" ")[0]}</span>
          </div>) : (<span className="text-xs text-muted-foreground">Chưa giao</span>)}

        {bug.dueDate && (<div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3"/>
            <span>{new Date(bug.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>)}
      </div>
    </div>);
}
function Column({ title, status, bugs, onDrop }) {
    const isReadOnly = !["Assigned", "Closed"].includes(status);
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemType,
        drop: (item) => onDrop(item.id, status),
        canDrop: () => !isReadOnly,
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));
    return (<div className="flex-shrink-0 w-80">
      <div className="bg-muted/30 rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {!isReadOnly && <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Kéo thả</span>}
            {isReadOnly && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">Chỉ xem</span>}
          </div>
          <span className="text-sm px-2 py-1 bg-card rounded-full text-muted-foreground">{bugs.length}</span>
        </div>

        <div ref={isReadOnly ? null : drop} className={`space-y-3 min-h-[500px] ${isOver && canDrop ? "bg-primary/5 rounded-lg" : ""} ${isReadOnly ? "opacity-90" : ""}`}>
          {bugs.map((bug) => (<BugCard key={bug.id} bug={bug} />))}
        </div>
      </div>
    </div>);
}
export default function AssignmentBoardPage() {
    const { bugs, updateBugStatus, assignBug, developers } = useBugs();
    const [assignModal, setAssignModal] = useState({ isOpen: false, bugId: null });
    const [searchQuery, setSearchQuery] = useState("");

    const handleDrop = (bugId, newStatus) => {
        if (newStatus === "Assigned") {
            setAssignModal({ isOpen: true, bugId });
        } else {
            updateBugStatus(bugId, newStatus);
            toast.success(`${bugId} moved to ${newStatus}`);
        }
    };

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

    const columns = [
        { title: "Open", status: "Open" },
        { title: "Triaged", status: "Triaged" },
        { title: "Assigned", status: "Assigned" },
        { title: "In Progress", status: "In Progress" },
        { title: "Code Review", status: "Code Review" },
        { title: "Resolved", status: "Resolved" },
        { title: "Closed", status: "Closed" },
    ];
    return (<DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bảng giao việc</h1>
          <p className="text-muted-foreground">Kéo thả các lỗi để cập nhật trạng thái (Quản lý có thể giao việc và đóng lỗi)</p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => (<Column key={column.status} title={column.title} status={column.status} bugs={bugs.filter((bug) => bug.status === column.status)} onDrop={handleDrop} />))}
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
    </DndProvider>);
}
