import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Upload, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/base/DataTable';
import { StatCard } from '@/components/base/StatCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  title: string;
  type: string;
  generatedBy: string;
  date: string;
  size: string;
}

const mockReports: Report[] = [
  { id: 'RPT-001', title: 'Laporan Audit Bulanan Januari 2024', type: 'Bulanan', generatedBy: 'Ahmad Fauzi', date: '2024-01-31', size: '2.4 MB' },
  { id: 'RPT-002', title: 'Laporan Kualitas Produk Q1 2024', type: 'Quarterly', generatedBy: 'Siti Nurhaliza', date: '2024-01-30', size: '3.8 MB' },
  { id: 'RPT-003', title: 'Laporan Tindakan Korektif', type: 'Mingguan', generatedBy: 'Budi Santoso', date: '2024-01-28', size: '1.2 MB' },
  { id: 'RPT-004', title: 'Laporan Performa Tim QA', type: 'Bulanan', generatedBy: 'Dewi Lestari', date: '2024-01-27', size: '1.8 MB' },
  { id: 'RPT-005', title: 'Laporan Compliance ISO 9001', type: 'Tahunan', generatedBy: 'Eko Prasetyo', date: '2024-01-25', size: '5.6 MB' },
];

const columns: Column<Report>[] = [
  { key: 'id', header: 'ID Laporan' },
  { key: 'title', header: 'Judul Laporan' },
  { key: 'type', header: 'Tipe' },
  { key: 'generatedBy', header: 'Dibuat Oleh' },
  { key: 'date', header: 'Tanggal' },
  { key: 'size', header: 'Ukuran File' },
  {
    key: 'actions',
    header: 'Aksi',
    render: () => (
      <Button variant="ghost" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    ),
  },
];

export default function Reports() {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      type: formData.get('type'),
      file: formData.get('file') as File,
    };
    
    toast({
      title: "Laporan Berhasil Diupload",
      description: `Laporan "${data.title}" telah berhasil diupload.`,
    });
    setOpen(false);
  };

  const handleDeleteAnnualData = () => {
    if (!selectedYear) return;
    
    toast({
      title: "Data Tahunan Berhasil Dihapus",
      description: `Data tahun ${selectedYear} ${deleteFiles ? 'beserta file dokumennya' : 'tanpa file dokumen'} telah berhasil dihapus.`,
      variant: "destructive",
    });
    
    setDeleteDialogOpen(false);
    setSelectedYear('');
    setDeleteFiles(false);
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground mt-1">
            Akses dan kelola semua laporan Pendidikan
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-hover">
                <FileText className="w-4 h-4 mr-2" />
                Generate Laporan Baru
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Laporan Baru</DialogTitle>
                <DialogDescription>
                  Upload file laporan Pendidikan dengan mengisi form di bawah ini.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Laporan</Label>
                  <Input id="title" name="title" placeholder="Masukkan judul laporan" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Laporan</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe laporan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bulanan">Bulanan</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Mingguan">Mingguan</SelectItem>
                      <SelectItem value="Tahunan">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="file" 
                      name="file" 
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      required 
                      className="cursor-pointer"
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Upload Laporan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button onClick={openDeleteDialog} variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Data Tahunan
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Tahunan</AlertDialogTitle>
            <AlertDialogDescription>
              Pilih tahun yang ingin dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="year">Tahun</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="delete-files" 
                checked={deleteFiles}
                onCheckedChange={(checked) => setDeleteFiles(checked as boolean)}
              />
              <Label 
                htmlFor="delete-files" 
                className="text-sm font-normal cursor-pointer"
              >
                Hapus juga file dokumen terkait
              </Label>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive">
                ⚠️ Peringatan: Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setSelectedYear('');
              setDeleteFiles(false);
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAnnualData}
              disabled={!selectedYear}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Laporan"
          value="48"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Laporan Bulan Ini"
          value="12"
          icon={Calendar}
          variant="success"
          trend={{ value: 25, isPositive: true }}
        />
        <StatCard
          title="Rata-rata Waktu Generate"
          value="2.3 min"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Filter Tanggal
            </Button>
          </div>
        </div>
        <DataTable data={mockReports} columns={columns} />
      </Card>
    </div>
  );
}
