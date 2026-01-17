import { useState, useEffect } from 'react';
import { studentService, Student, CreateStudentData, UpdateStudentData } from '@/services/studentService';
import { useToast } from '@/hooks/use-toast';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data murid';
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

  const createStudent = async (data: CreateStudentData) => {
    try {
      setError(null);
      const newStudent = await studentService.create(data);
      setStudents([...students, newStudent]);
      toast({
        title: "Berhasil",
        description: "Data murid berhasil ditambahkan",
      });
      return newStudent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan murid';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateStudent = async (id: string, data: UpdateStudentData) => {
    try {
      setError(null);
      const updatedStudent = await studentService.update(id, data);
      setStudents(students.map(s => s.id === id ? updatedStudent : s));
      toast({
        title: "Berhasil",
        description: "Data murid berhasil diupdate",
      });
      return updatedStudent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate murid';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      setError(null);
      await studentService.delete(id);
      setStudents(students.filter(s => s.id !== id));
      toast({
        title: "Berhasil",
        description: "Data murid berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus murid';
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
    fetchStudents();
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
