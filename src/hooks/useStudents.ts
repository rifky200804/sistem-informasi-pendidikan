import { useState, useEffect, useCallback } from 'react';
import { studentService, Student, CreateStudentData, UpdateStudentData } from '@/services/studentService';
import { Pagination } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useStudents = (className?: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await studentService.getAll(page, pageSize, className, search);
      setStudents(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data murid';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, className, search]);

  const createStudent = async (data: CreateStudentData) => {
    try {
      setError(null);
      await studentService.create(data);
      toast({ title: "Berhasil", description: "Data murid berhasil ditambahkan" });
      fetchStudents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan murid';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const updateStudent = async (id: number, data: UpdateStudentData) => {
    try {
      setError(null);
      await studentService.update(id, data);
      toast({ title: "Berhasil", description: "Data murid berhasil diupdate" });
      fetchStudents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate murid';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      setError(null);
      await studentService.delete(id);
      toast({ title: "Berhasil", description: "Data murid berhasil dihapus" });
      fetchStudents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus murid';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  useEffect(() => {
    setPage(1);
  }, [className, search]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    loading,
    error,
    search,
    setSearch,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
