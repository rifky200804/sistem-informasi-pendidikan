import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, RefreshCw, User, FileText, GraduationCap, LogIn, FilePlus, Pencil, Plus, ClipboardList, HelpCircle, BookOpen, Blocks } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { ActivityLog } from "@/services/activityLogService";

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: typeof Activity }> = {
  LOGIN: { label: "Login", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: LogIn },
  CREATE_STUDENT: { label: "Tambah Murid", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: Plus },
  UPDATE_STUDENT: { label: "Update Murid", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Pencil },
  CREATE_DOCUMENT: { label: "Buat Dokumen", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: FilePlus },
  CREATE_ANECDOTE: { label: "Buat Anekdot", color: "bg-pink-500/10 text-pink-600 border-pink-500/20", icon: BookOpen },
  CREATE_QUESTION: { label: "Buat Soal", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", icon: HelpCircle },
  CREATE_APE: { label: "Buat APE", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: Blocks },
  CREATE_REPORT: { label: "Buat Laporan", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: ClipboardList },
  CREATE_TEMPLATE: { label: "Buat Template", color: "bg-teal-500/10 text-teal-600 border-teal-500/20", icon: FileText },
  SUBMIT_STUDENT_REPORT: { label: "Submit Rapor", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: ClipboardList },
};

const ENTITY_CONFIG: Record<string, { label: string; icon: typeof Activity }> = {
  User: { label: "User", icon: User },
  Student: { label: "Murid", icon: GraduationCap },
  Document: { label: "Dokumen", icon: FileText },
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const ActivityLogs = () => {
  const { logs, loading, fetchLogs } = useActivityLogs();

  const columns: Column<ActivityLog>[] = [
    {
      key: "id",
      header: "ID",
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">#{item.id}</span>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      filterType: "select",
      render: (item) => {
        const config = ACTION_CONFIG[item.action] || {
          label: item.action,
          color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
          icon: Activity,
        };
        const Icon = config.icon;
        return (
          <Badge variant="outline" className={`${config.color} gap-1.5 font-medium`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "entity",
      header: "Entitas",
      filterType: "select",
      render: (item) => {
        const config = ENTITY_CONFIG[item.entity] || {
          label: item.entity,
          icon: Activity,
        };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <span className="font-medium text-sm">{config.label}</span>
              <span className="text-xs text-muted-foreground ml-1.5">#{item.entityId}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: "userId",
      header: "Pengguna",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-3 h-3 text-primary" />
          </div>
          <span className="text-sm font-medium">
            {item.userName || item.user?.name || `User #${item.userId}`}
          </span>
        </div>
      ),
    },
    {
      key: "metadata",
      header: "Metadata",
      filterable: false,
      render: (item) => {
        if (!item.metadata) {
          return <span className="text-muted-foreground text-xs italic">—</span>;
        }
        return (
          <div className="max-w-[200px]">
            {Object.entries(item.metadata).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-muted-foreground">{key}:</span>{" "}
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Waktu",
      render: (item) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Log Aktivitas</h1>
          <p className="text-muted-foreground mt-1">
            Pantau semua aktivitas pengguna dalam sistem
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-6">

        <DataTable
          data={logs}
          columns={columns}
          searchPlaceholder="Cari aktivitas..."
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ActivityLogs;
