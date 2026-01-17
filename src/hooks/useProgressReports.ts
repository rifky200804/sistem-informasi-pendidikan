import { useState, useEffect } from 'react';
import { progressReportService, ProgressReport, CreateProgressReportData, UpdateProgressReportData } from '@/services/progressReportService';
import { useToast } from '@/hooks/use-toast';

export const useProgressReports = () => {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await progressReportService.getAll();
      setReports(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data rapor';
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

  const createReport = async (data: CreateProgressReportData) => {
    try {
      setError(null);
      const newReport = await progressReportService.create(data);
      setReports([...reports, newReport]);
      toast({
        title: "Berhasil",
        description: "Rapor berhasil ditambahkan",
      });
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan rapor';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateReport = async (id: string, data: UpdateProgressReportData) => {
    try {
      setError(null);
      const updatedReport = await progressReportService.update(id, data);
      setReports(reports.map(r => r.id === id ? updatedReport : r));
      toast({
        title: "Berhasil",
        description: "Rapor berhasil diupdate",
      });
      return updatedReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate rapor';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      setError(null);
      await progressReportService.delete(id);
      setReports(reports.filter(r => r.id !== id));
      toast({
        title: "Berhasil",
        description: "Rapor berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus rapor';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const generatePDF = async (id: string, fileName: string) => {
    try {
      setError(null);
      const blob = await progressReportService.generatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Berhasil",
        description: "PDF rapor berhasil didownload",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal generate PDF';
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
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    generatePDF,
  };
};
