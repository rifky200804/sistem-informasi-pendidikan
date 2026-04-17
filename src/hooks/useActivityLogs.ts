import { useState, useEffect, useCallback } from 'react';
import { activityLogService, ActivityLog } from '@/services/activityLogService';
import { useToast } from '@/hooks/use-toast';

export const useActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityLogService.getAll();
      setLogs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data log aktivitas';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
  };
};
