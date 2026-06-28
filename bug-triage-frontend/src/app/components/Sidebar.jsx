import { NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Bug, Brain, BarChart3, Settings, Columns3, Layers, LogOut, Users, AlertTriangle } from "lucide-react";
import { getCurrentUser, logout } from "../utils/auth";
import { UserAvatar } from "./UserAvatar";

export function Sidebar({ role }) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); // Lấy thông tin user hiện tại

  const managerLinks = [
    { to: "/manager", icon: LayoutDashboard, label: "Bảng điều khiển" },
    { to: "/manager/bugs", icon: Bug, label: "Danh sách Lỗi (Bugs)" },
    { to: "/manager/clusters", icon: Layers, label: "Nhóm lỗi (Clusters)" },
    { to: "/manager/incidents", icon: AlertTriangle, label: "Quản lý Sự cố" },
    { to: "/manager/ai-triage", icon: Brain, label: "AI Duyệt lỗi" },
    { to: "/manager/assignment-board", icon: Columns3, label: "Bảng giao việc" },
    { to: "/manager/reports", icon: BarChart3, label: "Báo cáo thống kê" },
    { to: "/manager/settings", icon: Settings, label: "Cài đặt" },
    { to: "/manager/developers", icon: Users, label: "Lập trình viên" },
  ];

  const developerLinks = [
    { to: "/developer", icon: LayoutDashboard, label: "Bảng điều khiển" },
    { to: "/developer/my-tasks", icon: Columns3, label: "Nhiệm vụ của tôi" },
  ];

  const isManager = role === "ROLE_MANAGER" || role === "MANAGER" || role === "manager";
  const links = isManager ? managerLinks : developerLinks;

  const handleLogout = () => {
    logout(); // Xóa Token và User khỏi localStorage
    navigate("/"); // Đá về trang đăng nhập
  };

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Bug className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Bug Triage System</h1>
            <p className="text-xs text-sidebar-foreground/70">
              {isManager ? "Cổng Quản lý" : "Cổng Lập trình viên"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to.split("/").length === 2}
            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
            <link.icon className="w-5 h-5" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <UserAvatar name={currentUser?.username || currentUser?.email || "User"} size="md" />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">
              {currentUser?.username || (isManager ? "Quản lý" : "Lập trình viên")}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {currentUser?.email || "user@bugtriage.com"}
            </p>
          </div>
        </div>

        {/* Nút Đăng Xuất */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}
