import { useState, useEffect } from 'react';
import { apeService, APE, CreateAPEData, UpdateAPEData } from '@/services/apeService';
import { useToast } from '@/hooks/use-toast';

export const useAPE = () => {
  const [apeList, setApeList] = useState<APE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAPE = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apeService.getAll();
      setApeList(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data APE';
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

  const createAPE = async (data: CreateAPEData) => {
    try {
      setError(null);
      const newAPE = await apeService.create(data);
      setApeList([...apeList, newAPE]);
      toast({
        title: "Berhasil",
        description: "Data APE berhasil ditambahkan",
      });
      return newAPE;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan APE';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateAPE = async (id: string, data: UpdateAPEData) => {
    try {
      setError(null);
      const updatedAPE = await apeService.update(id, data);
      setApeList(apeList.map(a => a.id === id ? updatedAPE : a));
      toast({
        title: "Berhasil",
        description: "Data APE berhasil diupdate",
      });
      return updatedAPE;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate APE';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteAPE = async (id: string) => {
    try {
      setError(null);
      await apeService.delete(id);
      setApeList(apeList.filter(a => a.id !== id));
      toast({
        title: "Berhasil",
        description: "Data APE berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus APE';
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
    fetchAPE();
  }, []);

  return {
    apeList,
    loading,
    error,
    fetchAPE,
    createAPE,
    updateAPE,
    deleteAPE,
  };
};
