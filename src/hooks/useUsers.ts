import { useState, useEffect, useCallback } from 'react';
import { userService, User, CreateUserData, UpdateUserData } from '@/services/userService';
import { toast } from '@/hooks/use-toast';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal mengambil data user'));
      setError(err as Error);
      toast({
        title: 'Gagal mengambil data user',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (data: CreateUserData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.create(data);
      setUsers(prev => [...prev, newUser]);
      toast({
        title: 'User berhasil ditambahkan',
        description: `${newUser.name} telah ditambahkan ke sistem.`,
      });
      return newUser;
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal menambahkan user'));
      setError(err as Error);
      toast({
        title: 'Gagal menambahkan user',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, data: UpdateUserData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.update(id, data);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      toast({
        title: 'User berhasil diupdate',
        description: `Data ${updatedUser.name} telah diperbarui.`,
      });
      return updatedUser;
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal mengupdate user'));
      setError(err as Error);
      toast({
        title: 'Gagal mengupdate user',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await userService.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast({
        title: 'User berhasil dihapus',
        description: 'User telah dihapus dari sistem.',
      });
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal menghapus user'));
      setError(err as Error);
      toast({
        title: 'Gagal menghapus user',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
