/**
 * ============================================================================
 * DSPR API SLICE (Central Redux State)
 * ============================================================================
 * Domain: DSPR API - Central State Management
 * 
 * Responsibility:
 * - Central coordinator for all DSPR API requests
 * - Calls dsprApiService.fetchDsprReport and stores full DsprApiResponse
 * - Manages async state (status, error, loading)
 * - Implements simple cache with TTL (time-to-live) and freshness tracking
 * - Provides selectors for accessing raw API response and filtering values
 * - Acts as single source of truth - other slices derive data from this response
 * 
 * Related Files:
 * - Service: service/dsprApiService.ts (makes actual API calls)
 * - Types: types/dspr.common.ts (DsprApiResponse, ApiState, ApiError)
 * - Hook: hooks/useDsprApi.ts (React hook to consume this slice)
 * - Derived slices: All domain-specific slices read from this central state
 * 
 * State Shape:
 * - data: DsprApiResponse | null (full API response)
 * - status: ApiStatus (idle/loading/succeeded/failed)
 * - error: ApiError | null
 * - lastFetched: string | null (ISO timestamp)
 * - cache: { isFresh: boolean, expiresAt: string | null }
 * - currentRequest: { store: StoreId, date: ApiDate } | null
 * 
 * Thunks:
 * - fetchDsprData: Async thunk that fetches DSPR report
 * 
 * Selectors:
 * - selectDsprState: Full slice state
 * - selectDsprData: Raw API response
 * - selectDsprStatus: Current request status
 * - selectDsprError: Current error (if any)
 * - selectFilteringValues: Metadata from API response
 * - selectReports: All reports (daily + weekly)
 * - selectDailyReports: Daily reports only
 * - selectWeeklyReports: Weekly reports only
 * - selectIsLoading: Boolean loading state
 * - selectIsCached: Boolean cache freshness
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import DsprApiService from '../service/dsprApiService';
import {
  type DsprApiRequest,
  type DsprApiResponse,
  type FilteringValues,
  type Reports,
  type DailyReports,
  type WeeklyReports,
  ApiStatus,
  type ApiError,
  type StoreId,
  type ApiDate,
  calculateCacheExpiration,
  isCacheFresh,
  DEFAULT_CACHE_CONFIG,
} from '../types/dspr.common';

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Cache metadata
 */
interface CacheMetadata {
  /** Whether cached data is still fresh */
  isFresh: boolean;
  
  /** Timestamp when cache expires (ISO string) */
  expiresAt: string | null;
}

/**
 * Current request tracking
 */
interface CurrentRequest {
  /** Store ID being requested */
  store: StoreId;
  
  /** Date being requested */
  date: ApiDate;
  
  /** Request timestamp */
  requestedAt: string;
}

/**
 * DSPR API slice state
 */
interface DsprApiState {
  /** Full DSPR API response */
  data: DsprApiResponse | null;
  
  /** Current request status */
  status: ApiStatus;
  
  /** Error object (if request failed) */
  error: ApiError | null;
  
  /** Timestamp of last successful fetch (ISO string) */
  lastFetched: string | null;
  
  /** Cache metadata */
  cache: CacheMetadata;
  
  /** Current/last request parameters */
  currentRequest: CurrentRequest | null;
}

