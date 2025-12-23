/**
 * ================================
 * FORM STRUCTURE MODULE - Custom Hook
 * ================================
 * React hook for managing form structure data fetching and state.
 * - Fetches form structure on mount or when params change
 * - Supports manual refetch with force option
 * - Returns loading, error, and data states
 * - Handles cleanup with AbortController
 * - Prevents refetch loops with proper dependencies
 */

import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store'; // Adjust path to your store
import {
  fetchFormStructure,
  selectFormStructure,
  selectIsFormStructureLoading,
  selectIsFormStructureError,
  selectFormStructureError,
  selectFormStructureLastFetchedAt,
  fetchFormEntry,
  selectFormEntry,
  selectIsFormEntryLoading,
  selectIsFormEntryError,
  selectFormEntryError,
  selectFormEntryLastFetchedAt,
} from '../store/formStructure.slice';
import type { FormStructureData, FormEntryData, ApiError } from '../types/formStructure.types';

/**
 * Hook parameters
 */
export interface UseFormStructureParams {
  formVersionId: number;
  languageId: number;
  /**
   * If true, fetch immediately on mount even if data already exists
   * @default false
   */
  fetchOnMount?: boolean;
  /**
   * Cache duration in milliseconds. If data is older than this, refetch automatically.
   * Set to 0 to disable automatic refetch based on cache age.
   * @default 300000 (5 minutes)
   */
  cacheTime?: number;
}

/**
 * Hook return type
 */
export interface UseFormStructureReturn {
  data: FormStructureData | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: (force?: boolean) => Promise<void>;
}

/**
 * Custom hook to fetch and manage form structure state
 * 
 * @param params - Hook parameters including formVersionId and languageId
 * @returns Object containing data, loading state, error state, and refetch function
 * 
 * @example
 * ```
 * const { data, isLoading, isError, error, refetch } = useFormStructure({
 *   formVersionId: 15,
 *   languageId: 2,
 * });
 * 
 * // Manual refetch
 * const handleRefresh = () => {
 *   refetch(true); // force = true bypasses cache
 * };
 * ```
 */
