import { useState, useEffect } from 'react';
import { documentService, Document, CreateDocumentData, UpdateDocumentData } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data dokumen';
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

  const uploadDocument = async (data: CreateDocumentData) => {
    try {
      setError(null);
      const newDocument = await documentService.create(data);
      setDocuments([...documents, newDocument]);
      toast({
        title: "Berhasil",
        description: "Dokumen berhasil diupload",
      });
      return newDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal upload dokumen';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateDocument = async (id: string, data: UpdateDocumentData) => {
    try {
      setError(null);
      const updatedDocument = await documentService.update(id, data);
      setDocuments(documents.map(d => d.id === id ? updatedDocument : d));
      toast({
        title: "Berhasil",
        description: "Data dokumen berhasil diupdate",
      });
      return updatedDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate dokumen';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      await documentService.delete(id);
      setDocuments(documents.filter(d => d.id !== id));
      toast({
        title: "Berhasil",
        description: "Dokumen berhasil dihapus",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus dokumen';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
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
      toast({
        title: "Berhasil",
        description: "Dokumen berhasil didownload",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal download dokumen';
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
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
  };
};
