import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { DataTable, Column, StatusBadge } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { TeacherForm } from "@/components/forms/TeacherForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useTeachers } from "@/hooks/useTeachers";
import { CreateTeacherData, Teacher } from "@/services/teacherService";
import { useToast } from "@/hooks/use-toast";



const Teachers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { teachers, pagination, page, pageSize, setPage, setPageSize, loading, createTeacher, updateTeacher, deleteTeacher } = useTeachers();
  const { toast } = useToast();

  const handleCreate = async (data: CreateTeacherData) => {
    await createTeacher(data);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleUpdate = async (data: CreateTeacherData) => {
    if (selectedTeacher) {
      await updateTeacher(selectedTeacher.id, data);
      setSelectedTeacher(undefined);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId !== null) {
      await deleteTeacher(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTeacher(undefined);
  };

  const teacherColumns: Column<Teacher>[] = [
    {
      key: 'name',
      header: 'Nama Guru',
      render: (item) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => item.email ? (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{item.email}</span>
        </div>
      ) : "-",
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-2">
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
          <h1 className="text-3xl font-bold text-foreground">Data Guru</h1>
          <p className="text-muted-foreground">Kelola data guru dan tenaga pendidik</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Guru
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Daftar Guru</h2>
          <p className="text-sm text-muted-foreground">Total: {pagination?.totalItems ?? teachers.length} guru</p>
        </div>
        <DataTable
          data={teachers}
          columns={teacherColumns}
          pagination={pagination || undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          loading={loading}
        />
      </Card>

      <TeacherForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={selectedTeacher ? handleUpdate : handleCreate}
        teacher={selectedTeacher}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Guru"
        description="Apakah Anda yakin ingin menghapus data guru ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default Teachers;
