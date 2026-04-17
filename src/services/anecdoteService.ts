import { api } from './api';
import { ApiResponse, PaginatedData, PaginatedResult } from '../types/api';

export interface Anecdote {
  id: number;
  content: string;
  description: string | null;
  category: string | null;
  date: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  teacherId: number;
  title?: string;
  studentId?: number | string;
}

export interface CreateAnecdoteData {
  content: string;
  description?: string;
  category?: string;
  date: string;
  teacherId?: number;
  studentId?: string | number;
  title?: string;
  image?: File | null;
}

export type UpdateAnecdoteData = Partial<CreateAnecdoteData>;

export const anecdoteService = {
  async getAll(page = 1, pageSize = 10): Promise<PaginatedResult<Anecdote>> {
    const response = await api.get<ApiResponse<PaginatedData<Anecdote>>>('/anecdotes', {
      params: { page, pageSize }
    });
    return response.data.data;
  },

  async getById(id: number | string): Promise<Anecdote> {
    const response = await api.get<ApiResponse<Anecdote>>(`/anecdotes/${id}`);
    return response.data.data;
  },

  async getByStudentId(studentId: number | string): Promise<Anecdote[]> {
    const response = await api.get<ApiResponse<PaginatedData<Anecdote>>>(`/anecdotes/student/${studentId}`);
    return response.data.data.data;
  },

  async create(data: CreateAnecdoteData): Promise<Anecdote> {
    if (data.image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      const response = await api.post<ApiResponse<Anecdote>>('/anecdotes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    }
    const response = await api.post<ApiResponse<Anecdote>>('/anecdotes', data);
    return response.data.data;
  },

  async update(id: number | string, data: UpdateAnecdoteData): Promise<Anecdote> {
    if (data.image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      const response = await api.put<ApiResponse<Anecdote>>(`/anecdotes/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    }
    const response = await api.put<ApiResponse<Anecdote>>(`/anecdotes/${id}`, data);
    return response.data.data;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/anecdotes/${id}`);
  },
};
