import { useState, useEffect, useCallback } from 'react';
import { teacherService, Teacher, CreateTeacherData, UpdateTeacherData } from '@/services/teacherService';
import { Pagination } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await teacherService.getAll(page, pageSize, search);
      setTeachers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal mengambil data guru'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  const createTeacher = async (data: CreateTeacherData) => {
    try {
      setError(null);
      await teacherService.create(data);
      toast({ title: "Berhasil", description: "Data guru berhasil ditambahkan" });
      fetchTeachers();
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal menambahkan guru'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const updateTeacher = async (id: number, data: UpdateTeacherData) => {
    try {
      setError(null);
      await teacherService.update(id, data);
      toast({ title: "Berhasil", description: "Data guru berhasil diupdate" });
      fetchTeachers();
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal mengupdate guru'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const deleteTeacher = async (id: number) => {
    try {
      setError(null);
      await teacherService.delete(id);
      toast({ title: "Berhasil", description: "Data guru berhasil dihapus" });
      fetchTeachers();
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal menghapus guru'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    loading,
    error,
    search,
    setSearch,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  };
};
