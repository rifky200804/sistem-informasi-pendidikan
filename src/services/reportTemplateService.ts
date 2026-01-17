import { api } from './api';
import { 
  ReportTemplate, 
  ReportTemplateResponse, 
  CreateReportTemplateData, 
  UpdateReportTemplateData 
} from '@/types/reportTemplate';

export const reportTemplateService = {
  async getAll(): Promise<ReportTemplate[]> {
    const response = await api.get<{ data: ReportTemplate[] }>('/report-templates');
    return response.data || [];
  },

  async getActive(): Promise<ReportTemplate | null> {
    try {
      const response = await api.get<ReportTemplateResponse>('/report-templates/active');
      if (response.success && response.data) {
        return {
          title: response.data.title,
          year: response.data.year,
          data: response.data.data
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching active template:', error);
      return null;
    }
  },

  async getById(id: string): Promise<ReportTemplate | null> {
    try {
      const response = await api.get<ReportTemplateResponse>(`/report-templates/${id}`);
      if (response.success && response.data) {
        return {
          id,
          title: response.data.title,
          year: response.data.year,
          data: response.data.data
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  async create(data: CreateReportTemplateData): Promise<ReportTemplate> {
    return api.post<ReportTemplate>('/report-templates', data);
  },

  async update(id: string, data: UpdateReportTemplateData): Promise<ReportTemplate> {
    return api.put<ReportTemplate>(`/report-templates/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete<void>(`/report-templates/${id}`);
  },

  async setActive(id: string): Promise<void> {
    return api.put<void>(`/report-templates/${id}/activate`, {});
  },
};

export type { ReportTemplate, CreateReportTemplateData, UpdateReportTemplateData };
