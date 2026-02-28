import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { HistoryItem, Stats } from '../api';

interface UseHistoryState {
  history: HistoryItem[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
}

export function useHistory() {
  const [state, setState] = useState<UseHistoryState>({
    history: [],
    stats: null,
    loading: false,
    error: null,
  });

  const fetchHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [historyRes, statsRes] = await Promise.all([
        api.getHistory(),
        api.getStats(),
      ]);

      if (historyRes.success && statsRes.success) {
        setState({
          history: historyRes.data,
          stats: statsRes.data,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch history',
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An error occurred',
      }));
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { ...state, refetch: fetchHistory };
}
