import { api } from './api';

export interface AnalyticsData {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  averageScore: number;
  trends: {
    date: string;
    audits: number;
    score: number;
  }[];
}

export const analyticsService = {
  async getAnalytics(startDate?: string, endDate?: string): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = `/analytics${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<AnalyticsData>(endpoint);
    return response.data;
  },

  async exportAnalytics(format: 'csv' | 'pdf'): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/analytics/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Gagal export analytics');
    }
    
    return response.blob();
  },
};
