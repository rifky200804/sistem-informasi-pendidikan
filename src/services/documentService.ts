import { api } from './api';
import { ApiResponse, PaginatedData } from '../types/api';

export interface Document {
  id: string;
  title: string;
  type: 'rapor' | 'laporan' | 'sertifikat' | 'lainnya';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  studentId?: string;
  uploadedAt: string;
}

export interface CreateDocumentData {
  title: string;
  type: 'rapor' | 'laporan' | 'sertifikat' | 'lainnya';
  file: File;
  studentId?: string;
}

export interface UpdateDocumentData {
  title?: string;
  type?: 'rapor' | 'laporan' | 'sertifikat' | 'lainnya';
  studentId?: string;
}

export const documentService = {
  async getAll(): Promise<Document[]> {
    const response = await api.get<ApiResponse<PaginatedData<Document>>>('/documents');
    return response.data.data.data;
  },

  async getById(id: string): Promise<Document> {
    const response = await api.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data.data;
  },

  async create(data: CreateDocumentData): Promise<Document> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('file', data.file);
    if (data.studentId) formData.append('studentId', data.studentId);

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
    const response = await api.put<ApiResponse<Document>>(`/documents/${id}`, data);
    return response.data.data;
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
