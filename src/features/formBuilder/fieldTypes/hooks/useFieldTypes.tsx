/**
 * Custom React hook for Field Types
 * 
 * This hook provides a clean, reusable interface for components to access
 * field types data from Redux store and trigger fetch operations.
 * 
 * Features:
 * - Type-safe data access using typed Redux hooks
 * - Automatic cache staleness detection
 * - Prevent duplicate fetches with smart loading checks
 * - Safe for React 18 Strict Mode (no double-fetch issues)
 * - Detailed logging for debugging
 * 
 * Usage:
 * ```
 * const { fieldTypes, loading, error, refetch, ensureLoaded } = useFieldTypes();
 * 
 * useEffect(() => {
 *   ensureLoaded(); // Fetch only if needed
 * }, [ensureLoaded]);
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchFieldTypesThunk,
  selectFieldTypes,
  selectFieldTypesLoading,
  selectFieldTypesError,
  selectFieldTypesLastFetched,
  selectIsFieldTypesLoading,
  selectFieldTypesCount,
} from '../store/fieldTypesSlice';
import type { FieldType } from '../types';

/**
 * Configuration options for the useFieldTypes hook
 */
interface UseFieldTypesOptions {
  /**
   * Maximum age of cached data in milliseconds before it's considered stale
   * @default 300000 (5 minutes)
   */
  maxCacheAge?: number;

  /**
   * Whether to automatically fetch data on mount if cache is stale
   * @default false
   */
  autoFetch?: boolean;
}

/**
 * Return type for the useFieldTypes hook
 */
interface UseFieldTypesResult {
  /**
   * Array of all field types
   */
  fieldTypes: FieldType[];

  /**
   * Current loading state: 'idle' | 'pending' | 'succeeded' | 'failed'
   */
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';

  /**
   * User-friendly error message (null if no error)
   */
  error: string | null;

  /**
   * Whether data is currently being fetched
   */
  isLoading: boolean;

  /**
   * Number of field types in the store
   */
  count: number;

  /**
   * Unix timestamp (ms) of when data was last fetched
   */
  lastFetched: number | null;

  /**
   * Whether the cached data is stale based on maxCacheAge
   */
  isCacheStale: boolean;

  /**
   * Manually trigger a fetch (always fetches, regardless of cache)
   * Returns a promise that resolves when fetch completes
   */
  refetch: () => Promise<void>;

  /**
   * Intelligently fetch data only if cache is stale or no data exists
   * Safe to call multiple times - won't cause duplicate requests
   * Returns a promise that resolves when fetch completes (or immediately if not needed)
   */
  ensureLoaded: () => Promise<void>;
}

/**
 * Custom hook for accessing and managing field types data
 * 
 * This hook encapsulates all field types logic including:
 * - Redux state access via typed selectors
 * - Fetch operations with duplicate request prevention
 * - Cache staleness detection
 * - Optional automatic fetching on mount
 * 
 * @param options - Configuration options for cache behavior
 * @returns Object containing field types data, loading states, and fetch methods
 */
