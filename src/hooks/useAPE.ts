import { useState, useEffect, useCallback } from 'react';
import { apeService, APE, CreateAPEData, UpdateAPEData } from '@/services/apeService';
import { Pagination } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useAPE = () => {
  const [apeList, setApeList] = useState<APE[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchAPE = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apeService.getAll(page, pageSize, search);
      setApeList(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal mengambil data APE'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  const createAPE = async (data: CreateAPEData) => {
    try {
      setError(null);
      await apeService.create(data);
      toast({ title: "Berhasil", description: "Data APE berhasil ditambahkan" });
      fetchAPE();
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal menambahkan APE'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const updateAPE = async (id: number | string, data: UpdateAPEData) => {
    try {
      setError(null);
      await apeService.update(id, data);
      toast({ title: "Berhasil", description: "Data APE berhasil diupdate" });
      fetchAPE();
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal mengupdate APE'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const deleteAPE = async (id: number | string) => {
    try {
      setError(null);
      await apeService.delete(id);
      toast({ title: "Berhasil", description: "Data APE berhasil dihapus" });
      fetchAPE();
    } catch (err) {
      const errorMessage = (err as any)?.message || (err as any)?.error || (typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Gagal menghapus APE'));
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchAPE();
  }, [fetchAPE]);

  return {
    apeList,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    loading,
    error,
    search,
    setSearch,
    fetchAPE,
    createAPE,
    updateAPE,
    deleteAPE,
  };
};
