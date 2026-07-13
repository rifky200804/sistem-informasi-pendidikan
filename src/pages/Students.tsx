import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Edit, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/base/DataTable";
import { StudentForm } from "@/components/forms/StudentForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useStudents } from "@/hooks/useStudents";
import { CreateStudentData, Student as StudentType } from "@/services/studentService";

const Students = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | undefined>();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const classNameFilter = searchParams.get("className") || undefined;
  const { students, pagination, page, pageSize, setPage, setPageSize, loading, createStudent, updateStudent, deleteStudent, search, setSearch } = useStudents(classNameFilter);

  const handleCreate = async (data: CreateStudentData) => {
    await createStudent(data);
  };

  const handleEdit = (student: StudentType) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleUpdate = async (data: CreateStudentData) => {
    if (selectedStudent) {
      await updateStudent(selectedStudent.id, data);
      setSelectedStudent(undefined);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId !== null) {
      await deleteStudent(deleteId);
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStudent(undefined);
  };

  const studentColumns: Column<StudentType>[] = [
    { key: 'nisn', header: 'NISN' },
    {
      key: 'name',
      header: 'Nama Murid',
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: 'identifier', header: 'Identifier NIK' },
    { key: 'className', header: 'Kelas' },
    { key: 'tahunAjaran', header: 'Tahun Ajaran' },
    { key: 'parentName', header: 'Nama Orang Tua' },
    { key: 'parentPhone', header: 'No. Telepon' },
    { key: 'address', header: 'Alamat' },
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
          <h1 className="text-3xl font-bold text-foreground">Data Murid</h1>
          <p className="text-muted-foreground">Kelola data murid dan siswa</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Murid
        </Button>
      </div>

      <Card className="p-6">

        <DataTable
          data={students}
          columns={studentColumns}
          pagination={pagination || undefined}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </Card>

      <StudentForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={selectedStudent ? handleUpdate : handleCreate}
        student={selectedStudent}
        defaultClassName={classNameFilter}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Murid"
        description="Apakah Anda yakin ingin menghapus data murid ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default Students;
