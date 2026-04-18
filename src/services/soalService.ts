import { api } from './api';
import { getFileUrl } from '@/lib/fileUrl';

function dataURLtoFile(dataurl: string, filename: string): File | null {
  const arr = dataurl.split(',');
  if (arr.length < 2) return null;
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const fullUrl = getFileUrl(url);
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error('Failed to fetch image');
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

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
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        formData.append(`questions[${i}][text]`, q.text || '');
        formData.append(`questions[${i}][imageSize]`, q.imageSize || 'medium');
        
        if (q.imageUrl instanceof File) {
          formData.append(`questions[${i}][imageUrl]`, q.imageUrl);
        } else if (typeof q.imageUrl === 'string') {
          if (q.imageUrl.startsWith('data:')) {
            const file = dataURLtoFile(q.imageUrl, `image_${i}.png`);
            if (file) formData.append(`questions[${i}][imageUrl]`, file);
          } else if (!q.imageUrl.startsWith('blob:')) {
            try {
              const file = await urlToFile(q.imageUrl, `image_${i}.png`);
              formData.append(`questions[${i}][imageUrl]`, file);
            } catch (e) {
              console.error("Failed to convert URL to file", e);
            }
          }
        }
      }
    }

    const response = await api.post<ApiResponse<Subject>>('/questions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async update(id: string | number, data: Subject): Promise<Subject> {
    const formData = new FormData();
    
    formData.append('section', data.section);
    
    if (data.questions) {
      for (let i = 0; i < data.questions.length; i++) {
        const q = data.questions[i];
        formData.append(`questions[${i}][id]`, String(q.id));
        formData.append(`questions[${i}][text]`, q.text || '');
        formData.append(`questions[${i}][imageSize]`, q.imageSize || 'medium');
        
        if (q.imageUrl instanceof File) {
          formData.append(`questions[${i}][imageUrl]`, q.imageUrl);
        } else if (typeof q.imageUrl === 'string') {
          if (q.imageUrl.startsWith('data:')) {
            const file = dataURLtoFile(q.imageUrl, `image_${i}.png`);
            if (file) formData.append(`questions[${i}][imageUrl]`, file);
          } else if (!q.imageUrl.startsWith('blob:')) {
            try {
              const file = await urlToFile(q.imageUrl, `image_${i}.png`);
              formData.append(`questions[${i}][imageUrl]`, file);
            } catch (e) {
              console.error("Failed to convert URL to file", e);
            }
          }
        }
      }
    }

    const response = await api.put<ApiResponse<Subject>>(`/questions/sections/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async delete(id: string | number): Promise<void> {
    await api.delete<void>(`/questions/${id}`);
  }
};
