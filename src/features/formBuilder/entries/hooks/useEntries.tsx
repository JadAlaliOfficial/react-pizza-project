/**
 * /src/features/entries/hooks.ts
 * 
 * Custom React hooks for entries feature.
 * Provides convenient access to entries state, actions, and side effects with proper TypeScript typing.
 */

import { useCallback, useEffect, useMemo, useRef , useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks'; // Adjust path to your typed Redux hooks
import {
  fetchEntriesList,
  setQuery,
  updateQuery,
  clearError,
  resetEntriesState,
  selectEntriesData,
  selectEntriesPagination,
  selectEntriesStatus,
  selectEntriesError,
  selectLastQuery,
  selectIsLoading,
  selectHasError,
  selectHasData,
  selectTotalEntries,
  selectCurrentPage,
  selectTotalPages,
  selectHasNextPage,
  selectHasPreviousPage,
} from '../store/entriesSlice';
import type {
  EntriesListQuery,
  Entry,
  Pagination,
  NormalizedError,
  LoadingStatus,
} from '../types';

// ============================================================================
// Return Type Definitions
// ============================================================================

/**
 * Return type for useEntriesList hook
 * Provides complete access to entries state and operations
 */
interface UseEntriesListReturn {
  // Data
  entries: Entry[];
  pagination: Pagination | null;
  totalEntries: number;
  currentPage: number;
  totalPages: number;

  // Status
  status: LoadingStatus;
  isLoading: boolean;
  hasError: boolean;
  hasData: boolean;
  error: NormalizedError | null;

  // Navigation
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Query
  query: EntriesListQuery | null;

  // Actions
  setQuery: (query: EntriesListQuery) => void;
  updateQuery: (partialQuery: Partial<EntriesListQuery>) => void;
  refetch: () => void;
  clearError: () => void;
  reset: () => void;

  // Pagination helpers
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

/**
 * Options for useEntriesList hook
 */
interface UseEntriesListOptions {
  /**
   * Initial query to execute on mount
   * If not provided, no fetch will occur automatically
   */
  initialQuery?: EntriesListQuery;

  /**
   * Whether to fetch data automatically on mount
   * @default true if initialQuery is provided
   */
  autoFetch?: boolean;

  /**
   * Whether to refetch when query changes
   * @default true
   */
  refetchOnQueryChange?: boolean;
}

// ============================================================================
// Debounce Hook
// ============================================================================

/**
 * Custom debounce hook for optimizing rapid state changes.
 * Useful for text input filters to reduce API calls.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Debounced value that updates after the delay
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // API call with debouncedSearchTerm
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the timeout if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Main Entries Hook
// ============================================================================

/**
 * Primary hook for managing entries list state and operations.
 * Provides a complete interface for fetching, filtering, and paginating entries.
 * 
 * @param options - Configuration options for the hook
 * @returns Object with entries data, state, and control functions
 * 
 * @example
 * const {
 *   entries,
 *   pagination,
 *   isLoading,
 *   setQuery,
 *   goToPage
 * } = useEntriesList({
 *   initialQuery: {
 *     page: 1,
 *     per_page: 10,
 *     form_version_id: 77
 *   }
 * });
 */
export function useEntriesList(
  options: UseEntriesListOptions = {}
): UseEntriesListReturn {
  const {
    initialQuery,
    autoFetch = !!initialQuery,
    refetchOnQueryChange = true,
  } = options;

  const dispatch = useAppDispatch();

  // ========== Selectors ==========
  const entries = useAppSelector(selectEntriesData);
  const pagination = useAppSelector(selectEntriesPagination);
  const status = useAppSelector(selectEntriesStatus);
  const error = useAppSelector(selectEntriesError);
  const lastQuery = useAppSelector(selectLastQuery);
  const isLoading = useAppSelector(selectIsLoading);
  const hasError = useAppSelector(selectHasError);
  const hasData = useAppSelector(selectHasData);
  const totalEntries = useAppSelector(selectTotalEntries);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  const hasNextPage = useAppSelector(selectHasNextPage);
  const hasPreviousPage = useAppSelector(selectHasPreviousPage);

  // Track if initial fetch has been performed
  const initialFetchDone = useRef(false);

  // ========== Action Creators ==========

  /**
   * Sets a complete new query and triggers fetch if refetchOnQueryChange is true
   */
  const handleSetQuery = useCallback(
    (query: EntriesListQuery) => {
      dispatch(setQuery(query));
    },
    [dispatch]
  );

  /**
   * Updates query with partial changes and triggers fetch if refetchOnQueryChange is true
   */
  const handleUpdateQuery = useCallback(
    (partialQuery: Partial<EntriesListQuery>) => {
      dispatch(updateQuery(partialQuery));
    },
    [dispatch]
  );

  /**
   * Refetches data using the last query.
   * Useful for manual refresh or retry after error.
   */
  const refetch = useCallback(() => {
    if (lastQuery) {
      dispatch(fetchEntriesList(lastQuery));
    }
  }, [dispatch, lastQuery]);

  /**
   * Clears the current error state
   */
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Resets the entire entries state to initial values
   */
  const reset = useCallback(() => {
    dispatch(resetEntriesState());
    initialFetchDone.current = false;
  }, [dispatch]);

  // ========== Pagination Helpers ==========

  /**
   * Navigates to a specific page
   */
  const goToPage = useCallback(
    (page: number) => {
      if (lastQuery && page > 0 && page <= totalPages) {
        handleUpdateQuery({ page });
      }
    },
    [lastQuery, totalPages, handleUpdateQuery]
  );

  /**
   * Navigates to the next page if available
   */
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, goToPage]);

  /**
   * Navigates to the previous page if available
   */
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(currentPage - 1);
    }
  }, [hasPreviousPage, currentPage, goToPage]);

  // ========== Side Effects ==========

  /**
   * Initial fetch on mount if autoFetch is enabled
   */
  useEffect(() => {
    if (autoFetch && initialQuery && !initialFetchDone.current) {
      dispatch(setQuery(initialQuery));
      dispatch(fetchEntriesList(initialQuery));
      initialFetchDone.current = true;
    }
  }, []); // Intentionally empty: only run on mount

  /**
   * Refetch when lastQuery changes (if refetchOnQueryChange is enabled)
   * Skip if it's the initial fetch (handled above)
   */
  useEffect(() => {
    if (
      refetchOnQueryChange &&
      lastQuery &&
      initialFetchDone.current
    ) {
      dispatch(fetchEntriesList(lastQuery));
    }
  }, [lastQuery, refetchOnQueryChange, dispatch]);

  // ========== Return Value ==========

  return useMemo(
    () => ({
      // Data
      entries,
      pagination,
      totalEntries,
      currentPage,
      totalPages,

      // Status
      status,
      isLoading,
      hasError,
      hasData,
      error,

      // Navigation
      hasNextPage,
      hasPreviousPage,

      // Query
      query: lastQuery,

      // Actions
      setQuery: handleSetQuery,
      updateQuery: handleUpdateQuery,
      refetch,
      clearError: handleClearError,
      reset,

      // Pagination helpers
      goToPage,
      nextPage,
      previousPage,
    }),
    [
      entries,
      pagination,
      totalEntries,
      currentPage,
      totalPages,
      status,
      isLoading,
      hasError,
      hasData,
      error,
      hasNextPage,
      hasPreviousPage,
      lastQuery,
      handleSetQuery,
      handleUpdateQuery,
      refetch,
      handleClearError,
      reset,
      goToPage,
      nextPage,
      previousPage,
    ]
  );
}

