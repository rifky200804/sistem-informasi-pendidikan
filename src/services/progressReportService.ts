import { api } from './api';

export interface ProgressReportListItem {
  id: number;
  studentId: number;
  templateId: number;
  year: number;
  tahun_ajaran?: string;
  semester: string;
  student: {
    id: number;
    name: string;
    identifier: string;
    nisn: string;
    className: string;
    tahunAjaran: string;
  };
  template: {
    id: number;
    title: string;
    year: number;
    isActive: boolean;
  };
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
  _count: {
    answers: number;
  };
}

export interface ProgressReportDetail {
  title: string;
  year: number;
  tahun_ajaran?: string;
  semester: string;
  studentId: number;
  templateId: number;
  data: {
    Section: string;
    type: string;
    Questions: {
      Question: string;
      answers: string[];
      answer: string;
      Ket: string;
      photo: string;
      photos?: string[];
      predikat: string;
    }[];
  }[];
}

export interface CreateProgressReportData {
  studentId: number;
  templateId?: number;
  year?: number;
  tahun_ajaran?: string;
  semester: string;
  data: any[];
}

export interface UpdateProgressReportData extends Partial<CreateProgressReportData> {}

export interface ApiResponse<T> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

async function buildReportFormData(data: any): Promise<FormData> {
  const fd = new FormData();
  if (data.studentId !== undefined) fd.append('studentId', String(data.studentId));
  if (data.templateId !== undefined) fd.append('templateId', String(data.templateId));
  if (data.year !== undefined) fd.append('year', String(data.year));
  if (data.tahun_ajaran) fd.append('tahun_ajaran', data.tahun_ajaran);
  if (data.semester) fd.append('semester', data.semester);
  
  if (data.data) {
    for (let i = 0; i < data.data.length; i++) {
      const section = data.data[i];
      fd.append(`data[${i}][Section]`, section.Section || '');
      if (section.Questions) {
        for (let j = 0; j < section.Questions.length; j++) {
          const q = section.Questions[j];
          if (q.Question !== undefined) fd.append(`data[${i}][Questions][${j}][Question]`, q.Question);
          if (q.Ket !== undefined) fd.append(`data[${i}][Questions][${j}][Ket]`, q.Ket);
          if (q.predikat !== undefined) fd.append(`data[${i}][Questions][${j}][predikat]`, q.predikat);
          if (q.answer !== undefined) fd.append(`data[${i}][Questions][${j}][answer]`, q.answer);
          if (q.answers) {
             q.answers.forEach((ans: string, k: number) => {
               fd.append(`data[${i}][Questions][${j}][answers][${k}]`, ans);
             });
          }
          if (q.photo) {
             if (q.photo.startsWith('data:')) {
               const file = dataURLtoFile(q.photo, `photo_${i}_${j}.png`);
               if (file) fd.append(`data[${i}][Questions][${j}][photo]`, file);
             } else {
               try {
                 const VITE_API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.184:3000/api";
                 const fetchUrl = q.photo.startsWith('http') ? q.photo : `${VITE_API_URL.replace(/\/api$/, '')}${q.photo.startsWith('/') ? '' : '/'}${q.photo}`;
                 const res = await fetch(fetchUrl);
                 if (!res.ok) throw new Error();
                 const blob = await res.blob();
                 const file = new File([blob], `photo_${i}_${j}.png`, { type: blob.type || 'image/png' });
                 fd.append(`data[${i}][Questions][${j}][photo]`, file);
               } catch (e) {
                 fd.append(`data[${i}][Questions][${j}][photo]`, q.photo);
               }
             }
          }
          if (q.photos && Array.isArray(q.photos)) {
             for (let photoIdx = 0; photoIdx < q.photos.length; photoIdx++) {
               const photoUrl = q.photos[photoIdx];
               if (photoUrl.startsWith('data:')) {
                 const file = dataURLtoFile(photoUrl, `photo_${i}_${j}_${photoIdx}.png`);
                 if (file) fd.append(`data[${i}][Questions][${j}][photos][]`, file);
               } else {
                 try {
                   const VITE_API_URL = import.meta.env.VITE_API_URL || "http://192.168.1.184:3000/api";
                   const fetchUrl = photoUrl.startsWith('http') ? photoUrl : `${VITE_API_URL.replace(/\/api$/, '')}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
                   const res = await fetch(fetchUrl);
                   if (!res.ok) throw new Error();
                   const blob = await res.blob();
                   const file = new File([blob], `photo_${i}_${j}_${photoIdx}.png`, { type: blob.type || 'image/png' });
                   fd.append(`data[${i}][Questions][${j}][photos][]`, file);
                 } catch (e) {
                   fd.append(`data[${i}][Questions][${j}][photos][]`, photoUrl); 
                 }
               }
             }
          }
        }
      }
    }
  }
  return fd;
}

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

export const progressReportService = {
  async getAll(): Promise<ProgressReportListItem[]> {
    const response = await api.get<ApiResponse<ProgressReportListItem[]>>('/reports/student-reports');
    return response.data.data;
  },

  async getById(id: string): Promise<ProgressReportDetail> {
    const response = await api.get<ApiResponse<ProgressReportDetail>>(`/reports/student-reports/${id}`);
    return response.data.data;
  },

  async getByStudentId(studentId: string): Promise<ProgressReportListItem[]> {
    const response = await api.get<ApiResponse<ProgressReportListItem[]>>(`/reports/student-reports?studentId=${studentId}`);
    return response.data.data;
  },

  async create(data: CreateProgressReportData): Promise<any> {
    const formData = await buildReportFormData(data);
    const response = await api.post<ApiResponse<any>>('/reports/student-reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async update(id: string, data: UpdateProgressReportData): Promise<any> {
    const formData = await buildReportFormData(data);
    const response = await api.put<ApiResponse<any>>(`/reports/student-reports/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/reports/student-reports/${id}`);
  },

  async generatePDF(id: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/student-reports/${id}/pdf`, {
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
