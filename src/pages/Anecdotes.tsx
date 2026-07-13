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



const Anecdotes = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAnecdote, setSelectedAnecdote] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | string>("");
  const { anecdotes, pagination, page, pageSize, setPage, setPageSize, loading, createAnecdote, updateAnecdote, deleteAnecdote } = useAnecdotes();

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

  const handleDeleteClick = (id: number | string) => {
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
    {
      key: 'content',
      header: 'Judul',
      render: (item) => item.content ? <span className="font-medium">{item.content}</span> : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'description',
      header: 'Deskripsi',
      render: (item) => item.description ? <span className="text-sm text-muted-foreground line-clamp-2">{item.description}</span> : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => item.category ? <Badge variant="outline">{item.category}</Badge> : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'date',
      header: 'Tanggal',
      render: (item) => item.date ? (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{new Date(item.date).toLocaleDateString('id-ID')}</span>
        </div>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'actions',
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

        <DataTable
          data={anecdotes}
          columns={anecdoteColumns}
          pagination={pagination || undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          loading={loading}
        />
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
