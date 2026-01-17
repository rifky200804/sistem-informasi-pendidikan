import { useState, useEffect } from 'react';
import { settingsService, UserSettings, ProfileData } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal memuat pengaturan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedSettings = await settingsService.updateSettings(newSettings);
      setSettings(updatedSettings);
      toast({
        title: 'Pengaturan berhasil disimpan',
        description: 'Perubahan Anda telah disimpan.',
      });
      return updatedSettings;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal menyimpan pengaturan',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: ProfileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await settingsService.updateProfile(data);
      toast({
        title: 'Profil berhasil diupdate',
        description: 'Data profil Anda telah diperbarui.',
      });
      return updatedProfile;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal mengupdate profil',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await settingsService.changePassword(oldPassword, newPassword);
      toast({
        title: 'Password berhasil diubah',
        description: 'Password Anda telah diperbarui.',
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal mengubah password',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateProfile,
    changePassword,
  };
}
