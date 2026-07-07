import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getDevelopers } from "../../api/developerApi";
import { UserAvatar } from "../../components/UserAvatar";
import { toast } from "sonner";

export default function DevelopersPage() {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevs = async () => {
            try {
                const data = await getDevelopers();
                setDevelopers(data);
            } catch (error) {
                toast.error("Không tải được danh sách Developer");
            } finally {
                setLoading(false);
            }
        };
        fetchDevs();
    }, []);

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Danh sách Lập trình viên</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {developers.map(dev => (
                    <Link key={dev.id} to={`/manager/developers/${dev.id}`} className="block">
                        <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition">
                            <div className="flex items-center gap-4 mb-4">
                                <UserAvatar name={dev.name} size="lg" />
                                <div>
                                    <h3 className="font-bold text-lg">{dev.name}</h3>
                                    <p className="text-sm text-muted-foreground">{dev.email}</p>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Kỹ năng: </span>
                                <span className="font-medium text-primary">
                                    {dev.skills?.length > 0 ? dev.skills.map(s => s.skillName).join(', ') : 'Chưa cập nhật'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-muted-foreground">Đang xử lý:</span>
                                <span className="font-bold text-orange-600">{dev.assignedBugs?.filter(b => b.status !== "Resolved" && b.status !== "Closed").length || 0} lỗi</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
