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
    return api.get<UserSettings>('/settings');
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return api.put<UserSettings>('/settings', settings);
  },

  async updateProfile(data: ProfileData): Promise<ProfileData> {
    return api.put<ProfileData>('/profile', data);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return api.post<void>('/auth/change-password', { oldPassword, newPassword });
  },
};
