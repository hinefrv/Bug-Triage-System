import { useState } from "react";
import { toast } from "sonner";

const defaultSettings = {
  organizationName: "Bug Triage System Team",
  timeZone: "UTC +7 (Bangkok, Hanoi)",
  autoApprove: false,
  emailNotifications: true,
  newBugReports: true,
  criticalIncidents: true,
  statusUpdates: false,
  weeklySummary: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleCancel = () => {
    setSettings(defaultSettings);
    toast.info("Đã khôi phục Cài đặt về mặc định");
  };

  const handleSave = () => {
    localStorage.setItem("bugflowSettings", JSON.stringify(settings));
    toast.success("Đã lưu Cài đặt thành công");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground">Cấu hình các tùy chọn Bug Triage System của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Cài đặt Chung</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Tên Tổ chức</label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => updateSetting("organizationName", e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Múi giờ</label>
              <select
                value={settings.timeZone}
                onChange={(e) => updateSetting("timeZone", e.target.value)}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>UTC +7 (Bangkok, Hanoi)</option>
                <option>UTC +8 (Singapore, Beijing)</option>
                <option>UTC +9 (Tokyo, Seoul)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Cài đặt AI Triage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Tự động duyệt độ tin cậy cao</p>
                <p className="text-sm text-muted-foreground">Tự động duyệt các gợi ý của AI có độ tin cậy ≥95%</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => updateSetting("autoApprove", e.target.checked)}
                className="w-5 h-5 rounded border-border"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Thông báo Email</p>
                <p className="text-sm text-muted-foreground">Nhận cảnh báo email cho các lỗi nghiêm trọng</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => updateSetting("emailNotifications", e.target.checked)}
                className="w-5 h-5 rounded border-border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Tùy chọn Thông báo</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={settings.newBugReports} onChange={(e) => updateSetting("newBugReports", e.target.checked)} className="w-4 h-4 rounded border-border"/>
            <span className="text-foreground">Báo cáo lỗi mới</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={settings.criticalIncidents} onChange={(e) => updateSetting("criticalIncidents", e.target.checked)} className="w-4 h-4 rounded border-border"/>
            <span className="text-foreground">Các sự cố nghiêm trọng</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={settings.statusUpdates} onChange={(e) => updateSetting("statusUpdates", e.target.checked)} className="w-4 h-4 rounded border-border"/>
            <span className="text-foreground">Cập nhật trạng thái lỗi</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={settings.weeklySummary} onChange={(e) => updateSetting("weeklySummary", e.target.checked)} className="w-4 h-4 rounded border-border"/>
            <span className="text-foreground">Báo cáo tóm tắt hàng tuần</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={handleCancel} className="px-4 py-2 bg-card border border-border text-foreground rounded-md hover:bg-accent transition-colors">
          Hủy
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          Lưu Thay đổi
        </button>
      </div>
    </div>
  );
}
