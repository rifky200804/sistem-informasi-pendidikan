import { api } from './api';

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark';
    timezone: string;
  };
}

export interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
}

// Dummy data
let settingsData: UserSettings = {
  notifications: {
    email: true,
    push: false,
    sms: false,
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: true,
  },
  preferences: {
    language: 'id',
    theme: 'light',
    timezone: 'Asia/Jakarta',
  },
};

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettings>('/settings');
    return response.data;
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put<UserSettings>('/settings', settings);
    return response.data;
  },

  async updateProfile(data: ProfileData): Promise<ProfileData> {
    const response = await api.put<ProfileData>('/profile', data);
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post<void>('/auth/change-password', { oldPassword, newPassword });
  },
};