function toIso(date: string): string {
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function getWeekNumberFromDate(date: string): number {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 0;
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const dayMs = 86400000;
  return Math.ceil((((d.getTime() - oneJan.getTime()) / dayMs) + oneJan.getDay() + 1) / 7);
}

function normalizeResponse(payload: DsprApiResponse, request: DsprApiRequest): DsprApiResponse {
  const fv: FilteringValues = payload.FilteringValues ?? {
    store: request.store,
    date: request.date,
    items: [],
    week: getWeekNumberFromDate(request.date),
    weekStartDate: toIso(request.date),
    weekEndDate: toIso(request.date),
    lookBackStart: toIso(request.date),
    lookBackEnd: toIso(request.date),
    depositDeliveryUrl: '',
  };
  return { ...payload, FilteringValues: fv };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for DSPR API slice
 */
const initialState: DsprApiState = {
  data: null,
  status: ApiStatus.Idle,
  error: null,
  lastFetched: null,
  cache: {
    isFresh: false,
    expiresAt: null,
  },
  currentRequest: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetches DSPR report data from the API
 * 
 * This is the central async thunk that all DSPR data fetching goes through.
 * Other slices should NOT make their own API calls - they should derive data
 * from this slice's response.
 * 
 * @param request - DSPR API request parameters (store, date, optional body)
 * @returns Promise resolving to DsprApiResponse
 * 
 * @example
 * ```
 * dispatch(fetchDsprData({ store: '03795-00001', date: '2025-11-16' }));
 * ```
 */
export const fetchDsprData = createAsyncThunk<
  DsprApiResponse,
  DsprApiRequest,
  { rejectValue: ApiError }
>(
  'dsprApi/fetchDsprData',
  async (request, { rejectWithValue }) => {
    try {
      const response = await DsprApiService.fetchDsprReport(request);
      return response;
    } catch (error) {
      // Transform error into ApiError
      if (isApiErrorLike(error)) {
        return rejectWithValue(error as ApiError);
      }
      
      // Fallback for unknown errors
      return rejectWithValue({
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined,
        code: 'UNKNOWN_ERROR',
      });
    }
  }
);

/**
 * Type guard for ApiError-like objects
 */
function isApiErrorLike(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

// ============================================================================
// SLICE
// ============================================================================

/**
 * DSPR API slice
 * Central Redux state for all DSPR API data
 */
const dsprApiSlice = createSlice({
  name: 'dsprApi',
  initialState,
  reducers: {
    /**
     * Clears all DSPR data and resets to initial state
     */
    clearDsprData(state) {
      state.data = null;
      state.status = ApiStatus.Idle;
      state.error = null;
      state.lastFetched = null;
      state.cache.isFresh = false;
      state.cache.expiresAt = null;
      state.currentRequest = null;
    },
    
    /**
     * Invalidates cache, forcing next fetch to retrieve fresh data
     */
    invalidateCache(state) {
      state.cache.isFresh = false;
      state.cache.expiresAt = null;
    },
    
    /**
     * Clears error state
     */
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ========================================================================
      // FETCH DSPR DATA - PENDING
      // ========================================================================
      .addCase(fetchDsprData.pending, (state, action) => {
        state.status = ApiStatus.Loading;
        state.error = null;
        
        // Track current request
        state.currentRequest = {
          store: action.meta.arg.store,
          date: action.meta.arg.date,
          requestedAt: new Date().toISOString(),
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[DSPR API] Fetching data:', action.meta.arg);
        }
      })
      
      // ========================================================================
      // FETCH DSPR DATA - FULFILLED
      // ========================================================================
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        state.status = ApiStatus.Succeeded;
        const normalized = normalizeResponse(action.payload, action.meta.arg);
        state.data = normalized;
        state.error = null;
        
        const now = new Date().toISOString();
        state.lastFetched = now;
        
        // Update cache metadata
        state.cache.isFresh = true;
        state.cache.expiresAt = calculateCacheExpiration(DEFAULT_CACHE_CONFIG.ttl);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[DSPR API] Data fetched successfully:', {
            store: normalized.FilteringValues.store,
            date: normalized.FilteringValues.date,
            week: normalized.FilteringValues.week,
            cachedUntil: state.cache.expiresAt,
          });
        }
      })
      
      
      // ========================================================================
      // FETCH DSPR DATA - REJECTED
      // ========================================================================
      .addCase(fetchDsprData.rejected, (state, action) => {
        state.status = ApiStatus.Failed;
        state.error = action.payload || {
          message: action.error.message || 'Failed to fetch DSPR data',
          code: action.error.code || 'FETCH_ERROR',
        };
        
        // Invalidate cache on error
        state.cache.isFresh = false;
        state.cache.expiresAt = null;
        
        if (process.env.NODE_ENV === 'development') {
          console.error('[DSPR API] Fetch failed:', state.error);
        }
      });

  },
});

// ============================================================================
// ACTIONS
// ============================================================================

export const { clearDsprData, invalidateCache, clearError } = dsprApiSlice.actions;

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Selects the entire DSPR API state
 */
export const selectDsprState = (state: RootState): DsprApiState => state.dsprApi;

/**
 * Selects the full DSPR API response data
 */
export const selectDsprData = (state: RootState): DsprApiResponse | null => 
  state.dsprApi.data;

/**
 * Selects the current request status
 */
export const selectDsprStatus = (state: RootState): ApiStatus => 
  state.dsprApi.status;

/**
 * Selects the current error (if any)
 */
export const selectDsprError = (state: RootState): ApiError | null => 
  state.dsprApi.error;

/**
 * Selects the last fetch timestamp
 */
export const selectLastFetched = (state: RootState): string | null => 
  state.dsprApi.lastFetched;

/**
 * Selects cache metadata
 */
export const selectCacheMetadata = (state: RootState): CacheMetadata => 
  state.dsprApi.cache;

/**
 * Selects current request parameters
 */
export const selectCurrentRequest = (state: RootState): CurrentRequest | null => 
  state.dsprApi.currentRequest;

/**
 * Selects filtering values (metadata) from API response
 */
export const selectFilteringValues = (state: RootState): FilteringValues | null => 
  state.dsprApi.data?.FilteringValues || null;

