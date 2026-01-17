import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User, Calendar, Edit, Trash2 } from "lucide-react";
import { DataTable, Column, StatusBadge, PaginationInfo } from "@/components/base/DataTable";
import { Badge } from "@/components/ui/badge";
import { StudentForm } from "@/components/forms/StudentForm";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";
import { useStudents } from "@/hooks/useStudents";
import { CreateStudentData, Student as StudentType } from "@/services/studentService";

interface StudentMock {
  id: string;
  name: string;
  nisn: string;
  birthDate: string;
  class: string;
  parent: string;
  status: string;
}

const mockStudents: StudentMock[] = [
  { id: 'STD-001', name: 'Aisyah Putri', nisn: '1234567890', birthDate: '2018-05-12', class: 'Kelas A', parent: 'Ibu Sari', status: 'active' },
  { id: 'STD-002', name: 'Muhammad Rizki', nisn: '1234567891', birthDate: '2018-03-20', class: 'Kelas A', parent: 'Bapak Ahmad', status: 'active' },
  { id: 'STD-003', name: 'Zahra Amelia', nisn: '1234567892', birthDate: '2018-07-15', class: 'Kelas B', parent: 'Ibu Fitri', status: 'active' },
  { id: 'STD-004', name: 'Farhan Hakim', nisn: '1234567893', birthDate: '2018-01-08', class: 'Kelas B', parent: 'Bapak Andi', status: 'active' },
  { id: 'STD-005', name: 'Salsabila Azzahra', nisn: '1234567894', birthDate: '2018-09-22', class: 'Kelas C', parent: 'Ibu Nur', status: 'inactive' },
  { id: 'STD-006', name: 'Raffi Ahmad', nisn: '1234567895', birthDate: '2018-11-30', class: 'Kelas C', parent: 'Bapak Hadi', status: 'active' },
  { id: 'STD-007', name: 'Nabila Syifa', nisn: '1234567896', birthDate: '2018-02-14', class: 'Kelas A', parent: 'Ibu Dewi', status: 'active' },
  { id: 'STD-008', name: 'Dimas Pratama', nisn: '1234567897', birthDate: '2018-04-25', class: 'Kelas B', parent: 'Bapak Rudi', status: 'active' },
  { id: 'STD-009', name: 'Anisa Rahma', nisn: '1234567898', birthDate: '2018-06-18', class: 'Kelas C', parent: 'Ibu Rina', status: 'active' },
  { id: 'STD-010', name: 'Bayu Setiawan', nisn: '1234567899', birthDate: '2018-08-05', class: 'Kelas A', parent: 'Bapak Joko', status: 'inactive' },
  { id: 'STD-011', name: 'Citra Ayu', nisn: '1234567900', birthDate: '2018-10-12', class: 'Kelas B', parent: 'Ibu Maya', status: 'active' },
  { id: 'STD-012', name: 'Dinda Permata', nisn: '1234567901', birthDate: '2018-12-01', class: 'Kelas C', parent: 'Bapak Hendra', status: 'active' },
  { id: 'STD-013', name: 'Eko Prasetyo', nisn: '1234567902', birthDate: '2018-01-20', class: 'Kelas A', parent: 'Ibu Sri', status: 'active' },
  { id: 'STD-014', name: 'Fitria Sari', nisn: '1234567903', birthDate: '2018-03-15', class: 'Kelas B', parent: 'Bapak Agus', status: 'active' },
  { id: 'STD-015', name: 'Galih Ramadan', nisn: '1234567904', birthDate: '2018-05-28', class: 'Kelas C', parent: 'Ibu Wati', status: 'inactive' },
  { id: 'STD-016', name: 'Hana Safitri', nisn: '1234567905', birthDate: '2018-07-10', class: 'Kelas A', parent: 'Bapak Doni', status: 'active' },
  { id: 'STD-017', name: 'Irfan Habibi', nisn: '1234567906', birthDate: '2018-09-05', class: 'Kelas B', parent: 'Ibu Linda', status: 'active' },
  { id: 'STD-018', name: 'Jasmine Aulia', nisn: '1234567907', birthDate: '2018-11-18', class: 'Kelas C', parent: 'Bapak Yanto', status: 'active' },
  { id: 'STD-019', name: 'Kevin Wijaya', nisn: '1234567908', birthDate: '2018-02-08', class: 'Kelas A', parent: 'Ibu Tina', status: 'active' },
  { id: 'STD-020', name: 'Laila Putri', nisn: '1234567909', birthDate: '2018-04-22', class: 'Kelas B', parent: 'Bapak Budi', status: 'inactive' },
];

const columns: Column<StudentMock>[] = [
  { key: 'id', header: 'ID Murid' },
  { key: 'name', header: 'Nama Murid' },
  { key: 'nisn', header: 'NISN' },
  {
    key: 'birthDate',
    header: 'Tanggal Lahir',
    render: (item) => item.birthDate ? (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{new Date(item.birthDate).toLocaleDateString('id-ID')}</span>
      </div>
    ) : "-",
  },
  { key: 'class', header: 'Kelas' },
  { key: 'parent', header: 'Orang Tua/Wali' },
  {
    key: 'status',
    header: 'Status',
    render: (item) => (
      <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
        {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
      </Badge>
    ),
  },
];

const Students = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | undefined>();
  const [deleteId, setDeleteId] = useState<string>("");
  const { students, loading, createStudent, updateStudent, deleteStudent } = useStudents();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteStudent(deleteId);
    setIsDeleteOpen(false);
    setDeleteId("");
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStudent(undefined);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
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
    {
      key: 'gender',
      header: 'Jenis Kelamin',
      render: (item) => item.gender ? (
        <Badge variant="outline">{item.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</Badge>
      ) : "-",
    },
    { key: 'class', header: 'Kelas' },
    {
      key: 'birthDate',
      header: 'Tanggal Lahir',
      render: (item) => item.birthDate ? (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{new Date(item.birthDate).toLocaleDateString('id-ID')}</span>
        </div>
      ) : "-",
    },
    { key: 'parentName', header: 'Nama Orang Tua' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
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

  const allData = loading ? (mockStudents as any) : (students.length > 0 ? students as any : mockStudents as any);

  // Calculate pagination
  const totalItems = allData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayData = allData.slice(startIndex, endIndex);

  const pagination: PaginationInfo = {
    page: currentPage,
    pageSize: pageSize,
    totalItems: totalItems,
    totalPages: totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Daftar Murid</h2>
          <p className="text-sm text-muted-foreground">Total: {totalItems} murid</p>
        </div>
        <DataTable
          data={displayData}
          columns={studentColumns}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </Card>

      <StudentForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={selectedStudent ? handleUpdate : handleCreate}
        student={selectedStudent}
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
