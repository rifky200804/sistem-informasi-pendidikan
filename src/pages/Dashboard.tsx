import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  FileText,
  Calendar,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { StatCard } from '@/components/base/StatCard';
import { DataTable, Column } from '@/components/base/DataTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import { LatestAnecdote } from '@/services/dashboardService';

const anecdoteColumns: Column<LatestAnecdote>[] = [
  { 
    key: 'content', 
    header: 'Judul',
    render: (item) => <span className="font-medium">{item.content || "-"}</span>,
  },
  { 
    key: 'description', 
    header: 'Deskripsi',
    render: (item) => item.description 
      ? <span className="text-sm text-muted-foreground line-clamp-2">{item.description}</span> 
      : <span className="text-muted-foreground">-</span>,
  },
  { 
    key: 'category', 
    header: 'Kategori',
    render: (item) => item.category 
      ? <Badge variant="outline">{item.category}</Badge> 
      : <span className="text-muted-foreground">-</span>,
  },
  {
    key: 'teacher',
    header: 'Guru',
    render: (item) => item.teacher?.name || <span className="text-muted-foreground">-</span>,
  },
  {
    key: 'date',
    header: 'Tanggal',
    render: (item) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{new Date(item.date).toLocaleDateString('id-ID')}</span>
      </div>
    ),
  },
];

export default function Dashboard() {
  const { stats, loading } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan Sistem Informasi Manajemen Pendidikan
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Murid"
          value={loading ? "..." : (stats?.studentsCount ?? 0)}
          icon={GraduationCap}
          variant="primary"
        />
        <StatCard
          title="Total Guru"
          value={loading ? "..." : (stats?.guruCount ?? 0)}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Total Anekdot"
          value={loading ? "..." : (stats?.anecdotesCountTotal ?? 0)}
          icon={BookOpen}
          variant="warning"
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Anekdot Terbaru</h2>
          <p className="text-sm text-muted-foreground">
            {stats?.latestAnecdotes?.length ?? 0} catatan terbaru
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Memuat data...</span>
          </div>
        ) : (
          <DataTable
            data={stats?.latestAnecdotes ?? []}
            columns={anecdoteColumns}
            defaultPageSize={5}
            hidePageSizeSelector={true}
          />
        )}
      </Card>
    </div>
  );
}