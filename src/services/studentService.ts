import { api } from './api';
import { ApiResponse, PaginatedData } from '../types/api';

export interface Student {
  id: string;
  name: string;
  nisn: string;
  birthDate: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  address: string;
  class: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: string;
}

export interface CreateStudentData {
  name: string;
  nisn: string;
  birthDate: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  address: string;
  class: string;
  status: 'active' | 'inactive' | 'graduated';
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}

export const studentService = {
  async getAll(): Promise<Student[]> {
    const response = await api.get<ApiResponse<PaginatedData<Student>>>('/students');
    return response.data.data.data;
  },

  async getById(id: string): Promise<Student> {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data;
  },

  async create(data: CreateStudentData): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>('/students', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateStudentData): Promise<Student> {
    const response = await api.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/students/${id}`);
  },
};
