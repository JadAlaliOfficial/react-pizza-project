/**
 * DSPR API Custom Hook
 * Main hook for coordinating DSPR API calls and state management
 * 
 * This hook:
 * - Provides a unified interface for triggering DSPR API requests
 * - Manages request coordination and error handling
 * - Integrates with the Redux store for state management
 * - Offers convenient methods for data fetching and refresh
 * - Handles loading states and error recovery
 */

import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store';
import {
  fetchDsprData,
  refreshDsprData,
  resetApiState,
  clearError,
  clearCache,
  setCacheTTL,
  invalidateCache,
  selectDsprApiState,
  selectDsprData,
  selectDsprStatus,
  selectDsprError,
  selectIsLoading,
  selectCacheInfo,
  selectIsCachedAndFresh,
  selectRequestMetadata,
  selectFilteringValues,
  selectReportsData
} from '../store/coordinatorSlice';
import {
  type DsprApiRequest,
  type DsprApiParams,
  isValidStoreId,
  isValidApiDate
} from '../types/common';

// =============================================================================
// HOOK INTERFACE
// =============================================================================

/**
 * Configuration options for the DSPR API hook
 */
export interface UseDsprApiOptions {
  /** Whether to automatically clear errors on new requests */
  autoClearErrors?: boolean;
  /** Default cache TTL override (in milliseconds) */
  defaultCacheTTL?: number;
  /** Whether to enable request validation */
  enableValidation?: boolean;
  /** Whether to log hook operations */
  enableLogging?: boolean;
}

/**
 * Return type of the useDsprApi hook
 */
export interface UseDsprApiReturn {
  // Data and State
  /** Complete API response data */
  data: ReturnType<typeof selectDsprData>;
  /** Current request status */
  status: ReturnType<typeof selectDsprStatus>;
  /** Current error state */
  error: ReturnType<typeof selectDsprError>;
  /** Whether API request is in progress */
  isLoading: boolean;
  /** Whether data is cached and fresh */
  isCachedAndFresh: boolean;
  /** Cache information */
  cacheInfo: ReturnType<typeof selectCacheInfo>;
  /** Request metadata for debugging */
  requestMetadata: ReturnType<typeof selectRequestMetadata>;
  /** Filtering values from response */
  filteringValues: ReturnType<typeof selectFilteringValues>;
  /** Reports data from response */
  reportsData: ReturnType<typeof selectReportsData>;

  // Actions
  /** Fetch DSPR data with parameters */
  fetchData: (params: DsprApiParams) => Promise<void>;
  /** Fetch DSPR data with complete request object */
  fetchWithRequest: (request: DsprApiRequest) => Promise<void>;
  /** Refresh current data (bypass cache) */
  refreshData: () => Promise<void>;
  /** Reset API state to initial values */
  resetState: () => void;
  /** Clear current error state */
  clearApiError: () => void;
  /** Clear cache and invalidate data */
  clearApiCache: () => void;
  /** Update cache TTL setting */
  updateCacheTTL: (ttl: number) => void;
  /** Manually invalidate cache */
  invalidateApiCache: () => void;

  // Utilities
  /** Validate request parameters */
  validateRequest: (params: DsprApiParams) => ValidationResult;
  /** Check if request can be made */
  canMakeRequest: (params: DsprApiParams) => boolean;
  /** Get current request summary */
  getRequestSummary: () => RequestSummary;
}

/**
 * Request validation result
 */
