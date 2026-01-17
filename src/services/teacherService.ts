import { api } from './api';
import { ApiResponse, PaginatedData } from '../types/api';
import { User } from './userService'; // Import User type for mapping if needed, or just map locally

export type TeacherRole = 'ADMIN' | 'KEPALA SEKOLAH' | 'GURU';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  role: TeacherRole;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CreateTeacherData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  role: TeacherRole;
  password?: string;
  status: 'active' | 'inactive';
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {}

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    const response = await api.get<ApiResponse<PaginatedData<any>>>('/users'); // Using any to allow mapping to Teacher
    // Map User to Teacher structure
    return response.data.data.data.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-', // Fallback if missing
      subject: user.subject || '-', // Fallback if missing
      role: (user.role as TeacherRole) || 'GURU',
      status: user.status === 'active' ? 'active' : 'inactive',
      createdAt: user.createdAt || new Date().toISOString(),
    }));
  },

  async getById(id: string): Promise<Teacher> {
    const response = await api.get<ApiResponse<any>>(`/users/${id}`);
    const user = response.data.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      subject: user.subject || '-',
      role: (user.role as TeacherRole) || 'GURU',
      status: user.status === 'active' ? 'active' : 'inactive',
      createdAt: user.createdAt || new Date().toISOString(),
    };
  },

  async create(data: CreateTeacherData): Promise<Teacher> {
    // Map CreateTeacherData to CreateUserData if needed, or just pass data as is if compatible
    const response = await api.post<ApiResponse<any>>('/users', {
      ...data,
      role: data.role || 'GURU' // Ensure role is set
    });
    const user = response.data.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      subject: user.subject || '-',
      role: (user.role as TeacherRole) || 'GURU',
      status: user.status === 'active' ? 'active' : 'inactive',
      createdAt: user.createdAt || new Date().toISOString(),
    };
  },

  async update(id: string, data: UpdateTeacherData): Promise<Teacher> {
    const response = await api.put<ApiResponse<any>>(`/users/${id}`, data);
    const user = response.data.data;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      subject: user.subject || '-',
      role: (user.role as TeacherRole) || 'GURU',
      status: user.status === 'active' ? 'active' : 'inactive',
      createdAt: user.createdAt || new Date().toISOString(),
    };
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/users/${id}`);
  },
};
