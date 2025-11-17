/**
 * DSPR API Coordinator Slice
 * Main Redux slice that handles API calls and coordinates data distribution
 * 
 * This slice:
 * - Manages the primary API request lifecycle
 * - Stores the complete API response
 * - Provides actions that other domain slices can listen to
 * - Handles loading states and error management
 * - Serves as the single source of truth for API data
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  type DsprApiRequest,
  type DsprApiResponse,
  type ApiError,
  ApiStatus,
  isApiError
} from '../types/common';
import { dsprApiService } from '../service/api';

// =============================================================================
// STATE INTERFACE
// =============================================================================

/**
 * State interface for the DSPR API coordinator
 * Manages the complete API lifecycle and response data
 */
export interface DsprApiState {
  /** Complete API response data */
  data: DsprApiResponse | null;
  /** Current API request status */
  status: ApiStatus;
  /** Error information if request failed */
  error: ApiError | null;
  /** Timestamp of last successful fetch */
  lastFetched: number | null;
  /** Current request parameters for tracking */
  currentRequest: DsprApiRequest | null;
  /** Request metadata and timing information */
  metadata: RequestMetadata | null;
  /** Cache management information */
  cache: CacheInfo;
}

/**
 * Request metadata for monitoring and debugging
 */
interface RequestMetadata {
  /** Request start timestamp */
  requestStartTime: number;
  /** Request completion timestamp */
  requestEndTime: number | null;
  /** Request duration in milliseconds */
  duration: number | null;
  /** Number of retry attempts made */
  retryAttempts: number;
  /** Request unique identifier */
  requestId: string;
}

/**
 * Cache information for data management
 */