export interface ValidationResult {
  /** Whether the request is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
}

/**
 * Request summary information
 */
export interface RequestSummary {
  /** Whether data is available */
  hasData: boolean;
  /** Whether request is in progress */
  isLoading: boolean;
  /** Whether there are errors */
  hasError: boolean;
  /** Whether data is cached and fresh */
  isFresh: boolean;
  /** Last fetch timestamp */
  lastFetched: number | null;
  /** Data age in milliseconds */
  dataAge: number | null;
  /** Current store and date if available */
  currentContext: {
    store: string | null;
    date: string | null;
  };
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * Main DSPR API coordination hook
 * Provides a comprehensive interface for DSPR API operations
 * 
 * @param options - Configuration options for the hook
 * @returns Object containing data, actions, and utilities
 */
export const useDsprApi = (options: UseDsprApiOptions = {}): UseDsprApiReturn => {
  const {
    autoClearErrors = true,
    defaultCacheTTL,
    enableValidation = true,
    enableLogging = process.env.NODE_ENV === 'development'
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Selectors
  const apiState = useSelector((state: RootState) => selectDsprApiState(state));
  const data = useSelector((state: RootState) => selectDsprData(state));
  const status = useSelector((state: RootState) => selectDsprStatus(state));
  const error = useSelector((state: RootState) => selectDsprError(state));
  const isLoading = useSelector((state: RootState) => selectIsLoading(state));
  const isCachedAndFreshRaw = useSelector((state: RootState) => selectIsCachedAndFresh(state));
  const cacheInfo = useSelector((state: RootState) => selectCacheInfo(state));
  const requestMetadata = useSelector((state: RootState) => selectRequestMetadata(state));
  const filteringValues = useSelector((state: RootState) => selectFilteringValues(state));
  const reportsData = useSelector((state: RootState) => selectReportsData(state));

  // Convert potentially null/number to boolean for isCachedAndFresh
  const isCachedAndFresh = Boolean(isCachedAndFreshRaw);

  // Set default cache TTL if provided
  useMemo(() => {
    if (defaultCacheTTL && defaultCacheTTL !== cacheInfo.ttl) {
      dispatch(setCacheTTL(defaultCacheTTL));
      if (enableLogging) {
        console.log('[useDsprApi] Cache TTL updated', { ttl: defaultCacheTTL });
      }
    }
  }, [defaultCacheTTL, cacheInfo.ttl, dispatch, enableLogging]);

  // Actions
  const fetchData = useCallback(async (
    params: DsprApiParams
  ): Promise<void> => {
    try {
      if (enableLogging) {
        console.log('[useDsprApi] Fetching data', { params });
      }

      // Auto-clear errors if enabled
      if (autoClearErrors && error) {
        dispatch(clearError());
      }

      // Validate request if enabled
      if (enableValidation) {
        const validation = validateRequestInternal(params);
        if (!validation.isValid) {
          const errorMessage = `Request validation failed: ${validation.errors.join(', ')}`;
          console.error('[useDsprApi]', errorMessage);
          throw new Error(errorMessage);
        }
      }

      // Create request object - body is optional
      const request: DsprApiRequest = {
        params
      };

      // Dispatch the async thunk
      const result = await dispatch(fetchDsprData(request));
      
      if (fetchDsprData.rejected.match(result)) {
        throw new Error(result.payload?.message || 'Failed to fetch DSPR data');
      }

      if (enableLogging) {
        console.log('[useDsprApi] Data fetched successfully');
      }

    } catch (error) {
      console.error('[useDsprApi] Fetch error:', error);
      throw error;
    }
  }, [dispatch, autoClearErrors, error, enableValidation, enableLogging]);

  const fetchWithRequest = useCallback(async (request: DsprApiRequest): Promise<void> => {
    try {
      if (enableLogging) {
        console.log('[useDsprApi] Fetching with request object', { request });
      }

      // Auto-clear errors if enabled
      if (autoClearErrors && error) {
        dispatch(clearError());
      }

      // Validate request if enabled
      if (enableValidation) {
        const validation = validateRequestInternal(request.params);
        if (!validation.isValid) {
          const errorMessage = `Request validation failed: ${validation.errors.join(', ')}`;
          console.error('[useDsprApi]', errorMessage);
          throw new Error(errorMessage);
        }
      }

      // Dispatch the async thunk
      const result = await dispatch(fetchDsprData(request));
      
      if (fetchDsprData.rejected.match(result)) {
        throw new Error(result.payload?.message || 'Failed to fetch DSPR data');
      }

      if (enableLogging) {
        console.log('[useDsprApi] Data fetched successfully');
      }

    } catch (error) {
      console.error('[useDsprApi] Fetch with request error:', error);
      throw error;
    }
  }, [dispatch, autoClearErrors, error, enableValidation, enableLogging]);

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      if (!apiState.currentRequest) {
        throw new Error('No previous request to refresh');
      }

      if (enableLogging) {
        console.log('[useDsprApi] Refreshing data');
      }

      // Auto-clear errors if enabled
      if (autoClearErrors && error) {
        dispatch(clearError());
      }

      // Dispatch refresh thunk
      const result = await dispatch(refreshDsprData(apiState.currentRequest));
      
      if (refreshDsprData.rejected.match(result)) {
        throw new Error(result.payload?.message || 'Failed to refresh DSPR data');
      }

      if (enableLogging) {
        console.log('[useDsprApi] Data refreshed successfully');
      }

    } catch (error) {
      console.error('[useDsprApi] Refresh error:', error);
      throw error;
    }
  }, [dispatch, apiState.currentRequest, autoClearErrors, error, enableLogging]);

  const resetState = useCallback((): void => {
    dispatch(resetApiState());
    if (enableLogging) {
      console.log('[useDsprApi] API state reset');
    }
  }, [dispatch, enableLogging]);

  const clearApiError = useCallback((): void => {
    dispatch(clearError());
    if (enableLogging) {
      console.log('[useDsprApi] Error cleared');
    }
  }, [dispatch, enableLogging]);

