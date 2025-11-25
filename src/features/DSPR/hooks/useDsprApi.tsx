/**
 * ============================================================================
 * USE DSPR API HOOK
 * ============================================================================
 * Domain: DSPR API - Central Data Access Hook
 *
 * Responsibility:
 * - React hook for consuming the central DSPR API Redux state
 * - Provides simple interface for fetching DSPR report data
 * - Exposes data, loading state, error state, and cache status
 * - Handles automatic refetch with cache awareness
 * - Provides convenience methods for invalidating cache and clearing data
 *
 * Related Files:
 * - State: state/dsprApiSlice.ts (Redux slice)
 * - Service: service/dsprApiService.ts (makes API calls)
 * - Types: types/dspr.common.ts (DsprApiRequest, DsprApiResponse)
 *
 * Usage:
 * ```
 * function MyComponent() {
 *   const {
 *     data,
 *     filteringValues,
 *     status,
 *     error,
 *     isLoading,
 *     isFresh,
 *     fetchData,
 *     refetch,
 *     invalidateCache,
 *     clearData,
 *   } = useDsprApi();
 *
 *   // Fetch data
 *   useEffect(() => {
 *     fetchData({ store: '03795-00001', date: '2025-11-16' });
 *   }, []);
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error message={error.message} />;
 *   if (!data) return <Empty />;
 *
 *   return <DsprDashboard data={data} />;
 * }
 * ```
 *
 * Key Features:
 * - Automatic cache checking (won't refetch if data is fresh)
 * - Force refetch option
 * - Access to all reports (daily, weekly)
 * - Access to filtering values (metadata)
 * - Type-safe data access
 */

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDsprData,
  selectDsprData,
  selectDsprStatus,
  selectDsprError,
  selectIsLoading,
  selectIsCached,
  selectFilteringValues,
  selectReports,
  selectDailyReports,
  selectWeeklyReports,
  selectCurrentRequest,
  selectLastFetched,
  selectCacheExpiresAt,
  selectTimeUntilCacheExpires,
  selectHasStaleData,
  clearDsprData,
  invalidateCache as invalidateCacheAction,
  clearError as clearErrorAction,
} from '../store/dsprApiSlice';
import {
  type DsprApiRequest,
  type DsprApiResponse,
  ApiStatus,
  type ApiError,
  type FilteringValues,
  type Reports,
  type DailyReports,
  type WeeklyReports,
  type StoreId,
  type ApiDate,
} from '../types/dspr.common';

// ============================================================================
// HOOK OPTIONS
// ============================================================================

/**
 * Options for fetching DSPR data
 */
export interface FetchDsprDataOptions {
  /** Force refetch even if data is cached and fresh */
  force?: boolean;

  /** Skip cache check entirely */
  skipCache?: boolean;
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

/**
 * Return type for useDsprApi hook
 */
export interface UseDsprApiReturn {
  // ========================================================================
  // DATA
  // ========================================================================

  /** Full DSPR API response */
  data: DsprApiResponse | null;

  /** Filtering values (metadata) from response */
  filteringValues: FilteringValues | null;

  /** All reports (daily + weekly) */
  reports: Reports | null;

  /** Daily reports only */
  dailyReports: DailyReports | null;

  /** Weekly reports only */
  weeklyReports: WeeklyReports | null;

  // ========================================================================
  // STATE
  // ========================================================================

  /** Current request status */
  status: ApiStatus;

  /** Error object (if request failed) */
  error: ApiError | null;

  /** Whether request is currently loading */
  isLoading: boolean;

  /** Whether data is cached and fresh */
  isFresh: boolean;

  /** Whether data exists but cache is stale */
  isStale: boolean;

  /** Whether any data exists (fresh or stale) */
  hasData: boolean;

  /** Last fetch timestamp (ISO string) */
  lastFetched: string | null;

  /** Cache expiration timestamp (ISO string) */
  cacheExpiresAt: string | null;

  /** Time until cache expires (milliseconds) */
  timeUntilCacheExpires: number | null;

  // ========================================================================
  // REQUEST INFO
  // ========================================================================

  /** Current/last request store ID */
  currentStore: StoreId | null;

  /** Current/last request date */
  currentDate: ApiDate | null;

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Fetches DSPR data
   * @param request - Request parameters (store, date, optional body)
   * @param options - Fetch options (force, skipCache)
   */
  fetchData: (
    request: DsprApiRequest,
    options?: FetchDsprDataOptions,
  ) => Promise<void>;

  /**
   * Refetches data using the last request parameters
   * @param options - Fetch options (force, skipCache)
   */
  refetch: (options?: FetchDsprDataOptions) => Promise<void>;

  /**
   * Invalidates cache, forcing next fetch to retrieve fresh data
   */
  invalidateCache: () => void;

  /**
   * Clears all DSPR data and resets to initial state
   */
  clearData: () => void;

