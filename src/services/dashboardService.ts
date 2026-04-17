import { api } from './api';
import { ApiResponse } from '../types/api';

export interface LatestAnecdote {
  id: number;
  content: string;
  description: string | null;
  category: string | null;
  date: string;
  createdAt: string;
  teacherId: number;
  teacher: {
    id: number;
    name: string;
  };
}

export interface DashboardStats {
  studentsCount: number;
  reportsCount: number;
  documentsCount: number;
  anecdotesCountTotal: number;
  guruCount: number;
  latestAnecdotes: LatestAnecdote[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>('/summary');
    return response.data.data;
  },
};
