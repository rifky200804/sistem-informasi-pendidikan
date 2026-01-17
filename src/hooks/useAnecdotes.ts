import { useState, useEffect } from 'react';
import { anecdoteService, Anecdote, CreateAnecdoteData, UpdateAnecdoteData } from '@/services/anecdoteService';
import { useToast } from '@/hooks/use-toast';

export const useAnecdotes = () => {
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnecdotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await anecdoteService.getAll();
      setAnecdotes(data);
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
  };

  const createAnecdote = async (data: CreateAnecdoteData) => {
    try {
      setError(null);
      const newAnecdote = await anecdoteService.create(data);
      setAnecdotes([...anecdotes, newAnecdote]);
      toast({
        title: "Berhasil",
        description: "Anekdot berhasil ditambahkan",
      });
      return newAnecdote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan anekdot';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateAnecdote = async (id: string, data: UpdateAnecdoteData) => {
    try {
      setError(null);
      const updatedAnecdote = await anecdoteService.update(id, data);
      setAnecdotes(anecdotes.map(a => a.id === id ? updatedAnecdote : a));
      toast({
        title: "Berhasil",
        description: "Anekdot berhasil diupdate",
      });
      return updatedAnecdote;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate anekdot';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteAnecdote = async (id: string) => {
    try {
      setError(null);
      await anecdoteService.delete(id);
      setAnecdotes(anecdotes.filter(a => a.id !== id));
      toast({
        title: "Berhasil",
        description: "Anekdot berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus anekdot';
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
    fetchAnecdotes();
  }, []);

  return {
    anecdotes,
    loading,
    error,
    fetchAnecdotes,
    createAnecdote,
    updateAnecdote,
    deleteAnecdote,
  };
};
