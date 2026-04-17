import { useState, useEffect, useCallback } from 'react';
import { documentService, Document, CreateDocumentData, UpdateDocumentData } from '@/services/documentService';
import { Pagination } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await documentService.getAll(page, pageSize);
      setDocuments(result.data);
      setPagination(result.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data dokumen';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const uploadDocument = async (data: CreateDocumentData) => {
    try {
      setError(null);
      await documentService.create(data);
      toast({ title: "Berhasil", description: "Dokumen berhasil diupload" });
      fetchDocuments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal upload dokumen';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const updateDocument = async (id: string, data: UpdateDocumentData) => {
    try {
      setError(null);
      await documentService.update(id, data);
      toast({ title: "Berhasil", description: "Data dokumen berhasil diupdate" });
      fetchDocuments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate dokumen';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      await documentService.delete(id);
      toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
      fetchDocuments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus dokumen';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  const downloadDocument = async (id: string, fileName: string) => {
    try {
      setError(null);
      const blob = await documentService.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Berhasil", description: "Dokumen berhasil didownload" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal download dokumen';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
  };
};
