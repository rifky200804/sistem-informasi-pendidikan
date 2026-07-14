import { api } from './api';
import { ApiResponse, PaginatedData, PaginatedResult, SelectOption } from '../types/api';

export interface Student {
  id: number;
  name: string;
  identifier: string;
  nisn: string;
  className: string;
  tahunAjaran: string;
  parentName: string;
  parentPhone: string;
  address: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  name: string;
  identifier: string;
  nisn: string;
  className: string;
  tahunAjaran: string;
  parentName: string;
  parentPhone: string;
  address: string;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}

export const studentService = {
  async getAll(page = 1, pageSize = 10, className?: string, search?: string): Promise<PaginatedResult<Student>> {
    const response = await api.get<ApiResponse<PaginatedData<Student>>>('/students', {
      params: { page, pageSize, className, search }
    });
    return response.data.data;
  },

  async getById(id: number): Promise<Student> {
    const response = await api.get<ApiResponse<Student>>(`/students/${id}`);
    return response.data.data;
  },

  async create(data: CreateStudentData): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>('/students', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateStudentData): Promise<Student> {
    const response = await api.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/students/${id}`);
  },

  async getOptions(className?: string): Promise<SelectOption[]> {
    const response = await api.get<ApiResponse<SelectOption[]>>('/students/options', {
      params: { className }
    });
    return response.data?.data || [];
  },

  async download(params?: { className?: string; search?: string; tahunAjaran?: string }): Promise<void> {
    const response = await api.get('/students/download', {
      params,
      responseType: 'blob',
    });
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n;]*)\1/);
    const filename = filenameMatch ? filenameMatch[2].trim() : 'data-murid.xlsx';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
