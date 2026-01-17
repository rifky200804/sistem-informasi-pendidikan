import { useState, useEffect } from 'react';
import { reportService, Report, CreateReportData } from '@/services/reportService';
import { toast } from '@/hooks/use-toast';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal memuat data report',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (data: CreateReportData) => {
    setLoading(true);
    setError(null);
    try {
      const newReport = await reportService.create(data);
      setReports(prev => [...prev, newReport]);
      toast({
        title: 'Report berhasil dibuat',
        description: `${newReport.title} sedang diproses.`,
      });
      return newReport;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal membuat report',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (id: string, format: 'pdf' | 'csv') => {
    setLoading(true);
    try {
      const blob = await reportService.download(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Download berhasil',
        description: `Report telah didownload sebagai ${format.toUpperCase()}.`,
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Download gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await reportService.delete(id);
      setReports(prev => prev.filter(r => r.id !== id));
      toast({
        title: 'Report berhasil dihapus',
        description: 'Report telah dihapus dari sistem.',
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal menghapus report',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    downloadReport,
    deleteReport,
  };
}
