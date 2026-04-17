import { api } from './api';
import { ApiResponse, PaginatedData, PaginatedResult } from '../types/api';

export interface APE {
  id: number;
  name: string;
  condition: string;
  quantity: number;
  location: string;
  photo?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  updatedById: number;
}

export interface CreateAPEData {
  name: string;
  condition: string;
  quantity: number;
  location: string;
  photo?: File | null;
}

export type UpdateAPEData = Partial<CreateAPEData>;

export const apeService = {
  async getAll(page = 1, pageSize = 10): Promise<PaginatedResult<APE>> {
    const response = await api.get<ApiResponse<PaginatedData<APE>>>('/ape', {
      params: { page, pageSize }
    });
    return response.data.data;
  },

  async getById(id: number | string): Promise<APE> {
    const response = await api.get<ApiResponse<APE>>(`/ape/${id}`);
    return response.data.data;
  },

  async create(data: CreateAPEData): Promise<APE> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    const response = await api.post<ApiResponse<APE>>('/ape', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  async update(id: number | string, data: UpdateAPEData): Promise<APE> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    });

    const response = await api.put<ApiResponse<APE>>(`/ape/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/ape/${id}`);
  },
};