  /**
   * Clears error state
   */
  clearError: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for accessing and managing DSPR API data
 *
 * Provides a simple interface for fetching DSPR reports, checking cache status,
 * and accessing all report data (daily, weekly, filtering values).
 *
 * @returns Object with data, state, and action methods
 *
 * @example
 * ```
 * function Dashboard() {
 *   const { data, isLoading, error, fetchData } = useDsprApi();
 *
 *   useEffect(() => {
 *     fetchData({ store: '03795-00001', date: '2025-11-16' });
 *   }, []);
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error error={error} />;
 *   return <DashboardContent data={data} />;
 * }
 * ```
 */
export function useDsprApi(): UseDsprApiReturn {
  const dispatch = useAppDispatch();

  // ========================================================================
  // SELECTORS
  // ========================================================================

  const data = useAppSelector(selectDsprData);
  const status = useAppSelector(selectDsprStatus);
  const error = useAppSelector(selectDsprError);
  const isLoading = useAppSelector(selectIsLoading);
  const isFresh = useAppSelector(selectIsCached);
  const hasStaleData = useAppSelector(selectHasStaleData);
  const filteringValues = useAppSelector(selectFilteringValues);
  const reports = useAppSelector(selectReports);
  const dailyReports = useAppSelector(selectDailyReports);
  const weeklyReports = useAppSelector(selectWeeklyReports);
  const currentRequest = useAppSelector(selectCurrentRequest);
  const lastFetched = useAppSelector(selectLastFetched);
  const cacheExpiresAt = useAppSelector(selectCacheExpiresAt);
  const timeUntilCacheExpires = useAppSelector(selectTimeUntilCacheExpires);

  // ========================================================================
  // DERIVED STATE
  // ========================================================================

  const hasData = useMemo(() => data !== null, [data]);
  const isStale = useMemo(() => hasStaleData, [hasStaleData]);
  const currentStore = useMemo(
    () => currentRequest?.store || null,
    [currentRequest],
  );
  const currentDate = useMemo(
    () => currentRequest?.date || null,
    [currentRequest],
  );

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Fetches DSPR data
   */
  const fetchData = useCallback(
    async (request: DsprApiRequest, options: FetchDsprDataOptions = {}) => {
      const { force = false, skipCache = false } = options;

      // Check if we already have fresh data for this request
      if (!force && !skipCache && isFresh && data) {
        const isMatchingRequest =
          data?.FilteringValues?.store === request.store &&
          data?.FilteringValues?.date === request.date;

        if (isMatchingRequest) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[useDsprApi] Using cached data:', {
              store: request.store,
              date: request.date,
              expiresAt: cacheExpiresAt,
            });
          }
          return;
        }
      }

      // Dispatch fetch thunk
      try {
        await dispatch(fetchDsprData(request)).unwrap();
      } catch (error) {
        // Error is already handled in the slice, but we can log here if needed
        if (process.env.NODE_ENV === 'development') {
          console.error('[useDsprApi] Fetch failed:', error);
        }
        throw error;
      }
    },
    [dispatch, isFresh, data, cacheExpiresAt],
  );

  /**
   * Refetches data using the last request parameters
   */
  const refetch = useCallback(
    async (options: FetchDsprDataOptions = {}) => {
      if (!currentRequest) {
        console.warn('[useDsprApi] Cannot refetch: no previous request found');
        return;
      }

      await fetchData(
        {
          store: currentRequest.store,
          date: currentRequest.date,
        },
        { ...options, force: true }, // Force refetch
      );
    },
    [currentRequest, fetchData],
  );

  /**
   * Invalidates cache
   */
  const invalidateCache = useCallback(() => {
    dispatch(invalidateCacheAction());
  }, [dispatch]);

  /**
   * Clears all data
   */
  const clearData = useCallback(() => {
    dispatch(clearDsprData());
  }, [dispatch]);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Data
    data,
    filteringValues,
    reports,
    dailyReports,
    weeklyReports,

    // State
    status,
    error,
    isLoading,
    isFresh,
    isStale,
    hasData,
    lastFetched,
    cacheExpiresAt,
    timeUntilCacheExpires,

    // Request info
    currentStore,
    currentDate,

    // Actions
    fetchData,
    refetch,
    invalidateCache,
    clearData,
    clearError,
  };
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for fetching DSPR data with automatic loading on mount
 *
 * @param store - Store ID
 * @param date - Date in YYYY-MM-DD format
 * @param options - Fetch options
 * @returns Same as useDsprApi
 *
 * @example
 * ```
 * function Dashboard() {
 *   const { data, isLoading, error } = useDsprApiAutoFetch('03795-00001', '2025-11-16');
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error error={error} />;
 *   return <DashboardContent data={data} />;
 * }
 * ```
 */
export function useDsprApiAutoFetch(
  store: StoreId,
  date: ApiDate,
  options: FetchDsprDataOptions = {},
): UseDsprApiReturn {
  const dsprApi = useDsprApi();

  // Auto-fetch on mount or when store/date changes
  useMemo(() => {
    dsprApi.fetchData({ store, date }, options);
  }, [store, date]); // Intentionally not including fetchData to avoid infinite loops

  return dsprApi;
}

/**
 * Hook for checking if data for a specific store/date is loaded
 *
 * @param store - Store ID to check
 * @param date - Date to check
 * @returns Boolean indicating if data is loaded and matches the request
 *
 * @example
 * ```
 * const isLoaded = useIsDsprDataLoaded('03795-00001', '2025-11-16');
 * ```
 */
export function useIsDsprDataLoaded(store: StoreId, date: ApiDate): boolean {
  const { data } = useDsprApi();

  return useMemo(() => {
    if (!data) return false;
    return (
      data.FilteringValues.store === store && data.FilteringValues.date === date
    );
  }, [data, store, date]);
}

/**
 * Hook for checking if fresh data for a specific store/date exists
 *
 * @param store - Store ID to check
 * @param date - Date to check
 * @returns Boolean indicating if fresh data is loaded
 *
 * @example
 * ```
 * const hasFreshData = useIsDsprDataFresh('03795-00001', '2025-11-16');
 * ```
 */
export function useIsDsprDataFresh(store: StoreId, date: ApiDate): boolean {
  const { data, isFresh } = useDsprApi();

  return useMemo(() => {
    if (!data || !isFresh) return false;
    return (
      data.FilteringValues.store === store && data.FilteringValues.date === date
    );
  }, [data, isFresh, store, date]);
}
