import { api } from './api';

export interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  semester: '1' | '2';
  academicYear: string;
  aspects: {
    kognitif: number;
    motorik: number;
    sosialEmosional: number;
    bahasa: number;
    seni: number;
    agama: number;
  };
  notes: string;
  teacherNotes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgressReportData {
  studentId: string;
  semester: '1' | '2';
  academicYear: string;
  aspects: {
    kognitif: number;
    motorik: number;
    sosialEmosional: number;
    bahasa: number;
    seni: number;
    agama: number;
  };
  notes: string;
  teacherNotes: string;
}

export interface UpdateProgressReportData extends Partial<CreateProgressReportData> {}

export const progressReportService = {
  async getAll(): Promise<ProgressReport[]> {
    const response = await api.get<ProgressReport[]>('/progress-reports');
    return response.data;
  },

  async getById(id: string): Promise<ProgressReport> {
    const response = await api.get<ProgressReport>(`/progress-reports/${id}`);
    return response.data;
  },

  async getByStudentId(studentId: string): Promise<ProgressReport[]> {
    const response = await api.get<ProgressReport[]>(`/progress-reports/student/${studentId}`);
    return response.data;
  },

  async create(data: CreateProgressReportData): Promise<ProgressReport> {
    const response = await api.post<ProgressReport>('/progress-reports', data);
    return response.data;
  },

  async update(id: string, data: UpdateProgressReportData): Promise<ProgressReport> {
    const response = await api.put<ProgressReport>(`/progress-reports/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/progress-reports/${id}`);
  },

  async generatePDF(id: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/progress-reports/${id}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Gagal generate PDF');
    }
    
    return response.blob();
  },
};
