import { useState, useEffect } from 'react';
import { reportTemplateService, ReportTemplate, CreateReportTemplateData, UpdateReportTemplateData } from '@/services/reportTemplateService';
import { useToast } from '@/hooks/use-toast';

export const useReportTemplates = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportTemplateService.getAll();
      setTemplates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data template';
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

  const createTemplate = async (data: CreateReportTemplateData) => {
    try {
      setError(null);
      const newTemplate = await reportTemplateService.create(data);
      setTemplates([...templates, newTemplate]);
      toast({
        title: "Berhasil",
        description: "Template berhasil ditambahkan",
      });
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateTemplate = async (id: string, data: UpdateReportTemplateData) => {
    try {
      setError(null);
      const updatedTemplate = await reportTemplateService.update(id, data);
      setTemplates(templates.map(t => t.id === id ? updatedTemplate : t));
      toast({
        title: "Berhasil",
        description: "Template berhasil diupdate",
      });
      return updatedTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate template';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      setError(null);
      await reportTemplateService.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
      toast({
        title: "Berhasil",
        description: "Template berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus template';
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
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
