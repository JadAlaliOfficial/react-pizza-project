// src/features/languages/hooks/useLanguages.ts
// Assumptions:
// - Redux store is properly configured with languagesSlice
// - This hook provides a clean interface for components to access languages
// - Handles fetching, loading states, and derived data

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch } from '@/store';
import {
  fetchLanguages,
  selectLanguages,
  selectLanguagesStatus,
  selectLanguagesError,
  selectDefaultLanguage,
  selectLanguagesLoaded,
  clearError,
} from '../store/languagesSlice';
import type { Language, ApiError } from '../types';

/**
 * Return type for useLanguages hook.
 */
interface UseLanguagesReturn {
  languages: Language[] | null;
  isLoading: boolean;
  isIdle: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: ApiError | null;
  defaultLanguage: Language | null;
  refetch: () => void;
  clearError: () => void;
}

/**
 * Options for useLanguages hook.
 */
interface UseLanguagesOptions {
  /**
   * Whether to fetch languages on mount.
   * @default true
   */
  fetchOnMount?: boolean;
  
  /**
   * Whether to refetch if data already exists.
   * @default false
   */
  refetchIfExists?: boolean;
}

/**
 * Custom hook to manage languages state and fetching.
 * 
 * Features:
 * - Automatic fetching on mount (configurable)
 * - Prevents duplicate requests
 * - Exposes loading/error states
 * - Provides refetch capability
 * - Returns default language
 * 
 * @param options - Configuration options
 * @returns Object with languages data, states, and actions
 * 
 * @example
 * ```
 * const { languages, isLoading, error, refetch } = useLanguages();
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 * 
 * return (
 *   <Select>
 *     {languages?.map(lang => (
 *       <option key={lang.id} value={lang.code}>{lang.name}</option>
 *     ))}
 *   </Select>
 * );
 * ```
 */
export const useLanguages = (options: UseLanguagesOptions = {}): UseLanguagesReturn => {
  const {
    fetchOnMount = true,
    refetchIfExists = false,
  } = options;

  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const languages = useSelector(selectLanguages);
  const status = useSelector(selectLanguagesStatus);
  const error = useSelector(selectLanguagesError);
  const defaultLanguage = useSelector(selectDefaultLanguage);
  const isLoaded = useSelector(selectLanguagesLoaded);

  // Derive boolean flags from status
  const isIdle = status === 'idle';
  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';
  const isError = status === 'failed';

  /**
   * Fetch or refetch languages.
   * Memoized to prevent unnecessary re-renders.
   */
  const refetch = useCallback(() => {
    console.log('[useLanguages] Manual refetch triggered');
    dispatch(fetchLanguages());
  }, [dispatch]);

  /**
   * Clear error state.
   * Useful for dismissing error messages in UI.
   */
  const handleClearError = useCallback(() => {
    console.log('[useLanguages] Clearing error');
    dispatch(clearError());
  }, [dispatch]);

  /**
   * Auto-fetch on mount based on options.
   * Respects fetchOnMount and refetchIfExists settings.
   */
  useEffect(() => {
    if (!fetchOnMount) {
      console.log('[useLanguages] fetchOnMount disabled, skipping auto-fetch');
      return;
    }

    // Don't fetch if already loading
    if (isLoading) {
      console.log('[useLanguages] Already loading, skipping fetch');
      return;
    }

    // Don't fetch if data exists unless refetchIfExists is true
    if (isLoaded && !refetchIfExists) {
      console.log('[useLanguages] Data already loaded, skipping fetch');
      return;
    }

    // Fetch if idle or refetchIfExists is true
    if (isIdle || refetchIfExists) {
      console.log('[useLanguages] Auto-fetching languages on mount');
      dispatch(fetchLanguages());
    }
  }, [dispatch, fetchOnMount, refetchIfExists, isIdle, isLoading, isLoaded]);

  return {
    languages,
    isLoading,
    isIdle,
    isSuccess,
    isError,
    error,
    defaultLanguage,
    refetch,
    clearError: handleClearError,
  };
};

/**
 * Simplified hook for cases where you just need languages data.
 * Auto-fetches on mount and returns the array directly.
 * 
 * @returns Language[] | null
 * 
 * @example
 * ```
 * const languages = useLanguagesData();
 * ```
 */
export const useLanguagesData = (): Language[] | null => {
  const { languages } = useLanguages();
  return languages;
};

/**
 * Hook to get just the default language.
 * Auto-fetches if needed.
 * 
 * @returns Language | null
 * 
 * @example
 * ```
 * const defaultLang = useDefaultLanguage();
 * console.log(defaultLang?.code); // "en"
 * ```
 */
export const useDefaultLanguage = (): Language | null => {
  const { defaultLanguage } = useLanguages();
  return defaultLanguage;
};

export default useLanguages;