// ============================================================================
// Additional Utility Hooks
// ============================================================================

/**
 * Simple hook for read-only access to entries data.
 * Useful when you only need to display data without control actions.
 * 
 * @returns Entries data and loading state
 */
export function useEntriesData() {
  const entries = useAppSelector(selectEntriesData);
  const isLoading = useAppSelector(selectIsLoading);
  const hasData = useAppSelector(selectHasData);

  return useMemo(
    () => ({
      entries,
      isLoading,
      hasData,
    }),
    [entries, isLoading, hasData]
  );
}

/**
 * Hook for entries pagination state only.
 * Useful for pagination UI components.
 * 
 * @returns Pagination data and navigation helpers
 */
export function useEntriesPagination() {
  const dispatch = useAppDispatch();
  const pagination = useAppSelector(selectEntriesPagination);
  const lastQuery = useAppSelector(selectLastQuery);
  const hasNextPage = useAppSelector(selectHasNextPage);
  const hasPreviousPage = useAppSelector(selectHasPreviousPage);

  const goToPage = useCallback(
    (page: number) => {
      if (lastQuery && pagination && page > 0 && page <= pagination.last_page) {
        dispatch(updateQuery({ page }));
      }
    },
    [dispatch, lastQuery, pagination]
  );

  return useMemo(
    () => ({
      pagination,
      hasNextPage,
      hasPreviousPage,
      goToPage,
    }),
    [pagination, hasNextPage, hasPreviousPage, goToPage]
  );
}

/**
 * Hook for entries error state.
 * Useful for error boundary or global error display components.
 * 
 * @returns Error state and clearError action
 */
export function useEntriesError() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectEntriesError);
  const hasError = useAppSelector(selectHasError);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return useMemo(
    () => ({
      error,
      hasError,
      clearError: handleClearError,
    }),
    [error, hasError, handleClearError]
  );
}
