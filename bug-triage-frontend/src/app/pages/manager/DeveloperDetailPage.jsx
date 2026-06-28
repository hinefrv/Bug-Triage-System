import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getDeveloperById } from "../../api/developerApi";
import { UserAvatar } from "../../components/UserAvatar";
import { SeverityBadge } from "../../components/SeverityBadge";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function DeveloperDetailPage() {
    const { devId } = useParams();
    const [dev, setDev] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDev = async () => {
            try {
                const data = await getDeveloperById(devId);
                setDev(data);
            } catch (error) {
                toast.error("Không tải được thông tin Developer");
            } finally {
                setLoading(false);
            }
        };
        fetchDev();
    }, [devId]);

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
    if (!dev) return <div className="p-6">Không tìm thấy lập trình viên.</div>;

    const activeBugs = dev.assignedBugs?.filter(b => b.status !== "Resolved" && b.status !== "Closed") || [];
    const completedBugs = dev.assignedBugs?.filter(b => b.status === "Resolved" || b.status === "Closed") || [];

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Link to="/manager/developers" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
            </Link>

            {/* Profile Header */}
            <div className="bg-card border border-border rounded-lg p-6 flex items-start gap-6">
                <UserAvatar name={dev.name} size="xl" />
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-1">{dev.name}</h1>
                    <p className="text-muted-foreground mb-4">{dev.email}</p>
                    <div className="flex gap-4">
                        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                            <span className="block text-xs uppercase font-bold">Đang xử lý</span>
                            <span className="text-xl font-bold">{activeBugs.length}</span>
                        </div>
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg">
                            <span className="block text-xs uppercase font-bold">Đã hoàn thành</span>
                            <span className="text-xl font-bold">{completedBugs.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cột trái: Skills */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-xl font-bold border-b pb-2">Kỹ năng (Skills)</h2>
                    <ul className="space-y-3">
                        {dev.skills?.length > 0 ? dev.skills.map((skill, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                                <span className="font-medium">{skill.skillName}</span>
                                <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">
                                    Lv {skill.proficiencyLevel}
                                </span>
                            </li>
                        )) : <p className="text-muted-foreground text-sm">Chưa cập nhật kỹ năng.</p>}
                    </ul>
                </div>

                {/* Cột phải: Assigned Bugs */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold border-b pb-2">Các công việc đang phụ trách</h2>
                    {activeBugs.length > 0 ? (
                        <div className="space-y-3">
                            {activeBugs.map(bug => (
                                <Link key={bug.bugId} to={`/manager/bugs/${bug.bugId}`} className="block">
                                    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition flex justify-between items-center">
                                        <div>
                                            <div className="flex gap-2 items-center mb-1">
                                                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{bug.bugId}</span>
                                                <SeverityBadge severity={bug.severity} />
                                            </div>
                                            <h4 className="font-medium text-sm line-clamp-1">{bug.title}</h4>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded whitespace-nowrap">{bug.status}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">Hiện không có công việc nào đang làm.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