export const useFieldTypes = (options: UseFieldTypesOptions = {}): UseFieldTypesResult => {
  const {
    maxCacheAge = 300000, // Default: 5 minutes
    autoFetch = false,
  } = options;

  // Use typed Redux hooks (configured in app/hooks.ts)
  const dispatch = useAppDispatch();

  // Select data from Redux store using memoized selectors
  const fieldTypes = useAppSelector(selectFieldTypes);
  const loading = useAppSelector(selectFieldTypesLoading);
  const error = useAppSelector(selectFieldTypesError);
  const isLoading = useAppSelector(selectIsFieldTypesLoading);
  const lastFetched = useAppSelector(selectFieldTypesLastFetched);
  const count = useAppSelector(selectFieldTypesCount);

  // Calculate if cache is stale
  const isCacheStale = lastFetched === null || (Date.now() - lastFetched > maxCacheAge);

  // Track if a fetch is in progress to prevent duplicate requests
  const fetchInProgressRef = useRef(false);

  /**
   * Refetch field types (always fetches, ignores cache)
   * 
   * Use this when user explicitly requests fresh data (e.g., refresh button)
   */
  const refetch = useCallback(async (): Promise<void> => {
    try {
      console.info('[useFieldTypes] Manual refetch triggered');
      fetchInProgressRef.current = true;
      await dispatch(fetchFieldTypesThunk()).unwrap();
      console.info('[useFieldTypes] Refetch completed successfully');
    } catch (error) {
      console.error('[useFieldTypes] Refetch failed:', error);
      // Error is already stored in Redux state, no need to throw here
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [dispatch]);

  /**
   * Ensure data is loaded (smart fetch - only if needed)
   * 
   * This method checks if:
   * 1. Data has never been fetched (lastFetched === null)
   * 2. Cache is stale (exceeded maxCacheAge)
   * 3. No fetch is currently in progress
   * 
   * If all conditions are met, it triggers a fetch. Otherwise, it returns immediately.
   * Safe to call repeatedly without causing duplicate requests.
   */
  const ensureLoaded = useCallback(async (): Promise<void> => {
    // Skip if already loading
    if (isLoading || fetchInProgressRef.current) {
      console.info('[useFieldTypes] ensureLoaded skipped - fetch already in progress');
      return;
    }

    // Skip if cache is fresh
    if (!isCacheStale) {
      console.info('[useFieldTypes] ensureLoaded skipped - cache is fresh');
      return;
    }

    // Fetch needed - cache is stale or data never loaded
    try {
      console.info('[useFieldTypes] ensureLoaded triggered - cache stale or empty');
      fetchInProgressRef.current = true;
      await dispatch(fetchFieldTypesThunk()).unwrap();
      console.info('[useFieldTypes] ensureLoaded completed successfully');
    } catch (error) {
      console.error('[useFieldTypes] ensureLoaded failed:', error);
      // Error is already stored in Redux state
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [dispatch, isLoading, isCacheStale]);

  /**
   * Auto-fetch effect (runs on mount if enabled)
   * 
   * This effect respects React 18 Strict Mode by using fetchInProgressRef
   * to prevent double-fetching during development double-mounting.
   */
  useEffect(() => {
    if (autoFetch) {
      console.info('[useFieldTypes] Auto-fetch enabled - checking if load needed');
      ensureLoaded();
    }
  }, [autoFetch, ensureLoaded]);

  /**
   * Cleanup effect (reset fetch flag on unmount)
   * 
   * Ensures that fetchInProgressRef doesn't carry stale state if component
   * unmounts during a fetch operation.
   */
  useEffect(() => {
    return () => {
      if (fetchInProgressRef.current) {
        console.warn('[useFieldTypes] Component unmounted during fetch operation');
        fetchInProgressRef.current = false;
      }
    };
  }, []);

  // Return stable object reference (all values are from Redux or useCallback)
  return {
    fieldTypes,
    loading,
    error,
    isLoading,
    count,
    lastFetched,
    isCacheStale,
    refetch,
    ensureLoaded,
  };
};

/**
 * Additional utility hooks for specific use cases
 */

/**
 * Hook to get a single field type by ID
 * 
 * @param id - The field type ID to find
 * @returns The matching field type or undefined
 */
export const useFieldTypeById = (id: number): FieldType | undefined => {
  return useAppSelector((state) => 
    state.fieldTypes.items.find(item => item.id === id)
  );
};

/**
 * Hook to check if field types are loaded and ready
 * 
 * Useful for conditional rendering:
 * ```
 * const isReady = useFieldTypesReady();
 * if (!isReady) return <Spinner />;
 * ```
 * 
 * @returns True if data is loaded successfully with at least one item
 */
export const useFieldTypesReady = (): boolean => {
  const loading = useAppSelector(selectFieldTypesLoading);
  const count = useAppSelector(selectFieldTypesCount);
  
  return loading === 'succeeded' && count > 0;
};

/**
 * Example usage in a component:
 * 
 * ```
 * import { useFieldTypes } from './features/fieldTypes/useFieldTypes';
 * 
 * export const FieldTypesSelector: React.FC = () => {
 *   const { 
 *     fieldTypes, 
 *     isLoading, 
 *     error, 
 *     ensureLoaded 
 *   } = useFieldTypes({ maxCacheAge: 600000 }); // 10 min cache
 * 
 *   // Load data on mount
 *   useEffect(() => {
 *     ensureLoaded();
 *   }, [ensureLoaded]);
 * 
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorAlert message={error} />;
 * 
 *   return (
 *     <Select>
 *       {fieldTypes.map(type => (
 *         <SelectItem key={type.id} value={type.id}>
 *           {type.name}
 *         </SelectItem>
 *       ))}
 *     </Select>
 *   );
 * };
 * ```
 */
