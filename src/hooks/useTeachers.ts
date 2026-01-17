import { useState, useEffect } from 'react';
import { teacherService, Teacher, CreateTeacherData, UpdateTeacherData } from '@/services/teacherService';
import { useToast } from '@/hooks/use-toast';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data guru';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeacher = async (data: CreateTeacherData) => {
    try {
      setError(null);
      const newTeacher = await teacherService.create(data);
      setTeachers([...teachers, newTeacher]);
      toast({
        title: "Berhasil",
        description: "Data guru berhasil ditambahkan",
      });
      return newTeacher;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan guru';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTeacher = async (id: string, data: UpdateTeacherData) => {
    try {
      setError(null);
      const updatedTeacher = await teacherService.update(id, data);
      setTeachers(teachers.map(t => t.id === id ? updatedTeacher : t));
      toast({
        title: "Berhasil",
        description: "Data guru berhasil diupdate",
      });
      return updatedTeacher;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate guru';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      setError(null);
      await teacherService.delete(id);
      setTeachers(teachers.filter(t => t.id !== id));
      toast({
        title: "Berhasil",
        description: "Data guru berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus guru';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return {
    teachers,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  };
};