export const useFormStructure = ({
  formVersionId,
  languageId,
  fetchOnMount = false,
  cacheTime = 300000, // 5 minutes default
}: UseFormStructureParams): UseFormStructureReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux store
  const data = useSelector(selectFormStructure);
  const isLoading = useSelector(selectIsFormStructureLoading);
  const isError = useSelector(selectIsFormStructureError);
  const error = useSelector(selectFormStructureError);
  const lastFetchedAt = useSelector(selectFormStructureLastFetchedAt);

  // Ref to track if initial fetch has been triggered
  const hasFetchedRef = useRef(false);
  // Ref to store the AbortController for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Check if cached data is stale based on cacheTime
   */
  const isCacheStale = useCallback((): boolean => {
    if (cacheTime === 0) return false; // Cache never stale if cacheTime is 0
    if (!lastFetchedAt) return true; // No data fetched yet
    
    const now = Date.now();
    const age = now - lastFetchedAt;
    return age > cacheTime;
  }, [lastFetchedAt, cacheTime]);

  /**
   * Fetch form structure data
   * @param force - If true, fetch regardless of cache state
   */
  const fetchData = useCallback(
    async (force: boolean = false) => {
      // Validate parameters
      if (!formVersionId || formVersionId <= 0) {
        console.warn('[useFormStructure] Invalid formVersionId:', formVersionId);
        return;
      }

      if (!languageId || languageId <= 0) {
        console.warn('[useFormStructure] Invalid languageId:', languageId);
        return;
      }

      // Skip fetch if data exists, cache is fresh, and not forced
      if (!force && data && !isCacheStale()) {
        console.debug('[useFormStructure] Using cached data, skipping fetch');
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      console.debug('[useFormStructure] Fetching form structure:', {
        formVersionId,
        languageId,
        force,
      });

      try {
        await dispatch(
          fetchFormStructure({
            formVersionId,
            languageId,
            signal: abortController.signal,
          })
        ).unwrap();

        console.debug('[useFormStructure] Fetch completed successfully');
      } catch (err: any) {
        // Don't log error for aborted requests
        const isCancelled =
          err?.name === 'AbortError' ||
          err?.name === 'CanceledError' ||
          err?.status === 0 ||
          err?.message === 'Request was cancelled';
        if (!isCancelled) {
          console.error('[useFormStructure] Fetch error:', err);
        }
      }
    },
    [dispatch, formVersionId, languageId, data, isCacheStale]
  );

  /**
   * Refetch function exposed to consumers
   * @param force - If true, bypass cache and fetch fresh data
   */
  const refetch = useCallback(
    async (force: boolean = false) => {
      console.debug('[useFormStructure] Manual refetch triggered:', { force });
      await fetchData(force);
    },
    [fetchData]
  );

  /**
   * Effect: Fetch data on mount or when parameters change
   * Uses proper dependency array to avoid infinite loops
   */
  useEffect(() => {
    // Determine if we should fetch
    const shouldFetch =
      !hasFetchedRef.current || // First mount
      fetchOnMount || // Explicitly requested on mount
      isCacheStale(); // Cache is stale

    if (shouldFetch) {
      console.debug('[useFormStructure] Initial fetch triggered');
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [fetchData, fetchOnMount, isCacheStale]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

// ============================================================================
// FORM ENTRY HOOK
// ============================================================================

/**
 * Hook parameters for fetching form entry
 */
export interface UseFormEntryParams {
  publicIdentifier: string;
  languageId: number;
  /**
   * If true, fetch immediately on mount even if data already exists
   * @default false
   */
  fetchOnMount?: boolean;
  /**
   * Cache duration in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTime?: number;
}

/**
 * Hook return type for form entry
 */
export interface UseFormEntryReturn {
  data: FormEntryData | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: (force?: boolean) => Promise<void>;
}

/**
 * Custom hook to fetch and manage form entry state
 * 
 * @param params - Hook parameters including publicIdentifier and languageId
 * @returns Object containing data, loading state, error state, and refetch function
 */
export const useFormEntry = ({
  publicIdentifier,
  languageId,
  fetchOnMount = false,
  cacheTime = 300000,
}: UseFormEntryParams): UseFormEntryReturn => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux store
  const data = useSelector(selectFormEntry);
  const isLoading = useSelector(selectIsFormEntryLoading);
  const isError = useSelector(selectIsFormEntryError);
  const error = useSelector(selectFormEntryError);
  const lastFetchedAt = useSelector(selectFormEntryLastFetchedAt);

  // Ref to track if initial fetch has been triggered
  const hasFetchedRef = useRef(false);
  // Ref to store the AbortController for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Check if cached data is stale
   */
  const isCacheStale = useCallback((): boolean => {
    if (cacheTime === 0) return false;
    if (!lastFetchedAt) return true;
    
    const now = Date.now();
    const age = now - lastFetchedAt;
    return age > cacheTime;
  }, [lastFetchedAt, cacheTime]);

  /**
   * Fetch form entry data
   */
  const fetchData = useCallback(
    async (force: boolean = false) => {
      // Validate parameters
      if (!publicIdentifier) {
        console.warn('[useFormEntry] Invalid publicIdentifier');
        return;
      }

      if (!languageId || languageId <= 0) {
        console.warn('[useFormEntry] Invalid languageId:', languageId);
        return;
      }

      // Skip fetch if data exists, cache is fresh, and not forced
      if (!force && data && !isCacheStale()) {
        console.debug('[useFormEntry] Using cached data, skipping fetch');
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      console.debug('[useFormEntry] Fetching form entry:', {
        publicIdentifier,
        languageId,
        force,
      });

      try {
        await dispatch(
          fetchFormEntry({
            publicIdentifier,
            languageId,
            signal: abortController.signal,
          })
        ).unwrap();

        console.debug('[useFormEntry] Fetch completed successfully');
      } catch (err: any) {
        const isCancelled =
          err?.name === 'AbortError' ||
          err?.name === 'CanceledError' ||
          err?.status === 0 ||
          err?.message === 'Request was cancelled';
        if (!isCancelled) {
          console.error('[useFormEntry] Fetch error:', err);
        }
      }
    },
    [dispatch, publicIdentifier, languageId, data, isCacheStale]
  );

  /**
   * Refetch function exposed to consumers
   */
  const refetch = useCallback(
    async (force: boolean = false) => {
      console.debug('[useFormEntry] Manual refetch triggered:', { force });
      await fetchData(force);
    },
    [fetchData]
  );

  /**
   * Effect: Fetch data on mount or when parameters change
   */
  useEffect(() => {
    const shouldFetch =
      !hasFetchedRef.current ||
      fetchOnMount ||
      isCacheStale();

    if (shouldFetch) {
      console.debug('[useFormEntry] Initial fetch triggered');
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [fetchData, fetchOnMount, isCacheStale]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  };
};

/**
 * Export as default for convenience
 */
export default useFormStructure;
