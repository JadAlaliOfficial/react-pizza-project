// useInputRules.ts

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store'; // Adjust path as needed
import {
  fetchInputRulesThunk,
  selectInputRules,
  selectInputRulesLoading,
  selectInputRulesError,
  selectHasInputRules,
} from '../store/inputRulesSlice';
import { type InputRule } from '../types';

/**
 * Return type for the useInputRules hook
 */
interface UseInputRulesReturn {
  items: InputRule[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for managing input rules
 * 
 * Auto-fetches on mount if data not already loaded
 * Exposes items, loading state, error, and refetch function
 */
export const useInputRules = (): UseInputRulesReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux store
  const items = useSelector(selectInputRules);
  const loading = useSelector(selectInputRulesLoading);
  const error = useSelector(selectInputRulesError);
  const hasData = useSelector(selectHasInputRules);

  /**
   * Memoized refetch function to manually trigger data fetch
   * useCallback prevents unnecessary re-renders
   */
  const refetch = useCallback(() => {
    dispatch(fetchInputRulesThunk());
  }, [dispatch]);

  /**
   * Auto-fetch on mount only if data hasn't been loaded
   * This prevents refetch loops and unnecessary API calls
   */
  useEffect(() => {
    if (!hasData && !loading) {
      dispatch(fetchInputRulesThunk());
    }
  }, [dispatch, hasData, loading]);

  return {
    items,
    loading,
    error,
    refetch,
  };
};
