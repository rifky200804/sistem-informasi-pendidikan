import { api } from './api';
import { ApiResponse, PaginatedData, PaginatedResult } from '../types/api';

export interface Document {
  id: string;
  title: string;
  type: 'rapor' | 'laporan' | 'sertifikat' | 'lainnya';
  category?: string;
  filePath?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedById?: number;
  studentId?: string;
  documentDate?: string;
  uploadedAt: string;
}

export interface CreateDocumentData {
  title: string;
  category: string;
  file: File;
  studentId?: string;
  documentDate?: string;
}

export interface UpdateDocumentData {
  title?: string;
  category?: string;
  studentId?: string;
  file?: File;
  documentDate?: string;
}

export const documentService = {
  async getAll(page = 1, pageSize = 10): Promise<PaginatedResult<Document>> {
    const response = await api.get<ApiResponse<PaginatedData<Document>>>('/documents', {
      params: { page, pageSize }
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Document> {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data.data;
  },

  async create(data: CreateDocumentData): Promise<Document> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    formData.append('file', data.file);
    if (data.studentId) formData.append('studentId', data.studentId);
    if (data.documentDate) formData.append('documentDate', data.documentDate);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Gagal upload dokumen');
    }

    const result = (await response.json()) as ApiResponse<Document>;
    return result.data;
  },

  async update(id: string, data: UpdateDocumentData): Promise<Document> {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.file) formData.append('file', data.file);
    if (data.studentId) formData.append('studentId', data.studentId);
    if (data.documentDate !== undefined) formData.append('documentDate', data.documentDate);

    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Gagal update dokumen');
    }

    const result = (await response.json()) as ApiResponse<Document>;
    return result.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/documents/${id}`);
  },

  async download(id: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Gagal download dokumen');
    }
    
    return response.blob();
  },
};