/**
 * Selects all reports (daily + weekly)
 */
export const selectReports = (state: RootState): Reports | null => 
  state.dsprApi.data?.reports || null;

/**
 * Selects daily reports only
 */
export const selectDailyReports = (state: RootState): DailyReports | null => 
  state.dsprApi.data?.reports.daily || null;

/**
 * Selects weekly reports only
 */
export const selectWeeklyReports = (state: RootState): WeeklyReports | null => 
  state.dsprApi.data?.reports.weekly || null;

/**
 * Selects whether data is currently loading
 */
export const selectIsLoading = (state: RootState): boolean => 
  state.dsprApi.status === ApiStatus.Loading;

/**
 * Selects whether request has succeeded
 */
export const selectIsSucceeded = (state: RootState): boolean => 
  state.dsprApi.status === ApiStatus.Succeeded;

/**
 * Selects whether request has failed
 */
export const selectIsFailed = (state: RootState): boolean => 
  state.dsprApi.status === ApiStatus.Failed;

/**
 * Selects whether state is idle (no request made)
 */
export const selectIsIdle = (state: RootState): boolean => 
  state.dsprApi.status === ApiStatus.Idle;

/**
 * Selects whether cached data is still fresh
 */
export const selectIsCached = (state: RootState): boolean => 
  state.dsprApi.cache.isFresh && isCacheFresh(state.dsprApi.cache.expiresAt);

/**
 * Selects whether data exists and is fresh
 */
export const selectHasFreshData = (state: RootState): boolean => 
  state.dsprApi.data !== null && selectIsCached(state);

/**
 * Selects whether data exists but cache is stale
 */
export const selectHasStaleData = (state: RootState): boolean => 
  state.dsprApi.data !== null && !selectIsCached(state);

/**
 * Selects cache expiration timestamp
 */
export const selectCacheExpiresAt = (state: RootState): string | null => 
  state.dsprApi.cache.expiresAt;

/**
 * Selects time until cache expires (in milliseconds)
 * Returns null if no cache or already expired
 */
export const selectTimeUntilCacheExpires = (state: RootState): number | null => {
  const expiresAt = state.dsprApi.cache.expiresAt;
  if (!expiresAt) return null;
  
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const timeRemaining = expires - now;
  
  return timeRemaining > 0 ? timeRemaining : null;
};

/**
 * Selects store ID from current/last request
 */
export const selectRequestStore = (state: RootState): StoreId | null => 
  state.dsprApi.currentRequest?.store || null;

/**
 * Selects date from current/last request
 */
export const selectRequestDate = (state: RootState): ApiDate | null => 
  state.dsprApi.currentRequest?.date || null;

/**
 * Selects week number from filtering values
 */
export const selectWeekNumber = (state: RootState): number | null => 
  state.dsprApi.data?.FilteringValues.week || null;

/**
 * Selects week start date from filtering values
 */
export const selectWeekStartDate = (state: RootState): string | null => 
  state.dsprApi.data?.FilteringValues.weekStartDate || null;

/**
 * Selects week end date from filtering values
 */
export const selectWeekEndDate = (state: RootState): string | null => 
  state.dsprApi.data?.FilteringValues.weekEndDate || null;

/**
 * Selects deposit/delivery URL from filtering values
 */
export const selectDepositDeliveryUrl = (state: RootState): string | null => 
  state.dsprApi.data?.FilteringValues.depositDeliveryUrl || null;

/**
 * Selects item codes from filtering values
 */
export const selectItemCodes = (state: RootState): number[] => 
  state.dsprApi.data?.FilteringValues.items || [];

// ============================================================================
// HELPER SELECTORS (Memoized with Reselect if needed)
// ============================================================================

/**
 * Creates a selector that checks if data for specific store/date is loaded
 * 
 * @param store - Store ID to check
 * @param date - Date to check
 */
export const selectIsDataLoadedFor = (store: StoreId, date: ApiDate) => (
  state: RootState
): boolean => {
  return (
    state.dsprApi.data !== null &&
    state.dsprApi.data.FilteringValues.store === store &&
    state.dsprApi.data.FilteringValues.date === date
  );
};

/**
 * Creates a selector that checks if fresh data for specific store/date exists
 * 
 * @param store - Store ID to check
 * @param date - Date to check
 */
export const selectIsFreshDataLoadedFor = (store: StoreId, date: ApiDate) => (
  state: RootState
): boolean => {
  return (
    selectIsDataLoadedFor(store, date)(state) &&
    selectIsCached(state)
  );
};

// ============================================================================
// REDUCER EXPORT
// ============================================================================

export default dsprApiSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { DsprApiState, CacheMetadata, CurrentRequest };
