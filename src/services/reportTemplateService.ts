import { api } from './api';
import { 
  ReportTemplate, 
  ReportTemplateResponse, 
  CreateReportTemplateData, 
  UpdateReportTemplateData 
} from '@/types/reportTemplate';

export const reportTemplateService = {
  async getAll(): Promise<ReportTemplate[]> {
    try {
      // The user specified the GET endpoint is /rapor/templates/active
      // So we fetch the active template and return it as an array
      const response = await api.get<ReportTemplateResponse>('/rapor/templates/active');
      if (response.data && response.data.success && response.data.data) {
        return [{
          id: response.data.data.title + response.data.data.year, // temporary id if none provided
          title: response.data.data.title,
          year: response.data.data.year,
          data: response.data.data.data,
          isActive: true
        }];
      }
      return [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  async getActive(): Promise<ReportTemplate | null> {
    try {
      const response = await api.get<ReportTemplateResponse>('/rapor/templates/active');
      if (response.data.success && response.data.data) {
        return {
          title: response.data.data.title,
          year: response.data.data.year,
          data: response.data.data.data
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
      const response = await api.get<ReportTemplateResponse>(`/rapor/templates/${id}`);
      if (response.data.success && response.data.data) {
        return {
          id,
          title: response.data.data.title,
          year: response.data.data.year,
          data: response.data.data.data
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  async create(data: CreateReportTemplateData): Promise<ReportTemplate> {
    const response = await api.post<ReportTemplateResponse>('/rapor/templates', data);
    return {
      title: response.data.data?.title || data.title,
      year: response.data.data?.year || data.year,
      data: response.data.data?.data || data.data
    };
  },

  async update(id: string, data: UpdateReportTemplateData): Promise<ReportTemplate> {
    // If the backend doesn't support specific ID updates and just uses the general post to update/re-create:
    // User requested to use POST instead of PUT for /api/rapor/templates
    const response = await api.post<ReportTemplateResponse>(`/rapor/templates`, data);
    return {
      id,
      title: response.data.data?.title || data.title || '',
      year: response.data.data?.year || data.year || new Date().getFullYear(),
      data: response.data.data?.data || data.data || []
    };
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/rapor/templates/${id}`);
  },

  async setActive(id: string): Promise<void> {
    await api.put<void>(`/rapor/templates/${id}/activate`, {});
  },
};

export type { ReportTemplate, CreateReportTemplateData, UpdateReportTemplateData };
