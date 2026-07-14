import { api } from './api';

export interface ActivityLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  metadata: Record<string, any> | null;
  createdAt: string;
  userId: number;
  userName?: string;
  user?: { id: number; name: string };
}

interface ActivityLogApiResponse {
  status: number;
  message: string;
  success: boolean;
  data: ActivityLog[];
}

export const activityLogService = {
  async getAll(): Promise<ActivityLog[]> {
    const response = await api.get<ActivityLogApiResponse>('/logs');
    return response.data.data;
  },
};
