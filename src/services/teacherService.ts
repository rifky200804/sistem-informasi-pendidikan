import { api } from './api';
import { ApiResponse, PaginatedData, PaginatedResult, SelectOption } from '../types/api';
import { User } from './userService'; // Import User type for mapping if needed, or just map locally

export type TeacherRole = 'ADMIN' | 'KEPALA_SEKOLAH' | 'GURU';

export interface Teacher {
  id: number;
  name: string;
  email: string;
  role: TeacherRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  role: TeacherRole;
  password?: string;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {}

export const teacherService = {
  async getAll(page = 1, pageSize = 10, search?: string): Promise<PaginatedResult<Teacher>> {
    const response = await api.get<ApiResponse<PaginatedData<Teacher>>>('/users', {
      params: { page, pageSize, search }
    });
    return response.data.data;
  },

  async getById(id: number): Promise<Teacher> {
    const response = await api.get<ApiResponse<Teacher>>(`/users/${id}`);
    return response.data.data;
  },

  async create(data: CreateTeacherData): Promise<Teacher> {
    const response = await api.post<ApiResponse<Teacher>>('/users', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateTeacherData): Promise<Teacher> {
    const response = await api.put<ApiResponse<Teacher>>(`/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/users/${id}`);
  },

  async getTeacherOptions(): Promise<SelectOption[]> {
    const response = await api.get<ApiResponse<SelectOption[]>>('/users/options/teachers');
    return response.data?.data || [];
  },
};
