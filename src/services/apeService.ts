import { api } from './api';
import { ApiResponse, PaginatedData } from '../types/api';

export interface APE {
  id: string;
  name: string;
  code: string;
  category: 'indoor' | 'outdoor' | 'edukatif' | 'kreativitas';
  quantity: number;
  condition: 'baik' | 'rusak' | 'hilang';
  location: string;
  purchaseDate: string;
  price: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAPEData {
  name: string;
  code: string;
  category: 'indoor' | 'outdoor' | 'edukatif' | 'kreativitas';
  quantity: number;
  condition: 'baik' | 'rusak' | 'hilang';
  location: string;
  purchaseDate: string;
  price: number;
  notes: string;
}

export interface UpdateAPEData extends Partial<CreateAPEData> {}

export const apeService = {
  async getAll(): Promise<APE[]> {
    const response = await api.get<ApiResponse<PaginatedData<APE>>>('/ape');
    return response.data.data.data;
  },

  async getById(id: string): Promise<APE> {
    const response = await api.get<ApiResponse<APE>>(`/ape/${id}`);
    return response.data.data;
  },

  async create(data: CreateAPEData): Promise<APE> {
    const response = await api.post<ApiResponse<APE>>('/ape', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateAPEData): Promise<APE> {
    const response = await api.put<ApiResponse<APE>>(`/ape/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/ape/${id}`);
  },
};
