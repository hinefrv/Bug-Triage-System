import { Link } from "react-router";
import { Layers, AlertTriangle, GitMerge, Zap, Search } from "lucide-react";
import { useBugs } from "../../contexts/BugContext";
import { buildBugClusters } from "../../utils/clusterUtils";
import { StatCard } from "../../components/StatCard";
import { SeverityBadge } from "../../components/SeverityBadge";

function KeywordList({ keywords }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((keyword) => (
        <span key={keyword} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
          {keyword}
        </span>
      ))}
    </div>
  );
}

function ClusterCard({ cluster }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-purple-100 text-purple-800 border border-purple-200 text-xs font-medium">
            {cluster.id}
          </span>
          <SeverityBadge severity={cluster.highestSeverity} />
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {cluster.bugCount} lỗi
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">{cluster.name}</h2>
        <p className="text-sm text-muted-foreground leading-6">{cluster.description}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Các từ khóa chính:</p>
        <KeywordList keywords={cluster.keywords.slice(0, 5)} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Thành phần chính</p>
          <p className="font-medium text-foreground">{cluster.mainComponent}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Độ tương đồng TB</p>
          <p className="font-medium text-foreground">{cluster.averageSimilarity ? `${cluster.averageSimilarity}%` : "N/A"}</p>
        </div>
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground">Lỗi đại diện: </span>
        {cluster.representativeBug ? (
          <Link to={`/manager/bugs/${cluster.representativeBug.id}`} className="text-primary hover:underline font-medium">
            {cluster.representativeBug.id}
          </Link>
        ) : (
          <span className="text-muted-foreground">Chưa có lỗi đại diện</span>
        )}
      </div>

      <div className="mt-auto">
        <Link
          to={cluster.representativeBug ? `/manager/bugs/${cluster.representativeBug.id}` : "/manager/bugs"}
          className="block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Xem chi tiết Cụm
        </Link>
      </div>
    </div>
  );
}

export default function BugClustersPage() {
  const { bugs } = useBugs();
  const clusters = buildBugClusters(bugs);
  const activeClusters = clusters.filter((cluster) => cluster.bugCount > 0);
  const largestCluster = clusters.reduce((largest, cluster) => cluster.bugCount > largest.bugCount ? cluster : largest, clusters[0]);
  const potentialDuplicates = clusters.reduce((total, cluster) => total + cluster.potentialDuplicates, 0);
  const newBugsMatched = bugs.filter((bug) => bug.clusterId && bug.clusterId !== "CL-15").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nhóm Lỗi (Clusters)</h1>
        <p className="text-muted-foreground">Kết quả phân cụm K-Means dùng để phát hiện lỗi trùng lặp</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4 text-sm leading-6">
        <strong>Thành phần (Component)</strong> mô tả phân hệ phần mềm như Backend, Frontend, Database, v.v. <strong>Cụm lỗi (Cluster)</strong> là nhóm các lỗi có nội dung tương đồng được gom lại bằng thuật toán K-Means để phát hiện lỗi trùng lặp.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Tổng số Cụm" value={clusters.length} subtitle={`${bugs.length} lỗi được phân cụm`} icon={Layers} iconBgColor="bg-purple-100" subtitleColor="text-purple-600" />
        <StatCard title="Khả năng Trùng lặp" value={potentialDuplicates} subtitle="Cần xem xét" icon={GitMerge} iconBgColor="bg-orange-100" subtitleColor="text-orange-600" />
        <StatCard title="Cụm lớn nhất" value={largestCluster?.bugCount || 0} subtitle={`${largestCluster?.id || "N/A"} · ${largestCluster?.name || "Không có cụm"}`} icon={AlertTriangle} iconBgColor="bg-blue-100" subtitleColor="text-blue-600" />
        <StatCard title="Lỗi mới được Xếp cụm" value={newBugsMatched} subtitle="Đã ghép bởi K-Means" icon={Zap} iconBgColor="bg-green-100" subtitleColor="text-green-600" />
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-3 text-sm text-muted-foreground">
        <Search className="w-4 h-4" />
        Đang hiển thị {activeClusters.length} cụm lỗi có dữ liệu. Các cụm rỗng đã được ẩn đi trên giao diện nhưng vẫn tính vào Tổng số Cụm.
      </div>

      {activeClusters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeClusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
          Chưa có dữ liệu phân cụm lỗi.
        </div>
      )}
    </div>
  );
}
