import { api } from './api';
import { ApiResponse, PaginatedData } from '../types/api';

export interface Anecdote {
  id: string;
  title: string;
  content: string;
  studentId: string;
  studentName: string;
  date: string;
  category: 'prestasi' | 'perilaku' | 'kesehatan' | 'umum';
  createdBy: string;
  createdAt: string;
}

export interface CreateAnecdoteData {
  title: string;
  content: string;
  studentId: string;
  date: string;
  category: 'prestasi' | 'perilaku' | 'kesehatan' | 'umum';
}

export interface UpdateAnecdoteData extends Partial<CreateAnecdoteData> {}

export const anecdoteService = {
  async getAll(): Promise<Anecdote[]> {
    const response = await api.get<ApiResponse<PaginatedData<Anecdote>>>('/anecdotes');
    return response.data.data.data;
  },

  async getById(id: string): Promise<Anecdote> {
    const response = await api.get<ApiResponse<Anecdote>>(`/anecdotes/${id}`);
    return response.data.data;
  },

  async getByStudentId(studentId: string): Promise<Anecdote[]> {
    // Assuming byStudentId returns a list, so likely Paginated or list wrapped in ApiResponse
    // If it returns just list, adjust. Assuming consistency with getAll
    const response = await api.get<ApiResponse<PaginatedData<Anecdote>>>(`/anecdotes/student/${studentId}`);
    return response.data.data.data;
  },

  async create(data: CreateAnecdoteData): Promise<Anecdote> {
    const response = await api.post<ApiResponse<Anecdote>>('/anecdotes', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateAnecdoteData): Promise<Anecdote> {
    const response = await api.put<ApiResponse<Anecdote>>(`/anecdotes/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/anecdotes/${id}`);
  },
};
