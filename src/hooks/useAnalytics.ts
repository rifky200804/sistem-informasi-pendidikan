import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';
import { toast } from '@/hooks/use-toast';

export function useAnalytics(startDate?: string, endDate?: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsData = await analyticsService.getAnalytics(startDate, endDate);
      setData(analyticsData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: 'Gagal memuat data analytics',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async (format: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      const blob = await analyticsService.exportAnalytics(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Export berhasil',
        description: `Data analytics telah diexport ke ${format.toUpperCase()}.`,
      });
    } catch (err) {
      const error = err as Error;
      toast({
        title: 'Export gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  return {
    data,
    loading,
    error,
    fetchAnalytics,
    exportAnalytics,
  };
}