interface CacheInfo {
  /** Whether data is considered fresh */
  isFresh: boolean;
  /** Cache expiration timestamp */
  expiresAt: number | null;
  /** Cache time-to-live in milliseconds */
  ttl: number;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

/**
 * Default cache TTL (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Initial state for DSPR API coordinator
 */
const initialState: DsprApiState = {
  data: null,
  status: ApiStatus.IDLE,
  error: null,
  lastFetched: null,
  currentRequest: null,
  metadata: null,
  cache: {
    isFresh: false,
    expiresAt: null,
    ttl: DEFAULT_CACHE_TTL
  }
};

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Async thunk for fetching DSPR report data
 * Handles the complete API request lifecycle with comprehensive error handling
 * 
 * @param request - Complete DSPR API request object
 * @returns Promise resolving to DSPR API response
 */
export const fetchDsprData = createAsyncThunk<
  DsprApiResponse,
  DsprApiRequest,
  { rejectValue: ApiError }
>(
  'dsprApi/fetchData',
  async (request: DsprApiRequest, { rejectWithValue, signal }) => {
    try {
      // Validate request before proceeding
      validateDsprRequest(request);

      // Add abort signal support for request cancellation
      const controller = new AbortController();
      
      // Link the Redux toolkit signal to our controller
      signal.addEventListener('abort', () => {
        controller.abort();
      });

      console.log('[DSPR API Slice] Starting API request', {
        store: request.params.store,
        date: request.params.date,
        requestId: generateRequestId(request)
      });

      // Make the API request
      const response = await dsprApiService.fetchDsprReport(
        request.params
      );

      console.log('[DSPR API Slice] API request successful', {
        store: request.params.store,
        date: request.params.date,
        hasData: !!response,
        filteringValues: !!response?.['Filtering Values'],
        reports: !!response?.reports
      });

      return response;

    } catch (error) {
      console.error('[DSPR API Slice] API request failed', {
        store: request.params.store,
        date: request.params.date,
        error: error
      });

      // Transform error to ApiError format
      const apiError = transformToApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

/**
 * Async thunk for refreshing DSPR data
 * Forces a fresh API call regardless of cache status
 */
export const refreshDsprData = createAsyncThunk<
  DsprApiResponse,
  DsprApiRequest,
  { rejectValue: ApiError }
>(
  'dsprApi/refreshData',
  async (request: DsprApiRequest, { dispatch, rejectWithValue }) => {
    try {
      console.log('[DSPR API Slice] Refreshing data (cache bypass)', {
        store: request.params.store,
        date: request.params.date
      });

      // Clear current cache before refreshing
      dispatch(clearCache());

      // Fetch fresh data
      const response = await dsprApiService.fetchDsprReport(
        request.params
      );

      return response;

    } catch (error) {
      const apiError = transformToApiError(error);
      return rejectWithValue(apiError);
    }
  }
);

// =============================================================================
// SLICE DEFINITION
// =============================================================================

/**
 * DSPR API Coordinator Slice
 * Central slice for managing API state and coordinating data flow
 */
export const dsprApiSlice = createSlice({
  name: 'dsprApi',
  initialState,
  reducers: {
    /**
     * Reset the API state to initial values
     * Useful for cleanup and initialization
     */
    resetApiState: (state) => {
      Object.assign(state, initialState);
      console.log('[DSPR API Slice] API state reset');
    },

    /**
     * Clear any existing error state
     * Useful for error recovery workflows
     */
    clearError: (state) => {
      state.error = null;
      if (state.status === ApiStatus.FAILED) {
        state.status = ApiStatus.IDLE;
      }
      console.log('[DSPR API Slice] Error state cleared');
    },

    /**
     * Clear cache information and mark data as stale
     * Forces next request to fetch fresh data
     */
    clearCache: (state) => {
      state.cache = {
        isFresh: false,
        expiresAt: null,
        ttl: DEFAULT_CACHE_TTL
      };
      console.log('[DSPR API Slice] Cache cleared');
    },

    /**
     * Update cache TTL configuration
     * Allows dynamic cache management
     */
    setCacheTTL: (state, action: PayloadAction<number>) => {
      const newTTL = action.payload;
      state.cache.ttl = newTTL;
      
      // Update expiration time if data exists
      if (state.lastFetched) {
        state.cache.expiresAt = state.lastFetched + newTTL;
        state.cache.isFresh = Date.now() < state.cache.expiresAt;
      }
      
      console.log('[DSPR API Slice] Cache TTL updated', { newTTL });
    },

    /**
     * Mark current data as stale
     * Useful when external factors indicate data should be refreshed
     */
    invalidateCache: (state) => {
      state.cache.isFresh = false;
      state.cache.expiresAt = Date.now(); // Expire immediately
      console.log('[DSPR API Slice] Cache invalidated');
    }
  },
  extraReducers: (builder) => {
    // Handle fetchDsprData lifecycle
    builder
      .addCase(fetchDsprData.pending, (state, action) => {
        const request = action.meta.arg;
        const now = Date.now();
        
        state.status = ApiStatus.LOADING;
        state.error = null;
        state.currentRequest = request;
        state.metadata = {
          requestStartTime: now,
          requestEndTime: null,
          duration: null,
          retryAttempts: 0,
          requestId: generateRequestId(request)
        };

        console.log('[DSPR API Slice] Request started', {
          status: state.status,
          requestId: state.metadata.requestId
        });
      })
      .addCase(fetchDsprData.fulfilled, (state, action) => {
        const now = Date.now();
        const response = action.payload;
        
        state.status = ApiStatus.SUCCEEDED;
        state.data = response;
        state.error = null;
        state.lastFetched = now;
        
        // Update metadata
        if (state.metadata) {
          state.metadata.requestEndTime = now;
          state.metadata.duration = now - state.metadata.requestStartTime;
        }
        
        // Update cache information
        state.cache = {
          isFresh: true,
          expiresAt: now + state.cache.ttl,
          ttl: state.cache.ttl
        };

        console.log('[DSPR API Slice] Request succeeded', {
          status: state.status,
          duration: state.metadata?.duration,
          dataSize: JSON.stringify(response).length,
          cacheExpiresAt: new Date(state.cache.expiresAt!).toISOString()
        });
      })
      .addCase(fetchDsprData.rejected, (state, action) => {
        const now = Date.now();
        const error = action.payload;
        
        state.status = ApiStatus.FAILED;
        state.error = error || {
          message: 'Unknown error occurred',
          code: 'UNKNOWN_ERROR'
        };
        state.data = null;
        
        // Update metadata
        if (state.metadata) {
          state.metadata.requestEndTime = now;
          state.metadata.duration = now - state.metadata.requestStartTime;
        }

        console.error('[DSPR API Slice] Request failed', {
          status: state.status,
          error: state.error,
          duration: state.metadata?.duration
        });
      });

    // Handle refreshDsprData lifecycle (similar to fetchDsprData but with different logging)
    builder
      .addCase(refreshDsprData.pending, (state, action) => {
        const request = action.meta.arg;
        const now = Date.now();
        
        state.status = ApiStatus.LOADING;
        state.error = null;
        state.currentRequest = request;
        state.metadata = {
          requestStartTime: now,
          requestEndTime: null,
          duration: null,
          retryAttempts: 0,
          requestId: generateRequestId(request) + '_refresh'
        };

        console.log('[DSPR API Slice] Refresh started', {
          status: state.status,
          requestId: state.metadata.requestId
        });
      })
      .addCase(refreshDsprData.fulfilled, (state, action) => {
        const now = Date.now();
        const response = action.payload;
        
        state.status = ApiStatus.SUCCEEDED;
        state.data = response;
        state.error = null;
        state.lastFetched = now;
        
        // Update metadata
        if (state.metadata) {
          state.metadata.requestEndTime = now;
          state.metadata.duration = now - state.metadata.requestStartTime;
        }
        
        // Update cache information with fresh data
        state.cache = {
          isFresh: true,
          expiresAt: now + state.cache.ttl,
          ttl: state.cache.ttl
        };

        console.log('[DSPR API Slice] Refresh succeeded', {
          status: state.status,
          duration: state.metadata?.duration
        });
      })
      .addCase(refreshDsprData.rejected, (state, action) => {
        const now = Date.now();
        const error = action.payload;
        
        state.status = ApiStatus.FAILED;
        state.error = error || {
          message: 'Refresh failed with unknown error',
          code: 'REFRESH_ERROR'
        };
        
        // Update metadata
        if (state.metadata) {
          state.metadata.requestEndTime = now;
          state.metadata.duration = now - state.metadata.requestStartTime;
        }

        console.error('[DSPR API Slice] Refresh failed', {
          status: state.status,
          error: state.error
        });
      });
  }
});

// =============================================================================
// ACTIONS EXPORT
// =============================================================================

export const {
  resetApiState,
  clearError,
  clearCache,
  setCacheTTL,
  invalidateCache
} = dsprApiSlice.actions;

// =============================================================================
// SELECTORS
// =============================================================================

/**
 * Select complete API state
 */
export const selectDsprApiState = (state: { dsprApi: DsprApiState }) => state.dsprApi;

/**
 * Select API data
 */
export const selectDsprData = (state: { dsprApi: DsprApiState }) => state.dsprApi.data;

/**
 * Select API status
 */
export const selectDsprStatus = (state: { dsprApi: DsprApiState }) => state.dsprApi.status;

/**
 * Select API error
 */
export const selectDsprError = (state: { dsprApi: DsprApiState }) => state.dsprApi.error;

/**
 * Select loading state
 */
export const selectIsLoading = (state: { dsprApi: DsprApiState }) => 
  state.dsprApi.status === ApiStatus.LOADING;

/**
 * Select cache information
 */
export const selectCacheInfo = (state: { dsprApi: DsprApiState }) => state.dsprApi.cache;

/**
 * Select if data is cached and fresh
 */
export const selectIsCachedAndFresh = (state: { dsprApi: DsprApiState }) => {
  const cache = state.dsprApi.cache;
  return cache.isFresh && cache.expiresAt && Date.now() < cache.expiresAt;
};

/**
 * Select request metadata
 */
export const selectRequestMetadata = (state: { dsprApi: DsprApiState }) => state.dsprApi.metadata;

/**
 * Select filtering values from API response
 */
export const selectFilteringValues = (state: { dsprApi: DsprApiState }) => 
  state.dsprApi.data?.['Filtering Values'] || null;

/**
 * Select complete reports data
 */
export const selectReportsData = (state: { dsprApi: DsprApiState }) => 
  state.dsprApi.data?.reports || null;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate DSPR request parameters
 * @param request - Request to validate
 * @throws Error on validation failure
 */
function validateDsprRequest(request: DsprApiRequest): void {
  if (!request.params.store || !request.params.date) {
    throw new Error('Store and date parameters are required');
  }
}

/**
 * Generate unique request ID for tracking
 * @param request - Request object
 * @returns Unique request identifier
 */
function generateRequestId(request: DsprApiRequest): string {
  const { store, date } = request.params;
  const timestamp = Date.now();
  return `${store}_${date}_${timestamp}`;
}

/**
 * Transform various error types to ApiError
 * @param error - Error to transform
 * @returns Standardized ApiError
 */
function transformToApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
      code: 'REQUEST_ERROR'
    };
  }
  
  return {
    message: 'An unknown error occurred during the API request',
    details: String(error),
    code: 'UNKNOWN_ERROR'
  };
}

// =============================================================================
// SLICE EXPORT
// =============================================================================

export default dsprApiSlice.reducer;
