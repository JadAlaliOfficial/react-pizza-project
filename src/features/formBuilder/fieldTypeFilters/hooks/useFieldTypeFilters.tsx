// src/features/fieldTypeFilters/hooks/useFieldTypeFilters.ts

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks'; // Adjust path to your hooks
import {
  fetchFieldTypeFiltersThunk,
  selectFieldTypeFilters,
  selectFieldTypeFiltersLoading,
  selectFieldTypeFiltersError,
  selectFieldTypeFiltersLastFetchedAt,
  selectFieldTypeFiltersHasData,
  resetError,
} from '../store/fieldTypeFiltersSlice';
import type { 
  UseFieldTypeFiltersOptions,
} from '../types';

/**
 * Default cache duration in milliseconds (5 minutes)
 * Data fetched within this window is considered fresh
 */
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Custom hook for managing field type filters data
 * Provides automatic fetching, caching, and state management
 * 
 * @param {UseFieldTypeFiltersOptions} options - Configuration options
 * @param {boolean} options.skip - Skip automatic fetching on mount
 * @param {boolean} options.forceRefetch - Force refetch even if cached data exists
 * 
 * @returns {Object} Field type filters state and control functions
 * @returns {FieldTypeFiltersData} items - Array of field type filters
 * @returns {boolean} loading - Loading state indicator
 * @returns {string | null} error - Error message if fetch failed
 * @returns {boolean} hasData - Whether any data has been loaded
 * @returns {Function} refetch - Manually trigger a refetch
 * @returns {Function} resetError - Clear the current error state
 * 
 * @example
 * // Basic usage with auto-fetch
 * const { items, loading, error } = useFieldTypeFilters();
 * 
 * @example
 * // Skip auto-fetch and manually trigger
 * const { items, loading, refetch } = useFieldTypeFilters({ skip: true });
 * // Later: refetch();
 * 
 * @example
 * // Force refresh ignoring cache
 * const { items } = useFieldTypeFilters({ forceRefetch: true });
 */
export const useFieldTypeFilters = (options?: UseFieldTypeFiltersOptions) => {
  const dispatch = useAppDispatch();
  
  // Extract options with defaults
  const { skip = false, forceRefetch = false } = options || {};
  
  // Select state from Redux store
  const items = useAppSelector(selectFieldTypeFilters);
  const loading = useAppSelector(selectFieldTypeFiltersLoading);
  const error = useAppSelector(selectFieldTypeFiltersError);
  const lastFetchedAt = useAppSelector(selectFieldTypeFiltersLastFetchedAt);
  const hasData = useAppSelector(selectFieldTypeFiltersHasData);
  
  // Track if initial fetch has been attempted to prevent duplicate fetches
  const hasFetchedRef = useRef(false);
  
  /**
   * Determines if cached data is still fresh
   * @returns {boolean} True if data is within cache duration
   */
  const isCacheValid = useCallback((): boolean => {
    if (!lastFetchedAt) return false;
    
    const now = Date.now();
    const lastFetch = new Date(lastFetchedAt).getTime();
    const age = now - lastFetch;
    
    return age < DEFAULT_CACHE_DURATION;
  }, [lastFetchedAt]);
  
  /**
   * Determines if a fetch operation should be performed
   * Based on cache validity, existing data, and options
   * @returns {boolean} True if fetch should proceed
   */
  const shouldFetch = useCallback((): boolean => {
    // Never fetch if skip option is enabled
    if (skip) return false;
    
    // Always fetch if force refetch is requested
    if (forceRefetch) return true;
    
    // Fetch if no data exists
    if (!hasData) return true;
    
    // Fetch if cache is stale
    if (!isCacheValid()) {
      console.info('[useFieldTypeFilters] Cache expired, refetching data');
      return true;
    }
    
    return false;
  }, [skip, forceRefetch, hasData, isCacheValid]);
  
  /**
   * Manually trigger a refetch of field type filters
   * Useful for pull-to-refresh or retry scenarios
   * Bypasses cache validation
   */
  const refetch = useCallback(() => {
    console.info('[useFieldTypeFilters] Manual refetch triggered');
    hasFetchedRef.current = false; // Reset fetch guard
    dispatch(fetchFieldTypeFiltersThunk());
  }, [dispatch]);
  
  /**
   * Clear the current error state
   * Useful for dismissing error messages in UI
   */
  const handleResetError = useCallback(() => {
    console.info('[useFieldTypeFilters] Resetting error state');
    dispatch(resetError());
  }, [dispatch]);
  
  /**
   * Effect: Auto-fetch data on mount if conditions are met
   * Prevents duplicate fetches using ref guard
   */
  useEffect(() => {
    // Prevent duplicate fetches in strict mode or when dependencies change
    if (hasFetchedRef.current) return;
    
    if (shouldFetch()) {
      console.info('[useFieldTypeFilters] Auto-fetching field type filters on mount');
      hasFetchedRef.current = true;
      dispatch(fetchFieldTypeFiltersThunk());
    } else {
      console.info('[useFieldTypeFilters] Using cached data, skipping fetch');
    }
  }, [dispatch, shouldFetch]);
  
  /**
   * Effect: Log cache status changes for debugging
   */
  useEffect(() => {
    if (lastFetchedAt) {
      const cacheValid = isCacheValid();
      console.info(
        `[useFieldTypeFilters] Cache status: ${cacheValid ? 'VALID' : 'EXPIRED'}`,
        { lastFetchedAt, itemCount: items.length }
      );
    }
  }, [lastFetchedAt, items.length, isCacheValid]);
  
  return {
    /** Array of field type filters */
    items,
    /** Whether data is currently being fetched */
    loading,
    /** Error message if fetch failed, null otherwise */
    error,
    /** Whether any data has been successfully loaded */
    hasData,
    /** Timestamp of last successful fetch (ISO string) */
    lastFetchedAt,
    /** Whether cached data is still valid */
    isCacheValid: isCacheValid(),
    /** Manually trigger a refetch, bypassing cache */
    refetch,
    /** Clear the current error state */
    resetError: handleResetError,
  };
};

/**
 * Hook variant that returns a specific field type filter by ID
 * Automatically fetches all filters if not loaded
 * 
 * @param {number} id - The field type filter ID to retrieve
 * @param {UseFieldTypeFiltersOptions} options - Configuration options
 * @returns {Object} Specific filter and state
 */
export const useFieldTypeFilterById = (
  id: number,
  options?: UseFieldTypeFiltersOptions
) => {
  const { items, loading, error, refetch, resetError } = useFieldTypeFilters(options);
  
  const filter = items.find(item => item.id === id);
  
  return {
    filter,
    loading,
    error,
    refetch,
    resetError,
  };
};

/**
 * Hook variant that returns filters for a specific field type
 * Useful when you need all filters associated with a particular field type
 * 
 * @param {number} fieldTypeId - The field type ID to filter by
 * @param {UseFieldTypeFiltersOptions} options - Configuration options
 * @returns {Object} Filtered items and state
 */
export const useFieldTypeFiltersByFieldTypeId = (
  fieldTypeId: number,
  options?: UseFieldTypeFiltersOptions
) => {
  const { items, loading, error, refetch, resetError } = useFieldTypeFilters(options);
  
  const filteredItems = items.filter(item => item.field_type_id === fieldTypeId);
  
  return {
    items: filteredItems,
    loading,
    error,
    refetch,
    resetError,
  };
};
