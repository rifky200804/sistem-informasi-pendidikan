import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/base/StatCard';

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analitik</h1>
        <p className="text-muted-foreground mt-1">
          Insight dan tren performa Pendidikan
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Rata-rata Skor Audit"
          value="89.5%"
          icon={BarChart3}
          variant="primary"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Tingkat Compliance"
          value="94.2%"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Audit per Bulan"
          value="32"
          icon={Activity}
          variant="default"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Kategori Terbanyak"
          value="Produksi"
          icon={PieChart}
          variant="default"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Tren Skor Audit</h2>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart akan ditampilkan di sini</p>
              <p className="text-sm mt-1">Integrasi dengan library chart</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Distribusi Status</h2>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center text-muted-foreground">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Pie chart akan ditampilkan di sini</p>
              <p className="text-sm mt-1">Data status audit</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Performa per Departemen</h2>
        <div className="space-y-4">
          {[
            { dept: 'Produksi', score: 92, audits: 45, color: 'bg-primary' },
            { dept: 'Quality Control', score: 95, audits: 38, color: 'bg-success' },
            { dept: 'HSE', score: 88, audits: 32, color: 'bg-warning' },
            { dept: 'Admin', score: 85, audits: 28, color: 'bg-accent' },
            { dept: 'Warehouse', score: 90, audits: 25, color: 'bg-primary' },
          ].map((dept) => (
            <div key={dept.dept} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{dept.dept}</p>
                  <p className="text-sm text-muted-foreground">{dept.audits} audit selesai</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{dept.score}%</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${dept.color} transition-all duration-500`}
                  style={{ width: `${dept.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
