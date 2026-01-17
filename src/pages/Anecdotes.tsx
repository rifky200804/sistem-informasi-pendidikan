import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, User, Edit, Trash2, Eye } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { AnecdoteForm } from "@/components/forms/AnecdoteForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { AnecdoteDetailDialog } from "@/components/dialogs/AnecdoteDetailDialog";
import { useAnecdotes } from "@/hooks/useAnecdotes";
import { CreateAnecdoteData, Anecdote as AnecdoteType } from "@/services/anecdoteService";

interface AnecdoteMock {
  id: string;
  student: string;
  title: string;
  description: string;
  date: string;
  teacher: string;
  category: string;
  imageUrl?: string;
}

const mockAnecdotes: AnecdoteMock[] = [
  { id: 'ANC-001', student: 'Aisyah Putri', title: 'Berbagi Mainan dengan Teman', description: 'Aisyah dengan sukarela berbagi mainan puzzle dengan teman sekelasnya. Ia menunjukkan sikap peduli dan empati terhadap teman-temannya yang juga ingin bermain. Guru mengapresiasi perilaku positif ini sebagai contoh perkembangan sosial emosional yang baik.', date: '2024-01-20', teacher: 'Siti Aminah', category: 'Sosial Emosional', imageUrl: '/placeholder.svg' },
  { id: 'ANC-002', student: 'Muhammad Rizki', title: 'Menyelesaikan Puzzle 20 Keping', description: 'Rizki berhasil menyelesaikan puzzle 20 keping dengan mandiri tanpa bantuan guru. Ia menunjukkan konsentrasi dan ketekunan yang baik selama proses penyelesaian.', date: '2024-01-20', teacher: 'Budi Santoso', category: 'Kognitif' },
  { id: 'ANC-003', student: 'Zahra Amelia', title: 'Membantu Membersihkan Kelas', description: 'Zahra aktif membantu guru membersihkan kelas setelah kegiatan melukis. Ia mengambil inisiatif untuk membereskan peralatan tanpa diminta.', date: '2024-01-19', teacher: 'Dewi Lestari', category: 'Kemandirian' },
  { id: 'ANC-004', student: 'Farhan Hakim', title: 'Bernyanyi di Depan Kelas', description: 'Farhan berani bernyanyi lagu anak-anak di depan teman-temannya dengan penuh percaya diri. Ia menunjukkan perkembangan dalam aspek seni dan keberanian.', date: '2024-01-19', teacher: 'Ahmad Fauzi', category: 'Seni & Kreativitas' },
  { id: 'ANC-005', student: 'Salsabila Azzahra', title: 'Melompat dengan Satu Kaki', description: 'Salsabila menunjukkan kemampuan motorik yang baik dengan melompat satu kaki secara seimbang. Koordinasi tubuhnya sangat baik untuk usianya.', date: '2024-01-18', teacher: 'Rina Kartika', category: 'Motorik' },
];

const Anecdotes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAnecdote, setSelectedAnecdote] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string>("");
  const { anecdotes, loading, createAnecdote, updateAnecdote, deleteAnecdote } = useAnecdotes();

  const handleCreate = async (data: CreateAnecdoteData) => {
    await createAnecdote(data);
  };

  const handleEdit = (anecdote: any) => {
    setSelectedAnecdote(anecdote);
    setIsFormOpen(true);
  };

  const handleView = (anecdote: any) => {
    setSelectedAnecdote(anecdote);
    setIsDetailOpen(true);
  };

  const handleUpdate = async (data: CreateAnecdoteData) => {
    if (selectedAnecdote) {
      await updateAnecdote(selectedAnecdote.id, data);
      setSelectedAnecdote(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteAnecdote(deleteId);
    setIsDeleteOpen(false);
    setDeleteId("");
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAnecdote(null);
  };

  const anecdoteColumns: Column<any>[] = [
    { key: 'id', header: 'ID Anekdot' },
    {
      key: 'student',
      header: 'Nama Murid',
      render: (item) => item.student || item.studentName ? (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="font-medium">{item.student || item.studentName}</span>
        </div>
      ) : "-",
    },
    { key: 'title', header: 'Judul Aktivitas' },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (item) => (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {item.description || item.content}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => (
        <Badge variant="outline">{item.category}</Badge>
      ),
    },
    { key: 'teacher', header: 'Guru' },
    {
      key: 'date',
      header: 'Tanggal',
      render: (item) => item.date ? (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{new Date(item.date).toLocaleDateString('id-ID')}</span>
        </div>
      ) : "-",
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const displayData = loading ? mockAnecdotes : (anecdotes.length > 0 ? anecdotes : mockAnecdotes);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Anekdot & Berita Harian</h1>
          <p className="text-muted-foreground">Catat aktivitas dan perkembangan harian murid</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Anekdot
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Catatan Anekdot Terbaru</h2>
          <p className="text-sm text-muted-foreground">Total: {displayData.length} catatan</p>
        </div>
        <DataTable data={displayData} columns={anecdoteColumns} />
      </Card>

      <AnecdoteForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={selectedAnecdote ? handleUpdate : handleCreate}
        anecdote={selectedAnecdote}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Anekdot"
        description="Apakah Anda yakin ingin menghapus catatan anekdot ini? Tindakan ini tidak dapat dibatalkan."
      />

      <AnecdoteDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        anecdote={selectedAnecdote}
      />
    </div>
  );
};

export default Anecdotes;
