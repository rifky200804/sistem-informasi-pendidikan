import { useState, useEffect, useCallback } from 'react';
import { anecdoteService, Anecdote, CreateAnecdoteData, UpdateAnecdoteData } from '@/services/anecdoteService';
import { Pagination } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnecdotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await anecdoteService.getAll(page, pageSize);
      setAnecdotes(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data anekdot';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const createAnecdote = async (data: CreateAnecdoteData) => {
    try {
      setError(null);
      await anecdoteService.create(data);
      toast({ title: "Berhasil", description: "Anekdot berhasil ditambahkan" });
      fetchAnecdotes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan anekdot';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const updateAnecdote = async (id: number | string, data: UpdateAnecdoteData) => {
    try {
      setError(null);
      await anecdoteService.update(id, data);
      toast({ title: "Berhasil", description: "Anekdot berhasil diupdate" });
      fetchAnecdotes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate anekdot';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const deleteAnecdote = async (id: number | string) => {
    try {
      setError(null);
      await anecdoteService.delete(id);
      toast({ title: "Berhasil", description: "Anekdot berhasil dihapus" });
      fetchAnecdotes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus anekdot';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  useEffect(() => {
    fetchAnecdotes();
  }, [fetchAnecdotes]);

  return {
    anecdotes,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    loading,
    error,
    fetchAnecdotes,
    createAnecdote,
    updateAnecdote,
    deleteAnecdote,
  };
};
