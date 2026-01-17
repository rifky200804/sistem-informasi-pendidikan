import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  token?: string;
  skip?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !options.skip,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiService.get<T>(endpoint, { token: options.token });
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  };

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, [endpoint, options.skip]);

  return {
    ...state,
    refetch: fetchData,
  };
}

export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = async (variables?: TVariables) => {
    setState({ data: null, loading: true, error: null });
    try {
      let data: TData;
      if (method === 'POST') {
        data = await apiService.post<TData>(endpoint, variables, { token: options.token });
      } else if (method === 'PUT') {
        data = await apiService.put<TData>(endpoint, variables, { token: options.token });
      } else {
        data = await apiService.delete<TData>(endpoint, { token: options.token });
      }
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  };

  return {
    ...state,
    mutate,
  };
}
