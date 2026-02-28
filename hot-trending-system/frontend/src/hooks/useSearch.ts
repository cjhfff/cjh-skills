import { useState, useCallback, useRef } from 'react';
import { api } from '../api';
import type { SmartSearchResponse, SearchParams } from '../api';

interface UseSearchState {
  results: SmartSearchResponse | null;
  loading: boolean;
  error: string | null;
  cached: boolean;
}

export function useSearch() {
  const [state, setState] = useState<UseSearchState>({
    results: null,
    loading: false,
    error: null,
    cached: false,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (params: SearchParams) => {
    // 清除之前的 debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 使用 debounce 避免频繁请求
    debounceRef.current = setTimeout(async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await api.search(params);
        
        if (response.success) {
          setState({
            results: response.data,
            loading: false,
            error: null,
            cached: response.cached || false,
          });
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Search failed',
          }));
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'An error occurred';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errMsg,
        }));
      }
    }, 300); // 300ms debounce
  }, []);

  const clear = useCallback(() => {
    setState({
      results: null,
      loading: false,
      error: null,
      cached: false,
    });
  }, []);

  return { ...state, search, clear };
}