  const clearApiCache = useCallback((): void => {
    dispatch(clearCache());
    if (enableLogging) {
      console.log('[useDsprApi] Cache cleared');
    }
  }, [dispatch, enableLogging]);

  const updateCacheTTL = useCallback((ttl: number): void => {
    dispatch(setCacheTTL(ttl));
    if (enableLogging) {
      console.log('[useDsprApi] Cache TTL updated', { ttl });
    }
  }, [dispatch, enableLogging]);

  const invalidateApiCache = useCallback((): void => {
    dispatch(invalidateCache());
    if (enableLogging) {
      console.log('[useDsprApi] Cache invalidated');
    }
  }, [dispatch, enableLogging]);

  // Utilities
  const validateRequest = useCallback((
    params: DsprApiParams
  ): ValidationResult => {
    return validateRequestInternal(params);
  }, []);

  const canMakeRequest = useCallback((
    params: DsprApiParams
  ): boolean => {
    if (isLoading) {
      return false;
    }

    if (enableValidation) {
      const validation = validateRequestInternal(params);
      return validation.isValid;
    }

    return true;
  }, [isLoading, enableValidation]);

  const getRequestSummary = useCallback((): RequestSummary => {
    const currentContext = {
      store: filteringValues?.store || null,
      date: filteringValues?.date || null
    };

    const dataAge = apiState.lastFetched ? Date.now() - apiState.lastFetched : null;

    return {
      hasData: !!data,
      isLoading,
      hasError: !!error,
      isFresh: isCachedAndFresh, // Now properly boolean
      lastFetched: apiState.lastFetched,
      dataAge,
      currentContext
    };
  }, [data, isLoading, error, isCachedAndFresh, apiState.lastFetched, filteringValues]);

  return {
    // Data and State
    data,
    status,
    error,
    isLoading,
    isCachedAndFresh, // Now properly boolean
    cacheInfo,
    requestMetadata,
    filteringValues,
    reportsData,

    // Actions
    fetchData,
    fetchWithRequest,
    refreshData,
    resetState,
    clearApiError,
    clearApiCache,
    updateCacheTTL,
    invalidateApiCache,

    // Utilities
    validateRequest,
    canMakeRequest,
    getRequestSummary
  };
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Internal request validation function
 * @param params - Request parameters to validate
 * @param items - Items array to validate (optional)
 * @returns Validation result
 */
function validateRequestInternal(
  params: DsprApiParams
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate store ID
  if (!params.store) {
    errors.push('Store ID is required');
  } else if (!isValidStoreId(params.store)) {
    errors.push(`Invalid store ID format: ${params.store}. Expected format: XXXXX-XXXXX`);
  }

  // Validate date
  if (!params.date) {
    errors.push('Date is required');
  } else if (!isValidApiDate(params.date)) {
    errors.push(`Invalid date format: ${params.date}. Expected format: YYYY-MM-DD`);
  } else {
    // Check if date is in the future
    const requestDate = new Date(params.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestDate > today) {
      warnings.push('Requested date is in the future');
    }

    // Check if date is too far in the past
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    if (requestDate < thirtyDaysAgo) {
      warnings.push('Requested date is more than 30 days in the past');
    }
  }

  // No items in request

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Simplified hook for basic DSPR data fetching
 * @param options - Hook configuration options
 * @returns Simplified hook interface
 */
export const useSimpleDsprApi = (options: UseDsprApiOptions = {}) => {
  const {
    data,
    isLoading,
    error,
    fetchData,
    refreshData,
    clearApiError
  } = useDsprApi(options);

  return {
    data,
    isLoading,
    error,
    fetchData,
    refreshData,
    clearError: clearApiError
  };
};

/**
 * Hook for checking DSPR data freshness and cache status
 * @returns Cache and freshness information
 */
export const useDsprCache = () => {
  const {
    isCachedAndFresh,
    cacheInfo,
    getRequestSummary,
    clearApiCache,
    updateCacheTTL,
    invalidateApiCache
  } = useDsprApi();

  const summary = getRequestSummary();

  return {
    isFresh: isCachedAndFresh,
    cacheInfo,
    dataAge: summary.dataAge,
    lastFetched: summary.lastFetched,
    clearCache: clearApiCache,
    updateTTL: updateCacheTTL,
    invalidateCache: invalidateApiCache
  };
};

/**
 * Hook for DSPR request validation
 * @returns Validation utilities
 */
export const useDsprValidation = () => {
  const { validateRequest, canMakeRequest } = useDsprApi({ enableValidation: true });

  return {
    validateRequest,
    canMakeRequest
  };
};

// =============================================================================
// HOOK EXPORTS
// =============================================================================

export default useDsprApi;
