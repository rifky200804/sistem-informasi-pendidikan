import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar
} from 'lucide-react';
import { StatCard } from '@/components/base/StatCard';
import { DataTable, Column } from '@/components/base/DataTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  date: string;
  status: string;
}

const mockActivities: RecentActivity[] = [
  { id: 'ACT-001', type: 'Anekdot', description: 'Catatan anekdot untuk Aisyah Putri', user: 'Siti Aminah', date: '2024-01-20', status: 'completed' },
  { id: 'ACT-002', type: 'Rapor', description: 'Rapor Semester 1 Muhammad Rizki', user: 'Budi Santoso', date: '2024-01-20', status: 'draft' },
  { id: 'ACT-003', type: 'Dokumen', description: 'Upload Kurikulum PAUD 2024', user: 'Dewi Lestari', date: '2024-01-19', status: 'completed' },
  { id: 'ACT-004', type: 'Murid', description: 'Data murid baru: Raffi Ahmad', user: 'Ahmad Fauzi', date: '2024-01-19', status: 'completed' },
  { id: 'ACT-005', type: 'APE', description: 'Pembaruan kondisi APE Kelas A', user: 'Rina Kartika', date: '2024-01-18', status: 'completed' },
];

const columns: Column<RecentActivity>[] = [
  { 
    key: 'type', 
    header: 'Tipe',
    render: (item) => (
      <Badge variant="outline">{item.type}</Badge>
    ),
  },
  { key: 'description', header: 'Aktivitas' },
  { key: 'user', header: 'Pengguna' },
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
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
        {item.status === 'completed' ? 'Selesai' : 'Draft'}
      </Badge>
    ),
  },
];

export default function Dashboard() {
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
          value="156"
          icon={GraduationCap}
          variant="primary"
        />
        <StatCard
          title="Total Guru"
          value="24"
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Anekdot Bulan Ini"
          value="142"
          icon={BookOpen}
          variant="warning"
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Aktivitas Terbaru</h2>
        </div>
        <DataTable data={mockActivities} columns={columns} />
      </Card>
    </div>
  );
}