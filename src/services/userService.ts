import { api } from './api';
import { ApiResponse, PaginatedData } from '../types/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

// Dummy data
const INITIAL_USERS: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', lastLogin: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', lastLogin: '2024-01-14' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'user', status: 'inactive', lastLogin: '2024-01-10' },
];

let usersData = [...INITIAL_USERS];

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<ApiResponse<PaginatedData<User>>>('/users');
    return response.data.data.data;
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  async create(data: CreateUserData): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },

  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/users/${id}`);
  },
};
