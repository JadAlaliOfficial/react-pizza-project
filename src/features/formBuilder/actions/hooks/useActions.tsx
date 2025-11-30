// features/actions/useActions.ts

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks'; // Typed hooks
import {
  fetchActionsThunk,
  selectActions,
  selectActionsStatus,
  selectActionsError,
  selectActionsLastFetched,
  clearError,
} from '../store/actionsSlice';
import { type Action } from '../types';

/**
 * Configuration options for the useActions hook.
 */
export interface UseActionsOptions {
  /**
   * If true, automatically fetch actions on mount (if not already loaded/loading).
   * Default: false
   */
  autoFetch?: boolean;

  /**
   * Time in milliseconds to consider cached data stale.
   * If data is older than this, refetch will fetch fresh data.
   * Default: 5 minutes (300000ms)
   */
  staleTime?: number;

  /**
   * If true, force fetch even if data exists and is fresh.
   * Useful for manual refresh scenarios.
   * Default: false
   */
  forceFetch?: boolean;
}

/**
 * Return type of the useActions hook.
 */
export interface UseActionsReturn {
  actions: Action[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: (force?: boolean) => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for consuming actions state and operations.
 *
 * Features:
 * - Selects typed actions, status, and error from Redux
 * - Optional auto-fetch on mount with staleness check
 * - Exposes refetch() with force option
 * - Avoids redundant API calls unless stale or forced
 * - Provides convenient boolean flags (isLoading, isError, isSuccess)
 *
 * @param options - Configuration options
 * @returns Typed actions state and refetch methods
 *
 * @example
 * // Auto-fetch on mount:
 * const { actions, isLoading, refetch } = useActions({ autoFetch: true });
 *
 * @example
 * // Manual fetch only:
 * const { actions, refetch } = useActions();
 * useEffect(() => { refetch(); }, []);
 */
export function useActions(options: UseActionsOptions = {}): UseActionsReturn {
  const {
    autoFetch = false,
    staleTime = 300000, // 5 minutes default
    forceFetch = false,
  } = options;

  const dispatch = useAppDispatch();

  // Select state from Redux
  const actions = useAppSelector(selectActions);
  const status = useAppSelector(selectActionsStatus);
  const error = useAppSelector(selectActionsError);
  const lastFetched = useAppSelector(selectActionsLastFetched);

  // Derived boolean flags for convenience
  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isSuccess = status === 'succeeded';

  /**
   * Check if cached data is stale based on lastFetched timestamp.
   */
  const isStale = useCallback((): boolean => {
    if (!lastFetched) return true; // No data fetched yet
    const age = Date.now() - lastFetched;
    return age > staleTime;
  }, [lastFetched, staleTime]);

  /**
   * Refetch actions from the API.
   * - Skips if already loading (prevents duplicate requests)
   * - Skips if data is fresh unless `force` is true
   *
   * @param force - If true, bypass staleness check and fetch
   */
  const refetch = useCallback(
    async (force = false) => {
      // Prevent duplicate calls if already loading
      if (status === 'loading') {
        return;
      }

      // Skip if data is fresh and not forced
      if (!force && !isStale() && status === 'succeeded') {
        return;
      }

      await dispatch(fetchActionsThunk()).unwrap();
    },
    [dispatch, status, isStale]
  );

  /**
   * Clear error state (useful for dismissing error banners).
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Auto-fetch on mount if enabled and data is stale/missing.
   */
  useEffect(() => {
    if (autoFetch || forceFetch) {
      refetch(forceFetch);
    }
    // Run only on mount or when forceFetch/autoFetch changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, forceFetch]);

  return {
    actions,
    status,
    error,
    isLoading,
    isError,
    isSuccess,
    refetch,
    clearError: handleClearError,
  };
}

/**
 * -----------------------------------------------------------
 * Typed Redux hooks (if not already defined elsewhere):
 * Place these in @/store/hooks.ts or similar.
 * -----------------------------------------------------------
 */

/*
// store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
*/
