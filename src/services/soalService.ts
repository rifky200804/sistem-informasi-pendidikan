import { api } from './api';

export interface Question {
  id: string | number;
  text: string;
  imageUrl: string | File | null;
  imageSize?: "small" | "medium" | "large" | "full";
}

export interface Subject {
  id: string | number;
  section: string;
  totalQuestions?: number;
  questions?: Question[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const soalService = {
  async getAll(): Promise<Subject[]> {
    const response = await api.get<ApiResponse<Subject[]>>('/questions/sections');
    return response.data.data;
  },

  async getById(id: string | number): Promise<Subject> {
    const response = await api.get<ApiResponse<Subject>>(`/questions/sections/${id}`);
    return response.data.data;
  },

  async create(data: Partial<Subject>): Promise<Subject> {
    const formData = new FormData();
    
    if (data.section) formData.append('section', data.section);
    
    if (data.questions) {
      data.questions.forEach((q, index) => {
        formData.append(`questions[${index}][text]`, q.text || '');
        formData.append(`questions[${index}][imageSize]`, q.imageSize || 'medium');
        if (q.imageUrl instanceof File) {
          formData.append(`questions[${index}][imageUrl]`, q.imageUrl);
        } else if (typeof q.imageUrl === 'string' && !q.imageUrl.startsWith('blob:') && !q.imageUrl.startsWith('data:')) {
          formData.append(`questions[${index}][imageUrl]`, q.imageUrl);
        }
      });
    }

    const response = await api.post<ApiResponse<Subject>>('/questions/', formData);
    return response.data.data;
  },

  async update(id: string | number, data: Subject): Promise<Subject> {
    const formData = new FormData();
    
    formData.append('section', data.section);
    
    if (data.questions) {
      data.questions.forEach((q, index) => {
        formData.append(`questions[${index}][id]`, String(q.id));
        formData.append(`questions[${index}][text]`, q.text || '');
        formData.append(`questions[${index}][imageSize]`, q.imageSize || 'medium');
        if (q.imageUrl instanceof File) {
          formData.append(`questions[${index}][imageUrl]`, q.imageUrl);
        } else if (typeof q.imageUrl === 'string' && !q.imageUrl.startsWith('blob:') && !q.imageUrl.startsWith('data:')) {
          formData.append(`questions[${index}][imageUrl]`, q.imageUrl);
        }
      });
    }

    const response = await api.put<ApiResponse<Subject>>(`/questions/sections/${id}`, formData);
    return response.data.data;
  },

  async delete(id: string | number): Promise<void> {
    await api.delete<void>(`/questions/${id}`);
  }
};
