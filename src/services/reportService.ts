import { api } from './api';

export interface Report {
  id: string;
  title: string;
  type: string;
  generatedBy: string;
  date: string;
  status: string;
}

export interface CreateReportData {
  title: string;
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Dummy data
const INITIAL_REPORTS: Report[] = [
  { id: '1', title: 'Monthly Audit Report', type: 'audit', generatedBy: 'Admin', date: '2024-01-15', status: 'completed' },
  { id: '2', title: 'Performance Report', type: 'performance', generatedBy: 'Manager', date: '2024-01-14', status: 'completed' },
  { id: '3', title: 'Quality Trends', type: 'quality', generatedBy: 'Admin', date: '2024-01-13', status: 'pending' },
];

let reportsData = [...INITIAL_REPORTS];

export const reportService = {
  async getAll(): Promise<Report[]> {
    const response = await api.get<Report[]>('/reports');
    return response.data;
  },

  async getById(id: string): Promise<Report> {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  async create(data: CreateReportData): Promise<Report> {
    const response = await api.post<Report>('/reports', data);
    return response.data;
  },

  async download(id: string, format: 'pdf' | 'csv'): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/${id}/download?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Gagal mendownload report');
    }
    
    return response.blob();
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/reports/${id}`);
  },
};
