import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const availableYears = ['2022/2023', '2023/2024', '2024/2025', '2025/2026'];

export default function Settings() {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    students: false,
    teachers: false,
    anecdotes: false,
    reports: false,
  });

  const handleDeleteData = () => {
    if (!selectedYear) {
      toast({
        title: "Pilih tahun ajaran",
        description: "Silakan pilih tahun ajaran yang akan dihapus.",
        variant: "destructive",
      });
      return;
    }

    const selectedItems = Object.entries(deleteOptions)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    if (selectedItems.length === 0) {
      toast({
        title: "Pilih data yang akan dihapus",
        description: "Silakan pilih minimal satu jenis data untuk dihapus.",
        variant: "destructive",
      });
      return;
    }

    // Simulate data deletion
    console.log(`Deleting data for year ${selectedYear}:`, selectedItems);
    
    setDeleteDialogOpen(false);
    setSelectedYear('');
    setDeleteOptions({
      students: false,
      teachers: false,
      anecdotes: false,
      reports: false,
    });

    toast({
      title: "Data Berhasil Dihapus",
      description: `Data tahun ajaran ${selectedYear} telah dihapus.`,
    });
  };

  const handleResetData = () => {
    if (!selectedYear) {
      toast({
        title: "Pilih tahun ajaran",
        description: "Silakan pilih tahun ajaran yang akan direset.",
        variant: "destructive",
      });
      return;
    }

    // Simulate data reset
    console.log(`Resetting data for year ${selectedYear}`);
    
    setResetDialogOpen(false);
    setSelectedYear('');

    toast({
      title: "Data Berhasil Direset",
      description: `Data tahun ajaran ${selectedYear} telah direset ke kondisi awal.`,
    });
  };

  const toggleOption = (key: keyof typeof deleteOptions) => {
    setDeleteOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-muted-foreground mt-1">
          Kelola data tahunan sistem
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Manajemen Data Tahunan</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Pilih Tahun Ajaran</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Pilih tahun ajaran" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Pilih Data yang Akan Dihapus</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="students"
                  checked={deleteOptions.students}
                  onCheckedChange={() => toggleOption('students')}
                />
                <Label htmlFor="students" className="font-normal cursor-pointer">
                  Data Murid
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teachers"
                  checked={deleteOptions.teachers}
                  onCheckedChange={() => toggleOption('teachers')}
                />
                <Label htmlFor="teachers" className="font-normal cursor-pointer">
                  Data Guru
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anecdotes"
                  checked={deleteOptions.anecdotes}
                  onCheckedChange={() => toggleOption('anecdotes')}
                />
                <Label htmlFor="anecdotes" className="font-normal cursor-pointer">
                  Data Anekdot
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reports"
                  checked={deleteOptions.reports}
                  onCheckedChange={() => toggleOption('reports')}
                />
                <Label htmlFor="reports" className="font-normal cursor-pointer">
                  Data Rapor
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setResetDialogOpen(true)}
              disabled={!selectedYear}
            >
              Reset Data Tahun Ini
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!selectedYear || !Object.values(deleteOptions).some(v => v)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Data Terpilih
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Tahun {selectedYear}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data yang dipilih untuk tahun ajaran {selectedYear} secara permanen dan tidak dapat dibatalkan. 
              <br /><br />
              Data yang akan dihapus:
              <ul className="list-disc list-inside mt-2">
                {deleteOptions.students && <li>Data Murid</li>}
                {deleteOptions.teachers && <li>Data Guru</li>}
                {deleteOptions.anecdotes && <li>Data Anekdot</li>}
                {deleteOptions.reports && <li>Data Rapor</li>}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteData} className="bg-destructive hover:bg-destructive/90">
              Hapus Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Data Tahun {selectedYear}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mereset semua data tahun ajaran {selectedYear} ke kondisi awal. 
              Data seperti murid dan guru akan tetap ada, tetapi nilai, rapor, dan anekdot akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
              Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}